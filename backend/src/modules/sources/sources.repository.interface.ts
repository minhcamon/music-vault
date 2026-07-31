import { Source } from '@prisma/client';
import { CreateSourceDTO, UpdateSourceDTO } from './sources.schema.js';
import { BaseRepository } from '../../shared/interfaces/repository.interface.js';

export interface ISourcesRepository extends BaseRepository<Source, CreateSourceDTO, UpdateSourceDTO> {
  findByPath(path: string): Promise<Source | null>;
  getStats(sourceId: string): Promise<{ totalSongs: number; missingSongs: number }>;
}
