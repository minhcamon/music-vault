import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Maximize2,
  Repeat,
  Shuffle
} from 'lucide-react';
import { Track } from '../types';

interface PlayerDockProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenMobileSheet: () => void;
}

export const PlayerDock: React.FC<PlayerDockProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onOpenMobileSheet,
}) => {
  const [progress, setProgress] = useState(165); // 02:45 in seconds out of 562s (09:22)
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-3 lg:bottom-6 left-3 right-3 lg:left-1/2 lg:-translate-x-1/2 lg:w-[94%] max-w-6xl z-40">
      <div className="glass-dock rounded-2xl p-3 lg:p-4 flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-6 border border-white/14 shadow-2xl">
        
        {/* Track Metadata & Cover Thumbnail */}
        <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0 justify-between md:justify-start">
          <div 
            onClick={onOpenMobileSheet} 
            className="flex items-center gap-3 cursor-pointer min-w-0"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/14 shrink-0 relative">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80"
                alt={currentTrack.album}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="font-display font-bold text-sm text-text-primary truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {currentTrack.artist} — <span className="italic">{currentTrack.album}</span>
              </p>
            </div>
          </div>

          {/* Mobile Fullscreen Sheet Trigger Icon */}
          <button 
            onClick={onOpenMobileSheet} 
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            aria-label="Mở khung phát toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Controls & Seekbar with Buffer Range */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-2">
          {/* Main Control Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-text-secondary hover:text-text-primary text-xs p-1">
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="text-text-secondary hover:text-text-primary p-1">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-accent-glow hover:scale-105 transition-transform"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button className="text-text-secondary hover:text-text-primary p-1">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button className="text-text-secondary hover:text-text-primary text-xs p-1">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Seekbar with Buffer Range & Timestamps */}
          <div className="w-full flex items-center gap-3 text-xs mono-tech text-text-secondary">
            <span>{formatTime(progress)}</span>
            <div className="flex-1 relative h-2 group cursor-pointer">
              {/* Seekbar Background */}
              <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                {/* Simulated Buffer Range (FR-30 HTTP Range Buffer) */}
                <div className="h-full bg-white/20 w-3/4 rounded-full" />
                {/* Active Played Progress */}
                <div 
                  className="h-full bg-accent-primary rounded-full relative"
                  style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={currentTrack.duration}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Right Section: Signature Audio Spectrum & Lossless Quality Badge */}
        <div className="hidden md:flex items-center gap-4 w-1/3 justify-end">
          {/* Signature Micro Spectrum Visualizer (Lavender #7C86F5 Bars) */}
          <div className="flex items-end gap-1 h-6 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
            <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-1' : 'h-1.5 opacity-40'}`} />
            <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-2' : 'h-3 opacity-40'}`} />
            <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-3' : 'h-4 opacity-40'}`} />
            <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-4' : 'h-2 opacity-40'}`} />
            <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-5' : 'h-3.5 opacity-40'}`} />
          </div>

          {/* Exclusive Light Bronze Hi-Res Quality Badge (#D4A66A) */}
          <div className="bronze-badge px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-bronze-glow whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentTrack.format} {currentTrack.bitDepth}/{currentTrack.sampleRate}</span>
            <span className="opacity-60 text-[10px]">· {currentTrack.bitrate} kbps</span>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-text-secondary hover:text-text-primary"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 accent-accent-primary h-1 bg-white/20 rounded cursor-pointer"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
