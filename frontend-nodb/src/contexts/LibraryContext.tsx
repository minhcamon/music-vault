import React, { createContext, useContext, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { LibraryIndexer } from '../db/indexer';
import type { Song, Album, Artist, StorageSource, Playlist } from '../types';

interface LibraryContextType {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  sources: StorageSource[];
  playlists: Playlist[];
  isScanning: boolean;
  scanProgress: { processed: number; total: number; currentFile: string };
  scanSource: (sourceId: string) => Promise<void>;
  addSource: (source: Omit<StorageSource, 'id'>) => Promise<string>;
  deleteSource: (sourceId: string) => Promise<void>;
  deleteAlbum: (albumId: string, albumTitle: string) => Promise<void>;
  deleteArtist: (artistId: string, artistName: string) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const songs = useLiveQuery(() => db.songs.toArray()) || [];
  const albums = useLiveQuery(() => db.albums.toArray()) || [];
  const artists = useLiveQuery(() => db.artists.toArray()) || [];
  const sources = useLiveQuery(() => db.sources.toArray()) || [];
  const playlists = useLiveQuery(() => db.playlists.toArray()) || [];

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ processed: 0, total: 0, currentFile: '' });

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

  const scanSource = async (sourceId: string) => {
    const source = await db.sources.get(sourceId);
    if (!source) return;

    setIsScanning(true);
    try {
      await LibraryIndexer.scanSource(source, (processed, total, currentFile) => {
        setScanProgress({ processed, total, currentFile });
      });
    } catch (e) {
      console.error('Scan source failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

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
