import { Song } from '@prisma/client';
import { CreateSongDTO, UpdateSongDTO } from './songs.schema.js';
import { BaseRepository } from '../../shared/interfaces/repository.interface.js';

export interface ISongsRepository extends BaseRepository<Song, CreateSongDTO, UpdateSongDTO> {
  findByArtist(artist: string): Promise<Song[]>;
  findByAlbum(album: string): Promise<Song[]>;
}
