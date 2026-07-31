import { FastifyReply, FastifyRequest } from 'fastify';
import { BrowseService } from './browse.service.js';

export class BrowseController {
  constructor(private readonly browseService: BrowseService) {}

  async getDrives(request: FastifyRequest, reply: FastifyReply) {
    const drives = await this.browseService.getDrives();
    return reply.send({ success: true, data: drives });
  }

  async getDirectoryContents(
    request: FastifyRequest<{ Querystring: { path?: string } }>,
    reply: FastifyReply
  ) {
    const contents = await this.browseService.getDirectoryContents(request.query.path);
    return reply.send({ success: true, data: contents });
  }
}
