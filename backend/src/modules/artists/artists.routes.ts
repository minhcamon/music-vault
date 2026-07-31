import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ArtistsController } from './artists.controller.js';

export async function artistsRoutes(fastify: FastifyInstance, options: { controller: ArtistsController }) {
  const { controller } = options;

  fastify.get('/api/artists', (req: FastifyRequest, reply: FastifyReply) => controller.getAll(req, reply));
  fastify.get('/api/artists/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.getById(req, reply)
  );
}
