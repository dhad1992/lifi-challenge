import { FeeScraper } from "./FeeScraper";
import { Polygon } from "../blockchain/network/Polygon";
import { FeeCollectorContract } from "../blockchain/FeeCollectorContract";
import { BigNumber } from "ethers";
import { CollectedEventRepository } from "../repository/CollectedEventRepository";

const MOCK_PARSE_EVENTS = [
  {
    blockNumber: 1,
    token: "0xToken",
    integrator: "0xIntegrator",
    integratorFee: BigNumber.from("100"),
    lifiFee: BigNumber.from("200"),
  },

  {
    blockNumber: 2,
    token: "0xToken2",
    integrator: "0xIntegrator",
    integratorFee: BigNumber.from("100"),
    lifiFee: BigNumber.from("200"),
  },
  {
    blockNumber: 3,
    token: "0xToken3",
    integrator: "0xIntegrator",
    integratorFee: BigNumber.from("100"),
    lifiFee: BigNumber.from("200"),
  },
];
describe("FeeScraper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const subject = new FeeScraper(new Polygon());

  describe("bulkInsertEvents", () => {
    test("should call bulkInsert with correct arguments", async () => {
      const insertSpy = jest
        .spyOn(CollectedEventRepository.prototype, "bulkInsert")
        .mockResolvedValueOnce({} as any);
      const parsedEvents = [
        {
          blockNumber: 1,
          token: "0xToken",
          integrator: "0xIntegrator",
          integratorFee: BigNumber.from("100"),
          lifiFee: BigNumber.from("200"),
        },
      ];
      await subject.bulkInsertEvents(parsedEvents);

      expect(insertSpy).toHaveBeenCalledWith([
        {
          blockNumber: 1,
          chain: "POLYGON",
          integrator: "0xIntegrator",
          integratorFee: "100",
          lifiFee: "200",
          token: "0xToken",
        },
      ]);
    });
  });

  describe("getStartingBlockNumber", () => {
    test("When the last number from the database is 0 then use the default starting position", async () => {
      jest
        .spyOn(subject.repository, "getLastBlockNumberForNetwork")
        .mockResolvedValueOnce(0);
      const result = await subject.getStartingBlockNumber(subject.repository);
      expect(result).toEqual(61500000);
    });
    test("Should return the startingBlockNumber", async () => {
      jest
        .spyOn(subject.repository, "getLastBlockNumberForNetwork")
        .mockResolvedValueOnce(100);
      const result = await subject.getStartingBlockNumber(subject.repository);

      expect(result).toEqual(100);
    });
  });
  describe("scrapeFees", () => {
    describe("Under normal conditions", () => {
      test("should scrape blocks and insert events into the database", async () => {
        jest
          .spyOn(Polygon.prototype, "getLatestBlockNumber")
          .mockResolvedValue(2000);
        const startSpy = jest
          .spyOn(FeeScraper.prototype, "getStartingBlockNumber")
          .mockResolvedValueOnce(1);
        jest
          .spyOn(FeeCollectorContract.prototype, "parseFeeCollectorEvents")
          .mockReturnValueOnce(MOCK_PARSE_EVENTS)
          .mockReturnValueOnce(MOCK_PARSE_EVENTS);
        const insertSpy = jest
          .spyOn(FeeScraper.prototype, "bulkInsertEvents")
          .mockResolvedValueOnce({} as any)
          .mockResolvedValueOnce({} as any);
        await subject.scrapeFees();
        expect(insertSpy).toHaveBeenCalledWith(MOCK_PARSE_EVENTS);
        expect(insertSpy).toHaveBeenCalledTimes(2);
        expect(startSpy).toHaveBeenCalled();
      });
    });

    describe("Under error conditions", () => {
      describe("When the maximum number of attempts are exceeded", () => {
        beforeAll(() => {
          jest
            .spyOn(FeeCollectorContract.prototype, "getFeeCollectorEvents")
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"))
            .mockRejectedValueOnce(new Error("oops"));
        });
        test("should fail if the maximum number of attempts are exceeded", async () => {
          jest
            .spyOn(Polygon.prototype, "getLatestBlockNumber")
            .mockResolvedValue(2000);
          jest
            .spyOn(FeeScraper.prototype, "getStartingBlockNumber")
            .mockResolvedValueOnce(1);
          jest
            .spyOn(FeeCollectorContract.prototype, "parseFeeCollectorEvents")
            .mockReturnValueOnce(MOCK_PARSE_EVENTS)
            .mockReturnValueOnce(MOCK_PARSE_EVENTS);
          const insertSpy = jest
            .spyOn(FeeScraper.prototype, "bulkInsertEvents")
            .mockResolvedValueOnce({} as any)
            .mockResolvedValueOnce({} as any);
          await expect(subject.scrapeFees()).rejects.toThrow("oops");
          insertSpy.mockReset();
        });
      });
      describe("When the maximum number of errors are NOT exceeded", () => {
        beforeAll(() => {
          jest
            .spyOn(FeeCollectorContract.prototype, "getFeeCollectorEvents")
            .mockRejectedValueOnce(new Error("oops"));
        });
        test("should not fail if the maximum number of errors are not exceeded", async () => {
          jest
            .spyOn(Polygon.prototype, "getLatestBlockNumber")
            .mockResolvedValue(2000);
          const startSpy = jest
            .spyOn(FeeScraper.prototype, "getStartingBlockNumber")
            .mockResolvedValueOnce(1);
          jest
            .spyOn(FeeCollectorContract.prototype, "parseFeeCollectorEvents")
            .mockReturnValueOnce(MOCK_PARSE_EVENTS)
            .mockReturnValueOnce(MOCK_PARSE_EVENTS);
          const insertSpy = jest
            .spyOn(FeeScraper.prototype, "bulkInsertEvents")
            .mockResolvedValueOnce({} as any)
            .mockResolvedValueOnce({} as any);
          await subject.scrapeFees();
          expect(insertSpy).toHaveBeenCalledWith(MOCK_PARSE_EVENTS);
          expect(insertSpy).toHaveBeenCalledTimes(2);
          expect(startSpy).toHaveBeenCalled();
          insertSpy.mockReset();
        });
      });
    });
  });
});
