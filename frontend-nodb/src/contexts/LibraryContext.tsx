import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { LibraryIndexer, type ScanOptions } from '../db/indexer';
import { isAudioFile } from '../utils/audioExtensions';
import type { Song, Album, Artist, StorageSource, Playlist } from '../types';

interface LibraryContextType {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  sources: StorageSource[];
  playlists: Playlist[];
  isScanning: boolean;
  scanProgress: { processed: number; total: number; currentFile: string };
  scanSource: (sourceId: string, options?: ScanOptions) => Promise<void>;
  addSource: (source: Omit<StorageSource, 'id'>) => Promise<string>;
  deleteSource: (sourceId: string) => Promise<void>;
  deleteAlbum: (albumId: string, albumTitle: string) => Promise<void>;
  deleteArtist: (artistId: string, artistName: string) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Filter out 'missing' songs and non-audio files so UI only displays valid audio tracks
  const songs =
    useLiveQuery(() =>
      db.songs
        .filter((s) => s.indexStatus !== 'missing' && isAudioFile(s.path || s.title || s.id))
        .toArray()
    ) || [];

  const albums = useLiveQuery(() => db.albums.toArray()) || [];
  const artists = useLiveQuery(() => db.artists.toArray()) || [];
  const sources = useLiveQuery(() => db.sources.toArray()) || [];
  const playlists = useLiveQuery(() => db.playlists.toArray()) || [];

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ processed: 0, total: 0, currentFile: '' });

  // Single-flight lock map to avoid overlapping sync promises on the same source
  const syncFlightMap = useRef<Map<string, Promise<void>>>(new Map());

  const addSource = async (newSource: Omit<StorageSource, 'id'>): Promise<string> => {
    const id = `src-${Date.now()}`;
    const source: StorageSource = { ...newSource, id };
    await db.sources.put(source);
    return id;
  };

  const deleteSource = async (sourceId: string) => {
    await db.sources.delete(sourceId);
    await db.songs.where('sourceId').equals(sourceId).delete();
  };

  const deleteAlbum = async (albumId: string, albumTitle: string) => {
    await db.albums.delete(albumId);
    await db.songs.where('album').equals(albumTitle).delete();
  };

  const deleteArtist = async (artistId: string, artistName: string) => {
    await db.artists.delete(artistId);
    await db.albums.where('artist').equals(artistName).delete();
    await db.songs.where('artist').equals(artistName).delete();
  };

  const deleteSong = async (songId: string) => {
    await db.songs.delete(songId);
  };

  const scanSource = async (sourceId: string, options?: ScanOptions): Promise<void> => {
    // Single-flight lock check
    if (syncFlightMap.current.has(sourceId)) {
      return syncFlightMap.current.get(sourceId)!;
    }

    const syncPromise = (async () => {
      const source = await db.sources.get(sourceId);
      if (!source) return;

      setIsScanning(true);
      try {
        await LibraryIndexer.scanSource(
          source,
          (processed, total, currentFile) => {
            setScanProgress({ processed, total, currentFile });
          },
          options
        );
      } catch (e) {
        console.error(`Scan source ${source.name} failed:`, e);
      } finally {
        setIsScanning(false);
        syncFlightMap.current.delete(sourceId);
      }
    })();

    syncFlightMap.current.set(sourceId, syncPromise);
    return syncPromise;
  };

  // Background Auto-Sync: Runs in idle after initial render for Cloud Sources
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log('[AutoSync] Device is offline, skipping background sync');
        return;
      }

      try {
        const cloudSources = await db.sources
          .filter((s) => s.enabled && s.type !== 'LOCAL')
          .toArray();

        const TEN_MINUTES_MS = 10 * 60 * 1000;
        const now = Date.now();

        for (const src of cloudSources) {
          const lastSync = src.lastSyncAt ? new Date(src.lastSyncAt).getTime() : 0;
          if (now - lastSync > TEN_MINUTES_MS) {
            console.log(`[AutoSync] Background checking incremental changes for ${src.name}...`);
            scanSource(src.id, { force: false }).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('[AutoSync] Background sync check encountered error:', e);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LibraryContext.Provider
      value={{
        songs,
        albums,
        artists,
        sources,
        playlists,
        isScanning,
        scanProgress,
        scanSource,
        addSource,
        deleteSource,
        deleteAlbum,
        deleteArtist,
        deleteSong,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
};
