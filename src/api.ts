import { bootstrap, getMongoConnection } from "./bootstrap";

async function startServer() {
  const server = await bootstrap();
  await getMongoConnection();
  const { PORT = "8080" } = process.env;
  await server.listen({ port: parseInt(PORT), host: "0.0.0.0" });
  console.log("FASTIFY LISTENING ", PORT);
}

startServer();
