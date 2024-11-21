import { BlockchainNetwork } from "./BlockchainNetwork";
import { Promise } from "mongoose";
import { FeeCollectorContract } from "../FeeCollectorContract";
import { ChainType } from "../../types";
import { getEnv } from "../../util/env";
import { ethers } from "ethers";

export class Polygon implements BlockchainNetwork {
  getFeeCollector(): FeeCollectorContract {
    return new FeeCollectorContract(
      ChainType.POLYGON,
      getEnv(
        "POLYGON_CONTRACT_ADDRESS",
        "0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9",
      ),
      getEnv("POLYGON_RPC", "https://polygon-rpc.com"),
    );
  }

  async getLatestBlockNumber(): Promise<number> {
    const provider = new ethers.providers.JsonRpcProvider(
      getEnv("POLYGON_RPC", "https://polygon-rpc.com"),
    );
    const blockNumber = await provider.getBlockNumber();
    return blockNumber;
  }
  getChainName() {
    return ChainType.POLYGON;
  }
}
