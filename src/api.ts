import { bootstrap, getMongoConnection } from "./bootstrap";
import {getEnv} from "./util/env";


/**
 * Start the server
 */
async function startServer() {
  const server = await bootstrap();
  await getMongoConnection();
  const PORT = getEnv('API_PORT', '8080')
  await server.listen({ port: parseInt(PORT), host: "0.0.0.0" });
  console.log("FASTIFY LISTENING ", PORT);
}

startServer();
