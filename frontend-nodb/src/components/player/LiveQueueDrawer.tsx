import React from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useUI } from '../../contexts/UIContext';
import { X, Play, Music, ListMusic, Volume2 } from 'lucide-react';

export const LiveQueueDrawer: React.FC = () => {
  const { queue, playSong, currentSong, isPlaying } = useAudio();
  const { isQueueDrawerOpen, setIsQueueDrawerOpen } = useUI();

  if (!isQueueDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#12141A]/95 border-l border-white/14 z-[60] p-6 flex flex-col justify-between shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300">
      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-vault-border pb-4">
          <div className="flex items-center gap-2 text-vault-text">
            <ListMusic className="w-5 h-5 text-vault-accent" />
            <h3 className="font-bold text-lg">Hàng đợi phát ({queue.length})</h3>
          </div>
          <button
            onClick={() => setIsQueueDrawerOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-vault-muted hover:text-vault-text transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Queue Items List */}
        {queue.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-vault-muted space-y-3 p-6">
            <Music className="w-12 h-12 text-vault-accent/40" />
            <p className="text-sm font-medium">Hàng đợi đang trống</p>
            <p className="text-xs text-vault-muted">
              Chọn bài hát bất kỳ từ danh sách để phát nhạc và nạp vào hàng đợi.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {queue.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={`${song.id}-${index}`}
                  onClick={() => playSong(song, queue)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-vault-accent/20 border border-vault-accent/50 shadow-lg shadow-vault-accent/10'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
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
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center text-vault-accent shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                    )}

                    <div className="overflow-hidden">
                      <div
                        className={`text-sm font-bold truncate ${
                          isCurrent ? 'text-vault-accent' : 'text-vault-text'
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="text-xs text-vault-muted truncate">{song.artist}</div>
                    </div>
                  </div>

                  <span className="bronze-badge text-[10px] px-1.5 py-0.5 rounded text-right shrink-0">
                    {song.bitrate || 'FLAC'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
