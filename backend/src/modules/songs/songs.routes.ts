import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SongsController } from './songs.controller.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';

export async function songsRoutes(fastify: FastifyInstance, options: { controller: SongsController }) {
  const { controller } = options;

  fastify.get('/api/songs', (req: FastifyRequest<{ Querystring: { search?: string; artistId?: string; albumId?: string; sourceId?: string } }>, reply: FastifyReply) =>
    controller.getAll(req, reply)
  );
  fastify.get('/api/songs/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.getById(req, reply)
  );
  fastify.get('/api/songs/:id/stream', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.stream(req, reply)
  );
  fastify.post('/api/songs', (req: FastifyRequest<{ Body: CreateSongDTO }>, reply: FastifyReply) =>
    controller.create(req, reply)
  );
  fastify.put('/api/songs/:id', (req: FastifyRequest<{ Params: { id: string }; Body: UpdateSongDTO }>, reply: FastifyReply) =>
    controller.update(req, reply)
  );
  fastify.delete('/api/songs/:id', (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) =>
    controller.delete(req, reply)
  );
}
