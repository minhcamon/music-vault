import { PrismaClient, Song } from '@prisma/client';
import { ISongsRepository } from './songs.repository.interface.js';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';

export class SongsRepository implements ISongsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(query?: { search?: string; artistId?: string; albumId?: string; sourceId?: string }): Promise<Song[]> {
    const where: any = { missing: false };

    if (query?.artistId) where.artistId = query.artistId;
    if (query?.albumId) where.albumId = query.albumId;
    if (query?.sourceId) where.sourceId = query.sourceId;

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search } },
        { artist: { name: { contains: query.search } } },
        { album: { title: { contains: query.search } } },
      ];
    }

    return this.prisma.song.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, coverUrl: true } },
        source: { select: { id: true, name: true } },
      },
    });
  }

  async findById(id: string): Promise<Song | null> {
    return this.prisma.song.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, coverUrl: true } },
        source: { select: { id: true, name: true } },
      },
    });
  }

  async findByArtist(artist: string): Promise<Song[]> {
    return this.prisma.song.findMany({
      where: { artist: { name: { contains: artist } } },
      include: { artist: true, album: true },
    });
  }

  async findByAlbum(album: string): Promise<Song[]> {
    return this.prisma.song.findMany({
      where: { album: { title: { contains: album } } },
      include: { artist: true, album: true },
    });
  }

  async create(data: CreateSongDTO): Promise<Song> {
    return this.prisma.song.create({
      data: data as any,
    });
  }

  async update(id: string, data: UpdateSongDTO): Promise<Song> {
    return this.prisma.song.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.song.delete({
      where: { id },
    });
    return true;
  }
}
