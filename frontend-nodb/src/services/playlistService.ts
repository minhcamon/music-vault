import { db } from '../db/database';
import type { Playlist, CreatePlaylistDTO, UpdatePlaylistDTO } from '../types';

export class PlaylistService {
  /**
   * Tạo mới một Playlist
   */
  static async createPlaylist(dto: CreatePlaylistDTO): Promise<Playlist> {
    const trimmedName = dto.name.trim();
    if (!trimmedName) {
      throw new Error('Tên danh sách phát không được để trống.');
    }

    const now = new Date().toISOString();
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: trimmedName,
      description: dto.description?.trim() || undefined,
      coverId: dto.coverId,
      songIds: dto.initialSongIds || [],
      hiddenSongIds: [],
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.playlists.add(newPlaylist);
    return newPlaylist;
  }

  /**
   * Cập nhật thông tin Playlist
   */
  static async updatePlaylist(id: string, dto: UpdatePlaylistDTO): Promise<void> {
    const existing = await db.playlists.get(id);
    if (!existing) {
      throw new Error('Không tìm thấy danh sách phát.');
    }

    const updates: Partial<Playlist> = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (!trimmedName) {
        throw new Error('Tên danh sách phát không được để trống.');
      }
      updates.name = trimmedName;
    }

    if (dto.description !== undefined) {
      updates.description = dto.description.trim() || undefined;
    }

    if (dto.coverId !== undefined) {
      updates.coverId = dto.coverId;
    }

    if (dto.songIds !== undefined) {
      updates.songIds = dto.songIds;
    }

    if (dto.hiddenSongIds !== undefined) {
      updates.hiddenSongIds = dto.hiddenSongIds;
    }

    if (dto.isPinned !== undefined) {
      updates.isPinned = dto.isPinned;
    }

    await db.playlists.update(id, updates);
  }

  /**
   * Xóa Playlist
   */
  static async deletePlaylist(id: string): Promise<void> {
    await db.playlists.delete(id);
  }

  /**
   * Thêm một hoặc nhiều bài hát vào Playlist (không thêm trùng bài đã có)
   */
  static async addSongsToPlaylist(playlistId: string, newSongIds: string[]): Promise<void> {
    if (!newSongIds || newSongIds.length === 0) return;

    const playlist = await db.playlists.get(playlistId);
    if (!playlist) {
      throw new Error('Không tìm thấy danh sách phát.');
    }

    const currentSongIds = playlist.songIds || [];
    const songsToAdd = newSongIds.filter((id) => !currentSongIds.includes(id));

    if (songsToAdd.length === 0) return;

    const updatedSongIds = [...currentSongIds, ...songsToAdd];
    await db.playlists.update(playlistId, {
      songIds: updatedSongIds,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Xóa bài hát khỏi Playlist
   */
  static async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const playlist = await db.playlists.get(playlistId);
    if (!playlist) return;

    const updatedSongIds = (playlist.songIds || []).filter((id) => id !== songId);
    const updatedHiddenSongIds = (playlist.hiddenSongIds || []).filter((id) => id !== songId);

    await db.playlists.update(playlistId, {
      songIds: updatedSongIds,
      hiddenSongIds: updatedHiddenSongIds,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Đổi vị trí bài hát trong Playlist (Reorder)
   */
  static async reorderSongs(playlistId: string, fromIndex: number, toIndex: number): Promise<void> {
    const playlist = await db.playlists.get(playlistId);
    if (!playlist) return;

    const songIds = [...(playlist.songIds || [])];
    if (
      fromIndex < 0 ||
      fromIndex >= songIds.length ||
      toIndex < 0 ||
      toIndex >= songIds.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const [movedSongId] = songIds.splice(fromIndex, 1);
    songIds.splice(toIndex, 0, movedSongId);

    await db.playlists.update(playlistId, {
      songIds,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Bật/Tắt trạng thái ẩn bài hát trong Playlist
   */
  static async toggleHideSong(playlistId: string, songId: string): Promise<boolean> {
    const playlist = await db.playlists.get(playlistId);
    if (!playlist) return false;

    const hiddenSongIds = [...(playlist.hiddenSongIds || [])];
    const isCurrentlyHidden = hiddenSongIds.includes(songId);
    let updatedHiddenSongIds: string[];

    if (isCurrentlyHidden) {
      updatedHiddenSongIds = hiddenSongIds.filter((id) => id !== songId);
    } else {
      updatedHiddenSongIds = [...hiddenSongIds, songId];
    }

    await db.playlists.update(playlistId, {
      hiddenSongIds: updatedHiddenSongIds,
      updatedAt: new Date().toISOString(),
    });

    return !isCurrentlyHidden;
  }

  /**
   * Ghim / Bỏ ghim Playlist
   */
  static async togglePinPlaylist(playlistId: string): Promise<boolean> {
    const playlist = await db.playlists.get(playlistId);
    if (!playlist) return false;

    const newPinnedState = !playlist.isPinned;
    await db.playlists.update(playlistId, {
      isPinned: newPinnedState,
      updatedAt: new Date().toISOString(),
    });

    return newPinnedState;
  }
}
