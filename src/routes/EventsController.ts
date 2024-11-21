import { CollectedEventRepository } from "../repository/CollectedEventRepository";
import { FastifyReply, FastifyRequest } from "fastify";

export class EventsController {
  public async getEvents(
    request: FastifyRequest<{
      Querystring: { page: number; records: number; integrator: string };
    }>,
    reply: FastifyReply,
  ) {
    const eventRepository = new CollectedEventRepository();

    const page = request.query.page;
    const records = request.query.records ? request.query.records : 100;
    const query: any = {};

    if (request.query.integrator) {
      query.integrator = request.query.integrator;
    }

    const results = await eventRepository.query(
      query,
      records,
      page ? page * records : undefined,
    );

    return reply.send({
      events: results,
    });
  }
}
