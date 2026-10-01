import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { PlaylistService } from '../services/playlistService';
import type { Playlist, Song, PlaylistWithStats } from '../types';

export function usePlaylists() {
  const rawPlaylists = useLiveQuery(() => db.playlists.toArray()) || [];

  // Sắp xếp: Playlist được ghim lên đầu, sau đó sắp theo updatedAt giảm dần
  const playlists = useMemo(() => {
    return [...rawPlaylists].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [rawPlaylists]);

  /**
   * Tính toán thông số chi tiết của một Playlist kèm danh sách Song thực tế
   */
  const getPlaylistWithStats = (playlist: Playlist, allSongs: Song[]): PlaylistWithStats => {
    const songMap = new Map<string, Song>();
    allSongs.forEach((song) => songMap.set(song.id, song));

    const songIds = playlist.songIds || [];
    const hiddenSet = new Set(playlist.hiddenSongIds || []);

    const songs: Song[] = [];
    const validSongs: Song[] = [];
    const hiddenSongs: Song[] = [];
    let totalDuration = 0;

    songIds.forEach((id) => {
      const song = songMap.get(id);
      if (song) {
        songs.push(song);
        totalDuration += song.duration || 0;
        if (hiddenSet.has(id)) {
          hiddenSongs.push(song);
        } else {
          validSongs.push(song);
        }
      }
    });

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const formattedDuration =
      hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;

    return {
      ...playlist,
      songs,
      validSongs,
      hiddenSongs,
      totalDuration,
      formattedDuration,
    };
  };

  return {
    playlists,
    getPlaylistWithStats,
    createPlaylist: PlaylistService.createPlaylist,
    updatePlaylist: PlaylistService.updatePlaylist,
    deletePlaylist: PlaylistService.deletePlaylist,
    addSongsToPlaylist: PlaylistService.addSongsToPlaylist,
    removeSongFromPlaylist: PlaylistService.removeSongFromPlaylist,
    reorderSongs: PlaylistService.reorderSongs,
    toggleHideSong: PlaylistService.toggleHideSong,
    togglePinPlaylist: PlaylistService.togglePinPlaylist,
  };
}
