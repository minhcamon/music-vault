import React from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useUI } from '../../contexts/UIContext';
import { X, Play } from 'lucide-react';

export const LiveQueueDrawer: React.FC = () => {
  const { queue, queueIndex, playSong, currentSong } = useAudio();
  const { isQueueDrawerOpen, setIsQueueDrawerOpen } = useUI();

  if (!isQueueDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 glass-panel border-l border-vault-border z-50 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300">
      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-vault-border pb-4">
          <h3 className="font-bold text-vault-text text-lg">Hàng đợi phát ({queue.length})</h3>
          <button
            onClick={() => setIsQueueDrawerOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-vault-muted hover:text-vault-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {queue.map((song, index) => {
            const isPlayingThis = index === queueIndex || song.id === currentSong?.id;
            return (
              <div
                key={`${song.id}-${index}`}
                onClick={() => playSong(song, queue)}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  isPlayingThis ? 'bg-vault-accent/20 border border-vault-accent/40' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="text-xs font-mono text-vault-muted w-4">
                    {isPlayingThis ? <Play className="w-3.5 h-3.5 text-vault-accent fill-current" /> : index + 1}
                  </div>
                  <div className="overflow-hidden">
                    <div className={`text-sm font-semibold truncate ${isPlayingThis ? 'text-vault-accent' : 'text-vault-text'}`}>
                      {song.title}
                    </div>
                    <div className="text-xs text-vault-muted truncate">{song.artist}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
