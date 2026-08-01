import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useAudio } from '../../contexts/AudioContext';
import { X, Play, Music, Disc, User, Info } from 'lucide-react';

export const SongDetailModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedSong } = useUI();
  const { playSong, currentSong } = useAudio();

  if (activeModal !== 'song_detail' || !selectedSong) return null;

  const isCurrent = currentSong?.id === selectedSong.id;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-vault-border p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-vault-border pb-4">
          <h3 className="font-bold text-vault-text text-xl flex items-center gap-2">
            <Info className="w-5 h-5 text-vault-accent" /> Thông tin Bài Hát
          </h3>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg hover:bg-white/10 text-vault-muted hover:text-vault-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-6">
          {selectedSong.coverBlobUrl ? (
            <img
              src={selectedSong.coverBlobUrl}
              alt={selectedSong.title}
              className="w-36 h-36 rounded-2xl object-cover shadow-2xl border border-white/10"
            />
          ) : (
            <div className="w-36 h-36 rounded-2xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent">
              <Music className="w-16 h-16" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-vault-text leading-tight">
              {selectedSong.title}
            </h2>
            <p className="text-vault-muted text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-vault-accent" /> {selectedSong.artist}
            </p>
            <p className="text-vault-muted text-sm flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-vault-accent" /> {selectedSong.album}
            </p>

            <div className="pt-2">
              <span className="bronze-badge px-3 py-1 rounded-lg text-xs font-semibold">
                {selectedSong.bitrate || 'FLAC Lossless'}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-vault-border text-xs font-mono text-vault-muted">
          <div>
            Định dạng: <span className="text-vault-text font-bold">{selectedSong.format}</span>
          </div>
          <div>
            Thời lượng: <span className="text-vault-text font-bold">{Math.floor(selectedSong.duration)}s</span>
          </div>
          <div>
            Sample Rate: <span className="text-vault-text font-bold">{selectedSong.sampleRate || 44100} Hz</span>
          </div>
          <div>
            Bit Depth: <span className="text-vault-text font-bold">{selectedSong.bitDepth || 16} bit</span>
          </div>
          <div className="col-span-2 truncate">
            Path: <span className="text-vault-text">{selectedSong.path}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-vault-muted text-sm font-medium"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              playSong(selectedSong);
              setActiveModal('none');
            }}
            className="px-5 py-2.5 rounded-xl bg-vault-accent text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-vault-accent/30 hover:bg-vault-accent/90"
          >
            <Play className="w-4 h-4 fill-current" />
            {isCurrent ? 'Đang phát' : 'Phát bài này'}
          </button>
        </div>
      </div>
    </div>
  );
};
