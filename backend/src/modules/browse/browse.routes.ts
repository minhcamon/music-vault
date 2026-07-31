import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { BrowseController } from './browse.controller.js';

export async function browseRoutes(fastify: FastifyInstance, options: { controller: BrowseController }) {
  const { controller } = options;

  fastify.get('/api/browse/drives', (req: FastifyRequest, reply: FastifyReply) => controller.getDrives(req, reply));
  fastify.get('/api/browse', (req: FastifyRequest<{ Querystring: { path?: string } }>, reply: FastifyReply) =>
    controller.getDirectoryContents(req, reply)
  );
}
