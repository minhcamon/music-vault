import React from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useUI } from '../../contexts/UIContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, ListMusic } from 'lucide-react';

export const PlayerDock: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    togglePlayPause,
    seek,
    playNext,
    playPrev,
  } = useAudio();

  const { isQueueDrawerOpen, setIsQueueDrawerOpen } = useUI();

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-dock px-6 flex items-center justify-between z-40">
      {/* Current Song Meta */}
      <div className="flex items-center gap-4 w-1/4">
        {currentSong.coverBlobUrl ? (
          <img
            src={currentSong.coverBlobUrl}
            alt={currentSong.title}
            className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent">
            <Music className="w-7 h-7" />
          </div>
        )}
        <div className="overflow-hidden">
          <h4 className="font-bold text-vault-text text-sm truncate">{currentSong.title}</h4>
          <p className="text-xs text-vault-muted truncate">{currentSong.artist}</p>
          <span className="bronze-badge text-[10px] px-1.5 py-0.2 rounded mt-1 inline-block">
            {currentSong.bitrate || 'FLAC Lossless'}
          </span>
        </div>
      </div>

      {/* Playback Controls & Seekbar */}
      <div className="flex flex-col items-center gap-2 w-2/4 max-w-xl">
        <div className="flex items-center gap-6">
          <button
            onClick={playPrev}
            className="text-vault-muted hover:text-vault-text transition-colors p-1"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-11 h-11 rounded-full bg-vault-accent text-white flex items-center justify-center shadow-lg shadow-vault-accent/40 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="text-vault-muted hover:text-vault-text transition-colors p-1"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Seekbar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs font-mono text-vault-muted w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-vault-accent"
          />
          <span className="text-xs font-mono text-vault-muted w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Queue Button */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-vault-muted hover:text-vault-text"
          >
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-vault-accent"
          />
        </div>

        <button
          onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
          className={`p-2 rounded-xl transition-colors ${
            isQueueDrawerOpen
              ? 'bg-vault-accent text-white'
              : 'bg-white/5 text-vault-muted hover:text-vault-text'
          }`}
          title="Hàng đợi phát nhạc"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
