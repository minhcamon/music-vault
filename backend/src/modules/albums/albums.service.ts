import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';

export class AlbumsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllAlbums() {
    return this.prisma.album.findMany({
      orderBy: { title: 'asc' },
      include: {
        artist: { select: { id: true, name: true } },
        _count: { select: { songs: true } },
      },
    });
  }

  async getAlbumById(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true } },
        songs: {
          where: { missing: false },
          orderBy: { trackNumber: 'asc' },
          include: { artist: { select: { id: true, name: true } } },
        },
      },
    });

    if (!album) {
      throw new NotFoundError(`Album with ID ${id} not found`);
    }

    return album;
  }
}
