import fs from 'fs';
import { Song } from '@prisma/client';
import { ISongsRepository } from './songs.repository.interface.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';
import { NotFoundError, AppError } from '../../shared/errors/app-error.js';

export class SongsService {
  constructor(private readonly songsRepository: ISongsRepository) {}

  async getAllSongs(query?: { search?: string; artistId?: string; albumId?: string; sourceId?: string }) {
    return this.songsRepository.findAll(query);
  }

  async getSongById(id: string): Promise<Song> {
    const song = await this.songsRepository.findById(id);
    if (!song) {
      throw new NotFoundError(`Song with ID ${id} not found`);
    }
    return song;
  }

  async getStreamInfo(id: string) {
    const song = await this.getSongById(id);
    if (song.missing || !fs.existsSync(song.fileUrl)) {
      throw new AppError(`File not available on disk: ${song.fileUrl}`, 404);
    }
    const stat = fs.statSync(song.fileUrl);
    return {
      song,
      filePath: song.fileUrl,
      fileSize: stat.size,
    };
  }

  async createSong(data: CreateSongDTO): Promise<Song> {
    return this.songsRepository.create(data);
  }

  async updateSong(id: string, data: UpdateSongDTO): Promise<Song> {
    await this.getSongById(id);
    return this.songsRepository.update(id, data);
  }

  async deleteSong(id: string): Promise<boolean> {
    await this.getSongById(id);
    return this.songsRepository.delete(id);
  }
}
