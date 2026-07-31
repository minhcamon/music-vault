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
      '.ogg': 'audio/ogg',
    };
    const contentType = contentTypeMap[ext] || 'audio/mpeg';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });

      reply.raw.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });

      return fileStream.pipe(reply.raw);
    } else {
      reply.raw.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      });

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
