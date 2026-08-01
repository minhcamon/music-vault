export type SourceType = 'LOCAL' | 'GDRIVE' | 'S3' | 'WEBDAV';

export interface StorageSource {
  id: string;
  name: string;
  type: SourceType;
  config: Record<string, any>;
  enabled: boolean;
  lastScannedAt?: string;
  songCount?: number;
  totalSize?: number;
}

export interface Song {
  id: string;
  sourceId: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  format: string;   // FLAC, MP3, WAV...
  bitrate?: string; // e.g. "24-bit / 96kHz"
  sampleRate?: number;
  bitDepth?: number;
  trackNumber?: number;
  discNumber?: number;
  genre?: string;
  year?: number;
  path: string;      // relative path or file ID
  coverBlobUrl?: string; // Blob URL created from extracted embedded cover art
  fileRef?: any;    // FileHandle / Cloud File Object reference for streaming
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  songCount: number;
  year?: number;
  coverBlobUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  songCount: number;
  albumCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackHistory {
  id: string;
  songId: string;
  playedAt: string;
}

export type ViewMode = 'songs' | 'albums' | 'artists' | 'playlists' | 'sources';

export type ActiveModal = 'none' | 'source_manager' | 'add_source' | 'album_detail' | 'song_detail' | 'create_playlist';
