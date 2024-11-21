import { Polygon } from "./Polygon";
import { FeeCollectorContract } from "../FeeCollectorContract";
import { ChainType } from "../../types";
import { getEnv } from "../../util/env";
import { ethers } from "ethers";

jest.mock("../FeeCollectorContract");
jest.mock("../../util/env");

describe("Polygon", () => {
  let polygon: Polygon;

  beforeEach(() => {
    polygon = new Polygon();
  });

  describe("getFeeCollector", () => {
    test("should return a FeeCollectorContract instance wtesth correct parameters", () => {
      (getEnv as jest.Mock).mockImplementation(
        (key: string, defaultValue: string) => defaultValue,
      );
      const feeCollector = polygon.getFeeCollector();
      expect(feeCollector).toBeInstanceOf(FeeCollectorContract);
      expect(FeeCollectorContract).toHaveBeenCalledWith(
        ChainType.POLYGON,
        "0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9",
        "https://polygon-rpc.com",
      );
    });
  });

  describe("getLatestBlockNumber", () => {
    test("should call getBlockNumber and return the correct block number", async () => {
      const mockProvider = new ethers.providers.JsonRpcProvider();
      const mockBlockNumber = 12345;
      jest
        .spyOn(ethers.providers.JsonRpcProvider.prototype, "getBlockNumber")
        .mockResolvedValueOnce(mockBlockNumber);
      (getEnv as jest.Mock).mockReturnValue("https://polygon-rpc.com");
      const blockNumber = await polygon.getLatestBlockNumber();
      expect(mockProvider.getBlockNumber).toHaveBeenCalled();
      expect(blockNumber).toBe(mockBlockNumber);
    });
  });

  describe("getNetwork", () => {
    test("should return the correct network type", () => {
      const network = polygon.getChainName();
      expect(network).toBe(ChainType.POLYGON);
    });
  });
});
