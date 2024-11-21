import mongoose from "mongoose";
import { getEnv } from "./util/env";
import { fastify } from "fastify";
import events from "./routes/events";

export async function bootstrap() {
  const server = fastify();
  await events(server);
  return server;
}

export async function getMongoConnection() {
  const DB_USER = getEnv("MONGO_USER");
  const DB_PASSWORD = getEnv("MONGO_PASSWORD");
  const DB_PORT = 27017;
  const DB_NAME = getEnv("MONGO_DB");
  const DB_HOST = getEnv("MONGO_HOST");
  return mongoose.connect(
    `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`,
  );
}