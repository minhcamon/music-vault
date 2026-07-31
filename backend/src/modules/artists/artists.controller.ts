import { FastifyReply, FastifyRequest } from 'fastify';
import { ArtistsService } from './artists.service.js';

export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const artists = await this.artistsService.getAllArtists();
    return reply.send({ success: true, data: artists });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const artist = await this.artistsService.getArtistById(request.params.id);
    return reply.send({ success: true, data: artist });
  }
}
