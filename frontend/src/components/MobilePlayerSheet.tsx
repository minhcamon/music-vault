import React from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Sparkles, Volume2, Disc } from 'lucide-react';
import { Track } from '../types';

interface MobilePlayerSheetProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePlayerSheet: React.FC<MobilePlayerSheetProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden glass-panel border-2 border-white/14 shadow-2xl p-2 relative">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
            alt={currentTrack.album}
            className="w-full h-full object-cover rounded-xl"
          />
          {isPlaying && (
            <div className="absolute top-4 right-4 bg-accent-primary text-white p-2 rounded-full shadow-accent-glow">
              <Disc className="w-5 h-5 animate-spin-slow" />
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
          <span className="opacity-70">· {currentTrack.bitrate} kbps</span>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2 mono-tech text-xs text-text-secondary">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
            <div className="h-full bg-accent-primary w-1/3 rounded-full" />
          </div>
          <div className="flex justify-between">
            <span>02:45</span>
            <span>09:22</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-8">
          <button className="text-text-secondary hover:text-text-primary p-2">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

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

          <button className="text-text-secondary hover:text-text-primary p-2">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-text-secondary justify-center pt-2">
          <Volume2 className="w-4 h-4" />
          <input type="range" className="w-48 accent-accent-primary" defaultValue={85} />
        </div>
      </div>
    </div>
  );
};
