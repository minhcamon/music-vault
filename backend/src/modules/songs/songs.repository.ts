import { PrismaClient, Song } from '@prisma/client';
import { ISongsRepository } from './songs.repository.interface.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';

export class SongsRepository implements ISongsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Song[]> {
    return this.prisma.song.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Song | null> {
    return this.prisma.song.findUnique({
      where: { id },
    });
  }

  async findByArtist(artist: string): Promise<Song[]> {
    return this.prisma.song.findMany({
      where: { artist: { contains: artist } },
    });
  }

  async findByAlbum(album: string): Promise<Song[]> {
    return this.prisma.song.findMany({
      where: { album: { contains: album } },
    });
  }

  async create(data: CreateSongDTO): Promise<Song> {
    return this.prisma.song.create({
      data,
    });
  }

  async update(id: string, data: UpdateSongDTO): Promise<Song> {
    return this.prisma.song.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.song.delete({
      where: { id },
    });
    return true;
  }
}
