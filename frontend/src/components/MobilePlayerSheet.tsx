import React from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Sparkles, Volume2, Disc, Repeat, Repeat1 } from 'lucide-react';
import { Track } from '../types';
import { RepeatMode } from '../hooks/useAudioPlayer';

interface MobilePlayerSheetProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onToggleRepeat: () => void;
  onSeek: (seconds: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePlayerSheet: React.FC<MobilePlayerSheetProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onToggleRepeat,
  onSeek,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const totalDuration = duration || currentTrack.duration || 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#15171C]/95 backdrop-blur-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-300">
      {/* Sheet Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-white/5 border border-white/10"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">Now Playing</span>
        <div className="bronze-badge px-2.5 py-1 rounded-full text-[11px]">
          {currentTrack.format}
        </div>
      </div>

      {/* Album Artwork Central Card */}
      <div className="my-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden glass-panel border-2 border-white/14 shadow-2xl p-4 flex items-center justify-center relative bg-black/40">
          <Disc className="w-24 h-24 text-accent-primary animate-spin-slow" />
          {isPlaying && (
            <div className="absolute top-4 right-4 bg-accent-primary text-white p-2 rounded-full shadow-accent-glow">
              <span className="w-3 h-3 block rounded-full bg-white animate-ping" />
            </div>
          )}
        </div>

        {/* Track Title & Artist */}
        <div className="text-center mt-6">
          <h2 className="font-display font-bold text-xl text-text-primary">{currentTrack.title}</h2>
          <p className="text-sm text-text-secondary mt-1">{currentTrack.artist} — {currentTrack.album}</p>
        </div>

        {/* Lossless Hi-Res Specs Pill */}
        <div className="mt-4 bronze-badge px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-bronze-glow">
          <Sparkles className="w-4 h-4" />
          <span>{currentTrack.format} {currentTrack.bitDepth} / {currentTrack.sampleRate}</span>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2 mono-tech text-xs text-text-secondary">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-accent-primary rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, (currentTime / totalDuration) * 100))}%` }}
            />
            <input
              type="range"
              min={0}
              max={totalDuration}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Repeat Button */}
          <button
            onClick={onToggleRepeat}
            className={`p-2 rounded-xl transition-all ${
              repeatMode !== 'off' ? 'bg-accent-primary text-white' : 'text-text-secondary'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
          </button>

          {/* Prev Track */}
          <button onClick={onPrevTrack} className="text-text-secondary hover:text-text-primary p-2">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-accent-glow"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button onClick={onNextTrack} className="text-text-secondary hover:text-text-primary p-2">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
