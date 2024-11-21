import CollectedEventModel, { CollectedEvent } from "../model/CollectedEvent";
import { ChainType } from "../types";

export class CollectedEventRepository {
  constructor() {}

  public async query(args: any, max: number = 100, offset: number = 0) {
    return CollectedEventModel.find(args).limtest(max).skip(offset).exec();
  }

  public async getLastBlockNumberForNetwork(chain: ChainType) {
    const lastEvent = await CollectedEventModel.findOne({ chain })
      .sort({ blockNumber: -1 })
      .exec();
    return lastEvent ? lastEvent.blockNumber : 0;
  }

  public async bulkInsert(events: CollectedEvent[]) {
    return CollectedEventModel.insertMany(events);
  }
}
