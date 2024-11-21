import { ParsedFeeCollectedEvents } from "../blockchain/FeeCollectorContract";
import { CollectedEventRepository } from "../repository/CollectedEventRepository";
import { CollectedEvent } from "../model/CollectedEvent";
import { BlockchainNetwork } from "../blockchain/network/BlockchainNetwork";
import { getEnv } from "./env";

export class FeeScraper {
  constructor(
    public network: BlockchainNetwork,
    public repository = new CollectedEventRepository(),
  ) {}

  /**
   * Bulk insert fee collected events into the database
   * @param parsedEvents
   */
  public async bulkInsertEvents(parsedEvents: ParsedFeeCollectedEvents[]) {
    const inserts = parsedEvents.map((event) => {
      const model = new CollectedEvent();
      model.integratorFee = event.integratorFee.toString();
      model.lifiFee = event.lifiFee.toString();
      model.blockNumber = event.blockNumber as number;
      model.chain = this.network.getChainName();
      model.integrator = event.integrator;
      model.token = event.token;
      return model;
    });
    await this.repository.bulkInsert(inserts);
  }

  public async getStartingBlockNumber(repository: CollectedEventRepository) {
    const lastParsedBlockNumber = await repository.getLastBlockNumberForNetwork(
      this.network.getChainName(),
    );
    return lastParsedBlockNumber == 0
      ? parseInt(getEnv("BLOCK_DEFAULT_START_NUMBER", "61500000"))
      : lastParsedBlockNumber;
  }

  /**
   * Scrape the fee collected events from the provided blockchain network
   *
   */
  public async scrapeFees() {
    const repository = new CollectedEventRepository();

    // Maximum number of failures before we stop the scraper, this is to prevent it from running indefinitely, errors could occur due to network issues or issues with the blockchain it self so we should retry
    const MAX_FAILURES = 10;
    let failureCount = 0;

    // Choose how many blocks we want to scan/scrape at a time, usually 1000 is the sweet spot
    const BLOCK_SCAN_SIZE = parseInt(getEnv("BLOCK_SCAN_SIZE", "1000"));

    // Get the latest block number on the network to see if we have any more to scan
    let latestBlockNumber = await this.network.getLatestBlockNumber();

    // Get the last parsed block number for the network to determine our starting position, if we don't have any use the default
    let currentBlockNumber = await this.getStartingBlockNumber(repository);

    console.log(
      `Running block scan, starting from ${currentBlockNumber}, scan size: ${BLOCK_SCAN_SIZE}`,
    );

    const feeCollector = this.network.getFeeCollector();

    while (currentBlockNumber <= latestBlockNumber) {
      try {
        // Get the fee collected events for BLOCK_SCAN_SIZE blocks
        const events = await feeCollector.getFeeCollectorEvents(
          currentBlockNumber,
          currentBlockNumber + BLOCK_SCAN_SIZE,
        );

        // parse the data into a format we can read
        const parsedEvents = feeCollector.parseFeeCollectorEvents(events);

        console.log(
          `Inserting ${parsedEvents.length} events current block ${currentBlockNumber}/${latestBlockNumber}`,
        );

        // Could we make this more optimal and potentially do a fire and forget? However, using that approach would present complexity as it could cause missing blocks as we are relying on the latest block
        await this.bulkInsertEvents(parsedEvents);

        // Because the block number has likely changed whilst were scraping we should update it with the latest
        latestBlockNumber = await this.network.getLatestBlockNumber();

        // we had some success so we can reset the failure count to 0
        failureCount = 0;
        currentBlockNumber += BLOCK_SCAN_SIZE;
      } catch (e) {
        console.error(e);
        console.error("Failed to scrape events");
        if (failureCount++ === MAX_FAILURES) {
          console.error("Failed too many times, stopping scraper");
          throw e;
        }
      }
    }
  }
}
