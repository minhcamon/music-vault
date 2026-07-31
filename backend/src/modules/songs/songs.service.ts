import { Song } from '@prisma/client';
import { ISongsRepository } from './songs.repository.interface.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

export class SongsService {
  constructor(private readonly songsRepository: ISongsRepository) {}

  async getAllSongs(): Promise<Song[]> {
    return this.songsRepository.findAll();
  }

  async getSongById(id: string): Promise<Song> {
    const song = await this.songsRepository.findById(id);
    if (!song) {
      throw new NotFoundError(`Song with ID ${id} not found`);
    }
    return song;
  }

  async createSong(data: CreateSongDTO): Promise<Song> {
    return this.songsRepository.create(data);
  }

  async updateSong(id: string, data: UpdateSongDTO): Promise<Song> {
    await this.getSongById(id); // Ensure existence
    return this.songsRepository.update(id, data);
  }

  async deleteSong(id: string): Promise<boolean> {
    await this.getSongById(id); // Ensure existence
    return this.songsRepository.delete(id);
  }
}
