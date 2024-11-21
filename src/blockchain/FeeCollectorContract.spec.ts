import {
  FeeCollectorContract,
  ParsedFeeCollectedEvents,
} from "./FeeCollectorContract";
import { BigNumber } from "ethers";
import { ChainType } from "../types";

describe("FeeCollectorContract", () => {
  let contract: FeeCollectorContract;
  const mockNetwork: ChainType = ChainType.POLYGON;
  const mockContractAddress = "0xContractAddress";
  const mockRpcAddress = "http://localhost:8545";

  beforeEach(() => {
    contract = new FeeCollectorContract(
      mockNetwork,
      mockContractAddress,
      mockRpcAddress,
    );
    contract.feeCollector = {
      filters: {
        FeesCollected: jest.fn(),
      },
      queryFilter: jest.fn(),
      interface: {
        parseLog: jest.fn(),
      },
    } as any;
  });

  describe("getFeeCollectorEvents", () => {
    it("should call queryFilter with correct arguments", async () => {
      const fromBlock = 0;
      const toBlock = 100;
      const mockFilter = { some: "filter" };
      (
        contract.feeCollector.filters.FeesCollected as jest.Mock
      ).mockReturnValueOnce(mockFilter);
      await contract.getFeeCollectorEvents(fromBlock, toBlock);
      expect(contract.feeCollector.filters.FeesCollected).toHaveBeenCalled();
      expect(contract.feeCollector.queryFilter).toHaveBeenCalledWith(
        mockFilter,
        0,
        100,
      );
    });
  });

  describe("parseFeeCollectorEvents", () => {
    it("should correctly parse events", () => {
      const mockEvents = [
        {
          blockNumber: 1,
          args: ["0xToken", "0xIntegrator", "100", "200"],
        },
      ];
      (
        contract["feeCollector"].interface.parseLog as jest.Mock
      ).mockReturnValue({
        args: mockEvents[0].args,
      });

      const parsedEvents = contract.parseFeeCollectorEvents(mockEvents as any);

      const expectedEvents: ParsedFeeCollectedEvents[] = [
        {
          blockNumber: 1,
          token: "0xToken",
          integrator: "0xIntegrator",
          integratorFee: BigNumber.from("100"),
          lifiFee: BigNumber.from("200"),
        },
      ];

      expect(parsedEvents).toEqual(expectedEvents);
    });
  });
});
