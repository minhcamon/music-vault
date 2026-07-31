import { PrismaClient, Source } from '@prisma/client';
import { ISourcesRepository } from './sources.repository.interface.js';
import { CreateSourceDTO, UpdateSourceDTO } from './sources.schema.js';

export class SourcesRepository implements ISourcesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Source[]> {
    return this.prisma.source.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });
  }

  async findById(id: string): Promise<Source | null> {
    return this.prisma.source.findUnique({
      where: { id },
    });
  }

  async findByPath(path: string): Promise<Source | null> {
    return this.prisma.source.findUnique({
      where: { path },
    });
  }

  async create(data: CreateSourceDTO): Promise<Source> {
    return this.prisma.source.create({
      data,
    });
  }

  async update(id: string, data: UpdateSourceDTO): Promise<Source> {
    return this.prisma.source.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.source.delete({
      where: { id },
    });
    return true;
  }

  async getStats(sourceId: string): Promise<{ totalSongs: number; missingSongs: number }> {
    const totalSongs = await this.prisma.song.count({ where: { sourceId } });
    const missingSongs = await this.prisma.song.count({ where: { sourceId, missing: true } });
    return { totalSongs, missingSongs };
  }
}
