import { BigNumber, ethers } from "ethers"; // please use ethers v5 to ensure compatibility
import { FeeCollector__factory } from "lifi-contract-typings";
import { BlockTag } from "@ethersproject/abstract-provider";
import { ChainType } from "../types";

export interface ParsedFeeCollectedEvents {
  token: string; // the address of the token that was collected
  integrator: string; // the integrator that triggered the fee collection
  integratorFee: BigNumber; // the share collector for the integrator
  lifiFee: BigNumber; // the share collected for lifi
  blockNumber: BlockTag;
}

export class FeeCollectorContract {
  feeCollector: ethers.Contract;
  constructor(
    public network: ChainType,
    contractAddress: string,
    rpcAddress: string,
  ) {
    this.feeCollector = new ethers.Contract(
      contractAddress,
      FeeCollector__factory.createInterface(),
      new ethers.providers.JsonRpcProvider(rpcAddress),
    );
  }
  /**
   * For a given block range all `FeesCollected` events are loaded from the chosen network FeeCollector
   * @param fromBlock
   * @param toBlock
   */
  async getFeeCollectorEvents(
    fromBlock: BlockTag,
    toBlock?: BlockTag,
  ): Promise<ethers.Event[]> {
    const filter = this.feeCollector.filters.FeesCollected();
    return this.feeCollector.queryFilter(filter, fromBlock, toBlock);
  }

  parseFeeCollectorEvents(events: ethers.Event[]): ParsedFeeCollectedEvents[] {
    return events.map((event) => {
      const parsedEvent = this.feeCollector.interface.parseLog(event);

      const feesCollected: ParsedFeeCollectedEvents = {
        blockNumber: event.blockNumber,
        token: parsedEvent.args[0],
        integrator: parsedEvent.args[1],
        integratorFee: BigNumber.from(parsedEvent.args[2]),
        lifiFee: BigNumber.from(parsedEvent.args[3]),
      };
      return feesCollected;
    });
  }
}
