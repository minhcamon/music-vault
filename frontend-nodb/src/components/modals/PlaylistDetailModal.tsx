import React, { useState, useMemo } from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useAudio } from '../../contexts/AudioContext';
import { usePlaylists } from '../../hooks/usePlaylists';
import { CoverImage } from '../common/CoverImage';
import {
  ListMusic,
  Play,
  Shuffle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Pin,
  Music,
  Search,
  ChevronUp,
  ChevronDown,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { Song } from '../../types';

export const PlaylistDetailModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedPlaylist,
    setSelectedPlaylist,
    setPlaylistToEdit,
    openConfirmModal,
  } = useUI();
  const { songs } = useLibrary();
  const { currentSong, isPlaying, playSong } = useAudio();
  const {
    playlists,
    getPlaylistWithStats,
    removeSongFromPlaylist,
    reorderSongs,
    toggleHideSong,
    togglePinPlaylist,
    deletePlaylist,
  } = usePlaylists();

  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(true);

  const isOpen = activeModal === 'playlist_detail' && !!selectedPlaylist;

  // Lấy dữ liệu playlist mới nhất từ live query
  const livePlaylist = useMemo(() => {
    if (!selectedPlaylist) return null;
    return playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;
  }, [playlists, selectedPlaylist]);

  const stats = useMemo(() => {
    if (!livePlaylist) return null;
    return getPlaylistWithStats(livePlaylist, songs);
  }, [livePlaylist, songs, getPlaylistWithStats]);

  const filteredSongs = useMemo(() => {
    if (!stats) return [];
    let list = stats.songs;

    if (!showHidden) {
      const hiddenSet = new Set(livePlaylist?.hiddenSongIds || []);
      list = list.filter((s) => !hiddenSet.has(s.id));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }

    return list;
  }, [stats, showHidden, search, livePlaylist]);

  if (!livePlaylist || !stats) return null;

  const hiddenCount = stats.hiddenSongs.length;
  const validCount = stats.validSongs.length;

  const handleClose = () => {
    setActiveModal('none');
    setSelectedPlaylist(null);
    setSearch('');
  };

  const handlePlayAll = () => {
    if (stats.validSongs.length > 0) {
      playSong(stats.validSongs[0], stats.validSongs);
    }
  };

  const handleShufflePlay = () => {
    if (stats.validSongs.length === 0) return;
    const shuffled = [...stats.validSongs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  const handlePlaySingle = (song: Song) => {
    // Phát bài hát đã chọn, kèm queue là toàn bộ bài hát trong playlist (hoặc validSongs)
    const queueList = stats.validSongs.some((s) => s.id === song.id)
      ? stats.validSongs
      : stats.songs;
    playSong(song, queueList);
  };

  const handleEdit = () => {
    setPlaylistToEdit(livePlaylist);
    setActiveModal('edit_playlist');
  };

  const handleDelete = () => {
    openConfirmModal({
      title: 'Xóa Danh Sách Phát',
      message: `Bạn có chắc chắn muốn xóa danh sách phát "${livePlaylist.name}"? (Các bài hát gốc trong thư viện sẽ không bị ảnh hưởng).`,
      confirmText: 'Xóa Danh Sách',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await deletePlaylist(livePlaylist.id);
        handleClose();
      },
    });
  };

  const handleTogglePin = async () => {
    await togglePinPlaylist(livePlaylist.id);
  };

  const handleToggleHide = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleHideSong(livePlaylist.id, songId);
  };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeSongFromPlaylist(livePlaylist.id, songId);
  };

  const handleMoveUp = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index <= 0) return;
    await reorderSongs(livePlaylist.id, index, index - 1);
  };

  const handleMoveDown = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index >= stats.songs.length - 1) return;
    await reorderSongs(livePlaylist.id, index, index + 1);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const coverSongs = stats.songs.filter((s) => !!s.coverId || !!s.coverBlobUrl).slice(0, 4);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden w-[96vw] sm:w-full p-4 sm:p-6 bg-vault-card/95 backdrop-blur-2xl border-white/15 shadow-2xl">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-vault-accent/20 border border-vault-accent/40 flex items-center justify-center text-vault-accent">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-xl font-bold text-vault-text flex items-center gap-2">
                  <span>{livePlaylist.name}</span>
                  {livePlaylist.isPinned && (
                    <Badge variant="bronze" className="text-[10px] px-2 py-0.5 gap-1">
                      <Pin className="w-3 h-3 fill-current text-amber-300" /> Đã ghim
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-[11px] sm:text-xs text-vault-muted">
                  Cập nhật: {new Date(livePlaylist.updatedAt || livePlaylist.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 mr-4 sm:mr-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={livePlaylist.isPinned ? 'default' : 'glass'}
                    size="icon-sm"
                    onClick={handleTogglePin}
                    className="rounded-xl"
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{livePlaylist.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="glass"
                    size="icon-sm"
                    onClick={handleEdit}
                    className="rounded-xl"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chỉnh sửa thông tin</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={handleDelete}
                    className="rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xóa playlist</TooltipContent>
              </Tooltip>
            </div>
          </DialogHeader>

          {/* Hero Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 py-3 border-b border-white/5">
            {/* Collage Cover Art Stage */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/15 shrink-0 bg-black/60 flex items-center justify-center p-1">
              {coverSongs.length >= 4 ? (
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 rounded-xl overflow-hidden">
                  {coverSongs.slice(0, 4).map((s, idx) => (
                    <div key={idx} className="relative w-full h-full bg-vault-accent/10">
                      <CoverImage
                        coverId={s.coverId}
                        coverBlobUrl={s.coverBlobUrl}
                        alt={s.title}
                        className="w-full h-full object-cover"
                        fallbackIcon={<Music className="w-4 h-4 text-vault-accent/50" />}
                      />
                    </div>
                  ))}
                </div>
              ) : coverSongs.length > 0 ? (
                <CoverImage
                  coverId={coverSongs[0].coverId}
                  coverBlobUrl={coverSongs[0].coverBlobUrl}
                  alt={livePlaylist.name}
                  className="w-full h-full object-cover rounded-xl"
                  fallbackIcon={<ListMusic className="w-12 h-12 text-vault-accent/60" />}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-vault-accent/20 via-black to-stone-900 flex items-center justify-center text-vault-accent">
                  <ListMusic className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Info & Main Actions */}
            <div className="flex-1 space-y-2.5">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-vault-text tracking-tight">
                  {livePlaylist.name}
                </h3>
                {livePlaylist.description && (
                  <p className="text-xs sm:text-sm text-vault-muted mt-1 leading-relaxed line-clamp-2">
                    {livePlaylist.description}
                  </p>
                )}
              </div>

              {/* Stats Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-xs">
                <Badge variant="outline" className="px-2.5 py-1 text-vault-text border-white/10">
                  {stats.songs.length} bài hát
                </Badge>
                {hiddenCount > 0 && (
                  <Badge variant="bronze" className="px-2.5 py-1 text-amber-300 gap-1">
                    <EyeOff className="w-3 h-3" /> {hiddenCount} bài bị ẩn
                  </Badge>
                )}
                <Badge variant="outline" className="px-2.5 py-1 text-vault-muted border-white/10 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {stats.formattedDuration}
                </Badge>
              </div>

              {/* Play All & Shuffle Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
                <Button
                  variant="default"
                  disabled={validCount === 0}
                  onClick={handlePlayAll}
                  className="rounded-xl gap-2 shadow-lg shadow-vault-accent/30 text-xs sm:text-sm font-semibold"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" /> Phát tất cả ({validCount})
                </Button>
                <Button
                  variant="glass"
                  disabled={validCount === 0}
                  onClick={handleShufflePlay}
                  className="rounded-xl gap-2 text-xs sm:text-sm"
                >
                  <Shuffle className="w-4 h-4" /> Phát ngẫu nhiên
                </Button>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-muted" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài hát trong danh sách..."
                className="pl-9 h-9 bg-white/5 border-white/10 rounded-xl text-xs focus:border-vault-accent"
              />
            </div>

            {/* Hidden Songs Toggle */}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowHidden(!showHidden)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  showHidden
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-white/5 border-white/10 text-vault-muted hover:text-vault-text'
                }`}
              >
                {showHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showHidden ? 'Đang hiện bài bị ẩn' : 'Đang giấu bài bị ẩn'}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">
                  {hiddenCount}
                </span>
              </button>
            )}
          </div>

          {/* Tracklist Table HUD */}
          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-1.5 min-h-[220px] max-h-[380px] my-1">
            {stats.songs.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                <Music className="w-8 h-8 text-vault-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-vault-muted font-medium">Danh sách phát này chưa có bài hát nào.</p>
                <p className="text-[11px] text-vault-muted/70 mt-1">
                  Hãy duyệt tab "Tất cả bài hát" hoặc "Albums" và nhấn "Thêm vào playlist".
                </p>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center py-8 text-xs text-vault-muted">
                Không tìm thấy bài hát nào khớp với từ khóa tìm kiếm.
              </div>
            ) : (
              filteredSongs.map((song) => {
                const isCurrentActive = currentSong?.id === song.id;
                const isHidden = (livePlaylist.hiddenSongIds || []).includes(song.id);
                // Tìm vị trí gốc trong toàn bộ mảng playlist để reorder chính xác
                const originalIndex = stats.songs.findIndex((s) => s.id === song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySingle(song)}
                    className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isCurrentActive
                        ? 'bg-vault-accent/20 border-vault-accent shadow-md shadow-vault-accent/15 text-vault-accent'
                        : isHidden
                        ? 'bg-black/30 border-white/5 opacity-40 hover:opacity-75'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    {/* Left: Reorder handles & Track Meta */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                      {/* Reorder Up/Down arrows */}
                      <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          disabled={originalIndex <= 0}
                          onClick={(e) => handleMoveUp(originalIndex, e)}
                          title="Di chuyển lên"
                          className="p-0.5 hover:text-vault-accent disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-[10px] text-vault-muted">
                          {originalIndex + 1}
                        </span>
                        <button
                          disabled={originalIndex >= stats.songs.length - 1}
                          onClick={(e) => handleMoveDown(originalIndex, e)}
                          title="Di chuyển xuống"
                          className="p-0.5 hover:text-vault-accent disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Song Cover Art Thumbnail */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-vault-accent/10 border border-white/10 shrink-0 relative flex items-center justify-center">
                        <CoverImage
                          coverId={song.coverId}
                          coverBlobUrl={song.coverBlobUrl}
                          alt={song.title}
                          fallbackIcon={<Music className="w-4 h-4 text-vault-accent/50" />}
                        />
                        {isCurrentActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-vault-accent animate-ping" />
                          </div>
                        )}
                      </div>

                      {/* Song Title, Artist, Album */}
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-2">
                          <h5
                            className={`font-semibold text-xs sm:text-sm truncate ${
                              isCurrentActive ? 'text-vault-accent font-bold' : isHidden ? 'line-through text-vault-muted' : 'text-vault-text'
                            }`}
                          >
                            {song.title}
                          </h5>
                          {isHidden && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Bị ẩn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-vault-muted truncate">
                          {song.artist} • <span className="opacity-80">{song.album}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Quality Badge, Duration (Idle) / Actions (Hover) */}
                    <div className="flex items-center justify-end shrink-0 min-w-[70px]">
                      <Badge
                        variant="bronze"
                        className="hidden md:inline-flex text-[10px] px-2 py-0.5 mr-3"
                      >
                        {song.format || 'Lossless'}
                      </Badge>

                      {/* Thời lượng: Mặc định hiện, ẩn khi rê chuột */}
                      <span className="font-mono text-xs text-vault-muted group-hover:hidden tabular-nums">
                        {formatTime(song.duration)}
                      </span>

                      {/* Cụm Action Buttons: Ẩn mặc định, xuất hiện thay thế thời lượng khi hover */}
                      <div className="hidden group-hover:flex items-center gap-1.5 transition-all duration-150 animate-in fade-in">
                        {/* Hide/Unhide Action Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => handleToggleHide(song.id, e)}
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                isHidden
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                                  : 'bg-white/5 border-white/10 text-vault-muted hover:text-vault-text hover:bg-white/15'
                              }`}
                            >
                              {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isHidden ? 'Bỏ ẩn bài hát này' : 'Ẩn bài hát (không phát khi Play All)'}
                          </TooltipContent>
                        </Tooltip>

                        {/* Remove from Playlist Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => handleRemoveSong(song.id, e)}
                              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-vault-muted hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Xóa khỏi danh sách phát</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
