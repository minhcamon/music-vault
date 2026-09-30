export type SourceType = 'LOCAL' | 'GDRIVE' | 'S3' | 'WEBDAV';
export type IndexStatus = 'ok' | 'parse_failed' | 'missing';

export interface CoverRecord {
  id: string;        // SHA-1 hash of the resized image blob
  blob: Blob;        // Resized image blob (500x500 JPEG)
  mimeType: string;  // e.g. "image/jpeg"
}

export interface StorageSource {
  id: string;
  name: string;
  type: SourceType;
  config: Record<string, any>;
  enabled: boolean;
  lastScannedAt?: string;
  lastSyncAt?: string;
  lastSyncResult?: 'ok' | 'failed' | 'source_unreachable';
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
  remoteId?: string; // cloud file ID or relative path
  remoteFingerprint?: string; // md5Checksum or `${modifiedTime}:${size}`
  remoteSize?: number;
  remoteModifiedTime?: string;
  indexStatus?: IndexStatus;
  missingSince?: string;
  coverId?: string;  // references CoverRecord.id
  coverBlobUrl?: string; // Legacy temporary field for backward compatibility
  fileRef?: any;    // FileHandle / Cloud File Object reference for streaming
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  songCount: number;
  year?: number;
  coverId?: string;  // references CoverRecord.id
  coverBlobUrl?: string; // Legacy temporary field for backward compatibility
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

