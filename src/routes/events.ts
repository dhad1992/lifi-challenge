import { FastifyInstance } from "fastify";
import { EventsController } from "./EventsController";

const eventsController = new EventsController();
async function routes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/events",
    handler: eventsController.getEvents,
    schema: {
      querystring: {
        page: { type: "integer", minimum: 0 },
        records: { type: "integer", minimum: 1 },
        integrator: { type: "string" },
      },
    },
  });
}

export default routes;
