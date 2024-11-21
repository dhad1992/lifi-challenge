process.env.ENVIRONMENT = "test";
import mongoose from "mongoose";
import { getMongoConnection } from "./bootstrap";

describe("Bootstrap", () => {
  describe("getMongoConnection", () => {
    test("should call mongoose.connect with the correct connection string", async () => {
      const spy = jest
        .spyOn(mongoose, "connect")
        .mockResolvedValueOnce({} as any);

      await getMongoConnection();
      expect(spy).toHaveBeenCalledWith(
        "mongodb://MONGO_USER:MONGO_PASSWORD@MONGO_HOST:27017/MONGO_DB?authSource=admin",
      );
    });
  });
});
