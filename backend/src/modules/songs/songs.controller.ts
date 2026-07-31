import fs from 'fs';
import path from 'path';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SongsService } from './songs.service.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';

export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  async getAll(
    request: FastifyRequest<{ Querystring: { search?: string; artistId?: string; albumId?: string; sourceId?: string } }>,
    reply: FastifyReply
  ) {
    const songs = await this.songsService.getAllSongs(request.query);
    return reply.send({ success: true, data: songs });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const song = await this.songsService.getSongById(request.params.id);
    return reply.send({ success: true, data: song });
  }

  async stream(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { song, filePath, fileSize } = await this.songsService.getStreamInfo(request.params.id);

    const range = request.headers.range;
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.flac': 'audio/flac',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.mp4': 'audio/mp4',
      '.alac': 'audio/mp4',
      '.ogg': 'audio/ogg',
    };
    const contentType = contentTypeMap[ext] || 'audio/flac';

    // Set CORS & Range Expose headers for browser HTML5 Audio element
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization');
    reply.raw.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
    reply.raw.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        reply.raw.setHeader('Content-Range', `bytes */${fileSize}`);
        reply.raw.writeHead(416);
        return reply.raw.end();
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      reply.raw.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });

      reply.hijack();
      return fileStream.pipe(reply.raw);
    } else {
      reply.raw.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      });

      reply.hijack();
      return fs.createReadStream(filePath).pipe(reply.raw);
    }
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
