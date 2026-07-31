import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AlbumsController } from './albums.controller.js';

export async function albumsRoutes(fastify: FastifyInstance, options: { controller: AlbumsController }) {
  const { controller } = options;

  fastify.get('/api/albums', (req: FastifyRequest, reply: FastifyReply) => controller.getAll(req, reply));
  fastify.get('/api/albums/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.getById(req, reply)
  );
}
