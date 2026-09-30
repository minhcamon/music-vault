import Dexie, { type Table } from 'dexie';
import type { Song, Album, Artist, StorageSource, Playlist, PlaybackHistory, CoverRecord } from '../types';

export class MusicVaultDB extends Dexie {
  sources!: Table<StorageSource, string>;
  songs!: Table<Song, string>;
  albums!: Table<Album, string>;
  artists!: Table<Artist, string>;
  playlists!: Table<Playlist, string>;
  history!: Table<PlaybackHistory, string>;
  covers!: Table<CoverRecord, string>;

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

    this.version(2)
      .stores({
        sources: 'id, name, type, enabled',
        songs: 'id, sourceId, title, artist, album, duration, format, year, [sourceId+remoteId], indexStatus',
        albums: 'id, title, artist, year',
        artists: 'id, name',
        playlists: 'id, name, createdAt',
        history: 'id, songId, playedAt',
        covers: 'id',
      })
      .upgrade(async (tx) => {
        // Upgrade songs collection
        await tx.table('songs').toCollection().modify((song: any) => {
          song.indexStatus = 'ok';
          song.coverId = undefined;
          song.coverBlobUrl = undefined; // Clear old ephemeral blob URLs
          
          if (song.id && typeof song.id === 'string' && song.id.includes(':')) {
            const parts = song.id.split(':');
            song.remoteId = parts.slice(1).join(':');
          } else {
            song.remoteId = song.path || song.id;
          }
        });

        // Upgrade albums collection
        await tx.table('albums').toCollection().modify((album: any) => {
          album.coverId = undefined;
          album.coverBlobUrl = undefined;
        });
      });
  }
}

export const db = new MusicVaultDB();

