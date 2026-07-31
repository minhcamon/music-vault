import { FastifyReply, FastifyRequest } from 'fastify';
import { AlbumsService } from './albums.service.js';

export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const albums = await this.albumsService.getAllAlbums();
    return reply.send({ success: true, data: albums });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const album = await this.albumsService.getAlbumById(request.params.id);
    return reply.send({ success: true, data: album });
  }
}
