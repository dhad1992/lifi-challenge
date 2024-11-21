import CollectedEventModel, { CollectedEvent } from "../model/CollectedEvent";
import { ChainType } from "../types";

export class CollectedEventRepository {
  constructor() {}

  /**
   * Query collected events
   * @param args - any query arguments for mongo
   * @param max - maximum number of records to return
   * @param offset - offset to start from
   */
  public async query(args: any, max: number = 100, offset: number = 0) {
    return CollectedEventModel.find(args).limit(max).skip(offset).exec();
  }

  /**
   * Return the last block number we have stored for a given network
   * @param chain
   */
  public async getLastBlockNumberForNetwork(chain: ChainType) {
    const lastEvent = await CollectedEventModel.findOne({ chain })
      .sort({ blockNumber: -1 })
      .exec();
    return lastEvent ? lastEvent.blockNumber : 0;
  }

  /**
   * Bulk insert collected events
   * @param events
   */
  public async bulkInsert(events: CollectedEvent[]) {
    return CollectedEventModel.insertMany(events);
  }
}
