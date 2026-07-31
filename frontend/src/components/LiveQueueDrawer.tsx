import React from 'react';
import { X, CheckSquare, Square, Music, Disc, ListMusic } from 'lucide-react';
import { Song } from '../services/api';

interface LiveQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentIndex: number;
  disabledSongIds: Set<string>;
  isPlaying: boolean;
  onToggleTrack: (songId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const LiveQueueDrawer: React.FC<LiveQueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  currentIndex,
  disabledSongIds,
  isPlaying,
  onToggleTrack,
  onSelectAll,
  onDeselectAll,
}) => {
  if (!isOpen) return null;

  const currentSong = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  const formatDuration = (secs?: number) => {
    if (!secs) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const enabledCount = queue.length - disabledSongIds.size;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex justify-end animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Glassmorphic Active Queue Drawer */}
      <div className="w-full max-w-md h-full bg-[#15171C]/95 border-l border-white/14 p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-text-primary">Hàng Chờ Đang Phát (Live Queue)</h3>
              <p className="text-[11px] font-mono text-emerald-400">
                Đang phát: {enabledCount}/{queue.length} bài hát
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Select / Deselect Action Banner */}
        <div className="my-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs shrink-0">
          <span className="text-text-secondary font-mono text-[11px]">Tích chọn bài để lặp</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAll}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-text-secondary hover:text-text-primary flex items-center gap-1 transition-all"
            >
              <CheckSquare className="w-3 h-3 text-emerald-400" />
              <span>Tất cả</span>
            </button>
            <button
              onClick={onDeselectAll}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-text-secondary hover:text-text-primary flex items-center gap-1 transition-all"
            >
              <Square className="w-3 h-3" />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>

        {/* Live Queue Tracklist */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-xs text-text-secondary">
              Chưa có bài hát trong hàng chờ phát nhạc.
            </div>
          ) : (
            queue.map((song, idx) => {
              const isCurrent = idx === currentIndex;
              const isDisabled = disabledSongIds.has(song.id);

              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-accent-primary/15 border-accent-primary/40 text-white shadow-accent-glow'
                      : isDisabled
                      ? 'bg-black/30 border-white/5 opacity-50'
                      : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.08] text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Live Checkbox Trigger */}
                    <button
                      type="button"
                      onClick={() => onToggleTrack(song.id)}
                      className="p-1 text-text-secondary hover:text-accent-primary shrink-0 transition-colors"
                      title={isDisabled ? 'Cho phép lặp bài này' : 'Bỏ qua bài này khi lặp'}
                    >
                      {!isDisabled ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-text-secondary" />
                      )}
                    </button>

                    {/* Track Number / Active Visualizer */}
                    <div className="w-6 text-center text-xs font-mono text-accent-primary font-bold shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-0.5 bg-accent-primary h-full animate-spectrum-1" />
                          <span className="w-0.5 bg-accent-primary h-full animate-spectrum-2" />
                          <span className="w-0.5 bg-accent-primary h-full animate-spectrum-3" />
                        </div>
                      ) : (
                        (idx + 1).toString().padStart(2, '0')
                      )}
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold truncate ${isCurrent ? 'text-accent-primary font-bold' : ''}`}>
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5">
                        {song.artist?.name || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <span className="text-xs font-mono text-text-secondary shrink-0">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-text-secondary text-center shrink-0">
          Tích chọn / Bỏ chọn bài hát hoạt động trực tiếp khi nhạc đang phát
        </div>
      </div>
    </div>
  );
};
