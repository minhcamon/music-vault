import { FastifyReply, FastifyRequest } from 'fastify';
import { SourcesService } from './sources.service.js';
import { CreateSourceDTO, UpdateSourceDTO } from './sources.schema.js';

export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const sources = await this.sourcesService.getAllSources();
    return reply.send({ success: true, data: sources });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const source = await this.sourcesService.getSourceById(request.params.id);
    return reply.send({ success: true, data: source });
  }

  async create(request: FastifyRequest<{ Body: CreateSourceDTO }>, reply: FastifyReply) {
    const source = await this.sourcesService.createSource(request.body);
    return reply.status(201).send({ success: true, data: source });
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateSourceDTO }>, reply: FastifyReply) {
    const source = await this.sourcesService.updateSource(request.params.id, request.body);
    return reply.send({ success: true, data: source });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.sourcesService.deleteSource(request.params.id);
    return reply.send({ success: true, message: 'Source deleted successfully' });
  }

  async getStats(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const stats = await this.sourcesService.getSourceStats(request.params.id);
    return reply.send({ success: true, data: stats });
  }
}
