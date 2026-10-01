import React, { useState, useMemo } from 'react';
import { useUI } from '../contexts/UIContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { usePlaylists } from '../hooks/usePlaylists';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { Plus, ListMusic, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import type { Playlist } from '../types';

export const PlaylistsView: React.FC = () => {
  const { setActiveModal, setSelectedPlaylist, setPlaylistToEdit, openConfirmModal } = useUI();
  const { songs } = useLibrary();
  const { playSong } = useAudio();
  const { playlists, deletePlaylist, togglePinPlaylist, getPlaylistWithStats } = usePlaylists();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'songs'>('updated');

  const filteredPlaylists = useMemo(() => {
    let result = [...playlists];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      // Pinned always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi');
      }
      if (sortBy === 'songs') {
        return (b.songIds || []).length - (a.songIds || []).length;
      }
      // default: updated
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return result;
  }, [playlists, search, sortBy]);

  const handleCreateNew = () => {
    setPlaylistToEdit(null);
    setActiveModal('create_playlist');
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActiveModal('playlist_detail');
  };

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const stats = getPlaylistWithStats(playlist, songs);
    if (stats.validSongs.length > 0) {
      playSong(stats.validSongs[0], stats.validSongs);
    }
  };

  const handleEditPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylistToEdit(playlist);
    setActiveModal('edit_playlist');
  };

  const handleDeletePlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmModal({
      title: 'Xóa Danh Sách Phát',
      message: `Bạn có chắc chắn muốn xóa danh sách phát "${playlist.name}"? (Các bài hát gốc trong thư viện sẽ không bị ảnh hưởng).`,
      confirmText: 'Xóa Danh Sách',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await deletePlaylist(playlist.id);
      },
    });
  };

  const handleTogglePin = async (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinPlaylist(playlist.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-28">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-vault-text tracking-tight flex items-center gap-2.5">
              <ListMusic className="w-7 h-7 sm:w-8 sm:h-8 text-vault-accent" />
              Danh Sách Phát
            </h2>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-vault-accent/15 text-vault-accent font-semibold border border-vault-accent/30">
              {playlists.length} playlist
            </span>
          </div>
          <p className="text-xs sm:text-sm text-vault-muted mt-1">
            Tuyển tập âm nhạc cá nhân hóa, phân loại theo chủ đề và cảm xúc của bạn
          </p>
        </div>

        <Button
          variant="default"
          onClick={handleCreateNew}
          className="rounded-2xl gap-2 shadow-lg shadow-vault-accent/30 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tạo Playlist Mới
        </Button>
      </div>

      {/* Search & Sort Filters Bar */}
      {playlists.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl glass-panel">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-muted" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm danh sách phát..."
              className="pl-10 h-10 bg-white/5 border-white/10 rounded-xl text-xs focus:border-vault-accent"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-vault-muted shrink-0" />
            <span className="text-xs text-vault-muted hidden sm:inline">Sắp xếp:</span>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSortBy('updated')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  sortBy === 'updated'
                    ? 'bg-vault-accent text-white shadow-sm'
                    : 'text-vault-muted hover:text-vault-text'
                }`}
              >
                Gần đây
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  sortBy === 'name'
                    ? 'bg-vault-accent text-white shadow-sm'
                    : 'text-vault-muted hover:text-vault-text'
                }`}
              >
                Tên A-Z
              </button>
              <button
                onClick={() => setSortBy('songs')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  sortBy === 'songs'
                    ? 'bg-vault-accent text-white shadow-sm'
                    : 'text-vault-muted hover:text-vault-text'
                }`}
              >
                Số bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Playlist Grid */}
      {playlists.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl glass-panel border border-dashed border-white/15 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center text-vault-accent mx-auto mb-4 shadow-lg shadow-vault-accent/20">
            <ListMusic className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-vault-text">Chưa Có Danh Sách Phát Nào</h3>
          <p className="text-xs text-vault-muted mt-2 max-w-sm mx-auto leading-relaxed">
            Tạo playlist đầu tiên để gom nhóm các bản nhạc Hi-Res yêu thích của bạn theo thể loại, tâm trạng hoặc hoạt động.
          </p>
          <Button
            variant="default"
            onClick={handleCreateNew}
            className="mt-6 rounded-2xl gap-2 shadow-lg shadow-vault-accent/30"
          >
            <Plus className="w-4 h-4" /> Tạo Playlist Đầu Tiên
          </Button>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        /* No Search Match State */
        <div className="text-center py-12 px-4 rounded-3xl glass-panel border border-white/10">
          <Sparkles className="w-8 h-8 text-vault-muted mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-vault-text">Không tìm thấy danh sách phát phù hợp</h4>
          <p className="text-xs text-vault-muted mt-1">Vui lòng thử từ khóa tìm kiếm khác</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredPlaylists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              allSongs={songs}
              onSelect={() => handleSelectPlaylist(pl)}
              onPlay={(e) => handlePlayPlaylist(pl, e)}
              onEdit={(e) => handleEditPlaylist(pl, e)}
              onDelete={(e) => handleDeletePlaylist(pl, e)}
              onTogglePin={(e) => handleTogglePin(pl, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
