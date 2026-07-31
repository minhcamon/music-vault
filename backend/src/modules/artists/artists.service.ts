import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/app-error.js';

export class ArtistsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllArtists() {
    return this.prisma.artist.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { albums: true, songs: true },
        },
      },
    });
  }

  async getArtistById(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        albums: true,
        songs: {
          where: { missing: false },
          orderBy: { title: 'asc' },
          include: { album: { select: { id: true, title: true, coverUrl: true } } },
        },
      },
    });

    if (!artist) {
      throw new NotFoundError(`Artist with ID ${id} not found`);
    }

    return artist;
  }
}
