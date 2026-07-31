import React, { useState, useEffect } from 'react';
import { X, Play, Sparkles, Disc, CheckSquare, Square, ListFilter } from 'lucide-react';
import { Album } from '../types';
import { Song } from '../services/api';

interface AlbumDetailModalProps {
  album: Album | null;
  songs: Song[];
  onClose: () => void;
  onPlaySong: (song: Song, contextQueue?: Song[]) => void;
}

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  album,
  songs,
  onClose,
  onPlaySong,
}) => {
  const [checkedSongIds, setCheckedSongIds] = useState<Set<string>>(new Set());

  // Filter songs for this album and sort strictly by discNumber & trackNumber
  const albumSongs = songs
    .filter((s) => s.album?.title === album?.title || s.album?.id === album?.id)
    .sort((a, b) => {
      if ((a.discNumber || 1) !== (b.discNumber || 1)) {
        return (a.discNumber || 1) - (b.discNumber || 1);
      }
      if ((a.trackNumber || 0) !== (b.trackNumber || 0)) {
        return (a.trackNumber || 0) - (b.trackNumber || 0);
      }
      return a.title.localeCompare(b.title);
    });

  // Initialize all tracks checked by default when album opens
  useEffect(() => {
    if (albumSongs.length > 0) {
      setCheckedSongIds(new Set(albumSongs.map((s) => s.id)));
    }
  }, [album?.id, songs.length]);

  if (!album) return null;

  const toggleCheckTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setCheckedSongIds(new Set(albumSongs.map((s) => s.id)));
  };

  const handleDeselectAll = () => {
    setCheckedSongIds(new Set());
  };

  // Filter active queue to only include user checked tracks in exact album track order
  const getCheckedQueue = (): Song[] => {
    return albumSongs.filter((s) => checkedSongIds.has(s.id));
  };

  const handlePlaySelectedAlbum = () => {
    const checkedQueue = getCheckedQueue();
    if (checkedQueue.length > 0) {
      onPlaySong(checkedQueue[0], checkedQueue);
      onClose();
    } else {
      alert('Vui lòng tích chọn ít nhất 1 bài hát để đưa vào hàng chờ phát nhạc!');
    }
  };

  const handlePlaySingleSong = (song: Song) => {
    const checkedQueue = getCheckedQueue();
    // If the clicked song is checked, use checkedQueue; otherwise include it
    const activeQueue = checkedQueue.some((s) => s.id === song.id)
      ? checkedQueue
      : [song, ...checkedQueue];
    onPlaySong(song, activeQueue);
    onClose();
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const checkedCount = checkedSongIds.size;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-dock rounded-2xl w-full max-w-2xl p-6 border border-white/14 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 border border-white/14 shrink-0 flex items-center justify-center">
              {album.hasCover && album.coverUrl ? (
                <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
              ) : (
                <Disc className="w-8 h-8 text-accent-primary animate-spin-slow" />
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-lg lg:text-xl text-text-primary">{album.title}</h2>
              <p className="text-xs text-text-secondary mt-0.5">{album.artist} • {album.year}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="bronze-badge px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{album.format}</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Play Action Banner & Batch Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chọn tất cả</span>
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Bỏ chọn</span>
            </button>
          </div>

          <button
            onClick={handlePlaySelectedAlbum}
            className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primaryHover text-white text-xs font-semibold shadow-accent-glow flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
            <span>Phát Album ({checkedCount}/{albumSongs.length} bài)</span>
          </button>
        </div>

        {/* Tracklist Table ordered strictly by track number */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-accent-primary" />
              Tích chọn bài hát để tạo hàng chờ Loop
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              Đã chọn: {checkedCount}/{albumSongs.length} bài
            </span>
          </h3>

          {albumSongs.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary">
              Không tìm thấy danh sách bài hát chi tiết của album này.
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {albumSongs.map((song, index) => {
                const isChecked = checkedSongIds.has(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySingleSong(song)}
                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors group ${
                      isChecked ? 'hover:bg-white/[0.08]' : 'opacity-50 hover:opacity-80 bg-black/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={(e) => toggleCheckTrack(song.id, e)}
                        className="p-1 text-text-secondary hover:text-accent-primary shrink-0 transition-colors"
                        title={isChecked ? 'Bỏ chọn khỏi hàng chờ' : 'Chọn phát bài này'}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-text-secondary" />
                        )}
                      </button>

                      <span className="w-6 text-center text-xs font-mono text-accent-primary font-bold shrink-0">
                        {song.trackNumber ? song.trackNumber.toString().padStart(2, '0') : (index + 1).toString().padStart(2, '0')}
                      </span>

                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-text-secondary truncate">{song.artist?.name || album.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-text-secondary">{formatDuration(song.duration)}</span>
                      <button className="p-1.5 rounded-full bg-accent-primary text-white shadow-accent-glow opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
