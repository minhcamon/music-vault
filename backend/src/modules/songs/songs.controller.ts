import { FastifyReply, FastifyRequest } from 'fastify';
import { SongsService } from './songs.service.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';

export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const songs = await this.songsService.getAllSongs();
    return reply.send({ success: true, data: songs });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const song = await this.songsService.getSongById(request.params.id);
    return reply.send({ success: true, data: song });
  }

  async create(request: FastifyRequest<{ Body: CreateSongDTO }>, reply: FastifyReply) {
    const song = await this.songsService.createSong(request.body);
    return reply.status(201).send({ success: true, data: song });
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateSongDTO }>, reply: FastifyReply) {
    const song = await this.songsService.updateSong(request.params.id, request.body);
    return reply.send({ success: true, data: song });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.songsService.deleteSong(request.params.id);
    return reply.send({ success: true, message: 'Song deleted successfully' });
  }
}
