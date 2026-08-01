import React, { memo, useCallback, useRef } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useUI } from '../../contexts/UIContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { Song } from '../../types';
import { X, Play, Music, ListMusic, Volume2 } from 'lucide-react';

// ─── Memoized Row – only re-renders when its own props change ──────────────────
interface QueueRowProps {
  song: Song;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
}

const QueueRow = memo<QueueRowProps>(({ song, index, isCurrent, isPlaying, onPlay }) => (
  <div
    onClick={() => onPlay(song)}
    className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer ${
      isCurrent
        ? 'bg-vault-accent/20 border border-vault-accent/50'
        : 'hover:bg-white/5 border border-transparent'
    }`}
    // Only transition color-related properties, not ALL (avoids layout recalc)
    style={{ transition: 'background-color 150ms ease, border-color 150ms ease' }}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="text-xs font-mono text-vault-muted w-5 flex justify-center shrink-0">
        {isCurrent ? (
          isPlaying ? (
            <Volume2 className="w-4 h-4 text-vault-accent animate-pulse" />
          ) : (
            <Play className="w-4 h-4 text-vault-accent fill-current" />
          )
        ) : (
          index + 1
        )}
      </div>

      {song.coverBlobUrl ? (
        <img
          src={song.coverBlobUrl}
          alt={song.title}
          loading="lazy"
          decoding="async"
          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center text-vault-accent shrink-0">
          <Music className="w-5 h-5" />
        </div>
      )}

      <div className="overflow-hidden">
        <div className={`text-sm font-bold truncate ${isCurrent ? 'text-vault-accent' : 'text-vault-text'}`}>
          {song.title}
        </div>
        <div className="text-xs text-vault-muted truncate">{song.artist}</div>
      </div>
    </div>

    <span className="bronze-badge text-[10px] px-1.5 py-0.5 rounded shrink-0">
      {song.bitrate || 'FLAC'}
    </span>
  </div>
));

QueueRow.displayName = 'QueueRow';

// ─── Main Drawer ───────────────────────────────────────────────────────────────
export const LiveQueueDrawer: React.FC = () => {
  const { queue, playSong, currentSong, isPlaying } = useAudio();
  const { isQueueDrawerOpen, setIsQueueDrawerOpen } = useUI();

  // Stable callback reference – prevents re-creates on every render
  const handlePlay = useCallback(
    (song: Song) => playSong(song, queue),
    [playSong, queue]
  );

  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, () => setIsQueueDrawerOpen(false), isQueueDrawerOpen);

  if (!isQueueDrawerOpen) return null;

  return (
    // ▸ backdrop-blur moved to a pseudo-layer so it doesn't re-paint on scroll
    // ▸ will-change: transform → promotes this entire panel to its own GPU layer
    <div
      ref={panelRef}
      className="fixed inset-y-0 right-0 w-full sm:w-96 z-[60] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      style={{ willChange: 'transform' }}
    >
      {/* Blurred background as a separate non-scrolling layer */}
      <div className="absolute inset-0 bg-[#0E1015]/65 backdrop-blur-3xl border-l border-white/10 pointer-events-none" />

      {/* Scrollable content layer – no blur, no heavy effects */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vault-border pb-4 shrink-0">
          <div className="flex items-center gap-2 text-vault-text">
            <ListMusic className="w-5 h-5 text-vault-accent" />
            <h3 className="font-bold text-lg">Hàng đợi phát ({queue.length})</h3>
          </div>
          <button
            onClick={() => setIsQueueDrawerOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-vault-muted hover:text-vault-text cursor-pointer"
            style={{ transition: 'background-color 150ms ease' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        {queue.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-vault-muted space-y-3 p-6">
            <Music className="w-12 h-12 text-vault-accent/40" />
            <p className="text-sm font-medium">Hàng đợi đang trống</p>
            <p className="text-xs">Chọn bài hát bất kỳ từ danh sách để phát nhạc.</p>
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-1"
            // scrollbar hidden via CSS, overscroll contained to prevent parent scroll bleed
            style={{
              overscrollBehavior: 'contain',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch', // momentum scroll on iOS
            }}
          >
            {queue.map((song, index) => (
              <QueueRow
                key={song.id}
                song={song}
                index={index}
                isCurrent={currentSong?.id === song.id}
                isPlaying={isPlaying}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
