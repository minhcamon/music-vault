import React, { memo, useCallback } from 'react';
import { X, CheckSquare, Square, ListMusic } from 'lucide-react';
import { Song } from '../services/api';

// Đặt ngoài component → không tạo lại mỗi render
const formatDuration = (secs?: number): string => {
  if (!secs) return '00:00';
  const mins = Math.floor(secs / 60);
  const remainder = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

// ─── Memoized Row ──────────────────────────────────────────────────────────────
interface QueueItemProps {
  song: Song;
  idx: number;
  isCurrent: boolean;
  isDisabled: boolean;
  isPlaying: boolean;
  onToggle: (id: string) => void;
}

const QueueItem = memo<QueueItemProps>(({ song, idx, isCurrent, isDisabled, isPlaying, onToggle }) => {
  const handleToggle = useCallback(() => onToggle(song.id), [onToggle, song.id]);

  return (
    <div
      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
        isCurrent
          ? 'bg-accent-primary/15 border-accent-primary/40 text-white shadow-accent-glow'
          : isDisabled
          ? 'bg-black/30 border-white/5 opacity-50'
          : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.08] text-text-primary'
      }`}
      // transition chỉ áp trên màu, không watch toàn bộ CSS
      style={{ transition: 'background-color 150ms, border-color 150ms, opacity 150ms' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className="p-1 text-text-secondary hover:text-accent-primary shrink-0"
          style={{ transition: 'color 150ms' }}
          title={isDisabled ? 'Cho phép lặp bài này' : 'Bỏ qua bài này khi lặp'}
        >
          {!isDisabled ? (
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          ) : (
            <Square className="w-4 h-4 text-text-secondary" />
          )}
        </button>

        {/* Track Number / Spectrum */}
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
});
QueueItem.displayName = 'QueueItem';

// ─── Main Drawer ───────────────────────────────────────────────────────────────
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

  const enabledCount = queue.length - disabledSongIds.size;

  return (
    // Bỏ backdrop-blur-xl → dùng bg đậm hơn thay thế, tránh GPU stall khi scroll
    <div className="fixed inset-0 z-50 backdrop-blur-xl flex justify-end animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel — GPU layer riêng */}
      <div
        className="w-full max-w-md h-full bg-[#12141A]/98 border-l border-white/14 p-4 sm:p-6 flex flex-col shadow-2xl"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
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
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg bg-white/5 hover:bg-white/10"
            style={{ transition: 'background-color 150ms, color 150ms' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Select / Deselect All */}
        <div className="my-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs shrink-0">
          <span className="text-text-secondary font-mono text-[11px]">Tích chọn bài để lặp</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAll}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-text-secondary hover:text-text-primary flex items-center gap-1"
              style={{ transition: 'background-color 150ms, color 150ms' }}
            >
              <CheckSquare className="w-3 h-3 text-emerald-400" />
              <span>Tất cả</span>
            </button>
            <button
              onClick={onDeselectAll}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-text-secondary hover:text-text-primary flex items-center gap-1"
              style={{ transition: 'background-color 150ms, color 150ms' }}
            >
              <Square className="w-3 h-3" />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>

        {/* Queue List — contain:strict giúp browser không repaint ngoài vùng này */}
        <div
          className="flex-1 overflow-y-auto space-y-2 pr-1 my-2"
          style={{ contain: 'strict', willChange: 'scroll-position' }}
        >
          {queue.length === 0 ? (
            <div className="text-center py-12 text-xs text-text-secondary">
              Chưa có bài hát trong hàng chờ phát nhạc.
            </div>
          ) : (
            queue.map((song, idx) => (
              <QueueItem
                key={`${song.id}-${idx}`}
                song={song}
                idx={idx}
                isCurrent={idx === currentIndex}
                isDisabled={disabledSongIds.has(song.id)}
                isPlaying={isPlaying}
                onToggle={onToggleTrack}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
