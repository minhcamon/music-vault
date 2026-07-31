import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SourcesController } from './sources.controller.js';
import { CreateSourceDTO, UpdateSourceDTO } from './sources.schema.js';

export async function sourcesRoutes(fastify: FastifyInstance, options: { controller: SourcesController }) {
  const { controller } = options;

  fastify.get('/api/sources', (req: FastifyRequest, reply: FastifyReply) => controller.getAll(req, reply));
  fastify.get('/api/sources/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.getById(req, reply)
  );
  fastify.post('/api/sources', (req: FastifyRequest<{ Body: CreateSourceDTO }>, reply: FastifyReply) =>
    controller.create(req, reply)
  );
  fastify.patch('/api/sources/:id', (req: FastifyRequest<{ Params: { id: string }; Body: UpdateSourceDTO }>, reply: FastifyReply) =>
    controller.update(req, reply)
  );
  fastify.delete('/api/sources/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.delete(req, reply)
  );
  fastify.get('/api/sources/:id/stats', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.getStats(req, reply)
  );
}
