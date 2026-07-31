import React from 'react';
import { X, Play, Music, Sparkles, Disc } from 'lucide-react';
import { Album } from '../types';
import { Song } from '../services/api';

interface AlbumDetailModalProps {
  album: Album | null;
  songs: Song[];
  onClose: () => void;
  onPlaySong: (song: Song) => void;
}

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  album,
  songs,
  onClose,
  onPlaySong,
}) => {
  if (!album) return null;

  // Filter songs for this album and sort strictly by discNumber & trackNumber (Track 1, Track 2, Track 3...)
  const albumSongs = songs
    .filter((s) => s.album?.title === album.title || s.album?.id === album.id)
    .sort((a, b) => {
      if ((a.discNumber || 1) !== (b.discNumber || 1)) {
        return (a.discNumber || 1) - (b.discNumber || 1);
      }
      if ((a.trackNumber || 0) !== (b.trackNumber || 0)) {
        return (a.trackNumber || 0) - (b.trackNumber || 0);
      }
      return a.title.localeCompare(b.title);
    });

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

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
              <div className="mt-2 bronze-badge px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{album.format}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracklist Table ordered strictly by track number */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center justify-between">
            <span>Danh sách bài hát ({albumSongs.length} bài)</span>
            <span className="text-[10px] text-accent-primary">Thứ tự Album chính xác</span>
          </h3>

          {albumSongs.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-secondary">
              Không tìm thấy danh sách bài hát chi tiết của album này.
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {albumSongs.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-white/[0.08] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
