import { FeeCollectorContract } from "../FeeCollectorContract";
import { ChainType } from "../../types";

export interface BlockchainNetwork {
  getFeeCollector: () => FeeCollectorContract;
  getLatestBlockNumber: () => Promise<number>;
  getChainName: () => ChainType;
}
