import Dexie, { type Table } from 'dexie';
import type { Song, Album, Artist, StorageSource, Playlist, PlaybackHistory } from '../types';

export class MusicVaultDB extends Dexie {
  sources!: Table<StorageSource, string>;
  songs!: Table<Song, string>;
  albums!: Table<Album, string>;
  artists!: Table<Artist, string>;
  playlists!: Table<Playlist, string>;
  history!: Table<PlaybackHistory, string>;

  constructor() {
    super('MusicVaultClientDB');
    this.version(1).stores({
      sources: 'id, name, type, enabled',
      songs: 'id, sourceId, title, artist, album, duration, format, year',
      albums: 'id, title, artist, year',
      artists: 'id, name',
      playlists: 'id, name, createdAt',
      history: 'id, songId, playedAt',
    });
  }
}

export const db = new MusicVaultDB();
