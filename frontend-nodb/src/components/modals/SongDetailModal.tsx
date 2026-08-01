import React, { useState, useEffect } from 'react';
import { useUI } from '../../contexts/UIContext';
import { useAudio } from '../../contexts/AudioContext';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Disc,
  Clock,
  Maximize2,
  Minimize2,
  ListMusic,
  Radio,
  Music,
  Repeat,
  Repeat1,
} from 'lucide-react';

export const SongDetailModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedSong, isQueueDrawerOpen, setIsQueueDrawerOpen } = useUI();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    toggleRepeatMode,
    playSong,
    togglePlayPause,
    seek,
    playNext,
    playPrev,
  } = useAudio();

  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeModal === 'song_detail') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

  // Live Digital Clock & Date for Wall Monitor Mode
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDateString(
        now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error requesting fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error exiting fullscreen:', err);
      });
    }
  };

  if (activeModal !== 'song_detail') return null;

  const targetSong = currentSong || selectedSong;
  if (!targetSong) return null;

  const isCurrentPlaying = currentSong?.id === targetSong.id && isPlaying;
  const totalDuration = duration || targetSong.duration || 1;

  const handlePlayPauseAction = () => {
    if (!currentSong || currentSong.id !== targetSong.id) {
      playSong(targetSong);
    } else {
      togglePlayPause();
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const seekPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (currentTime / totalDuration) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0D11] text-[#EDEFF3] flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 selection:bg-vault-accent selection:text-white no-scrollbar">
      {/* Blurred Cover Art Background Backdrop */}
      {targetSong.coverBlobUrl ? (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <img
            src={targetSong.coverBlobUrl}
            alt=""
            className={`w-full h-full object-cover blur-xl opacity-40 scale-110 brightness-[0.45] contrast-125 transition-all duration-1000 ${
              isCurrentPlaying ? 'animate-pulse' : 'grayscale-[20%]'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11] via-[#0B0D11]/60 to-[#0B0D11]/30" />
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-vault-accent/20 via-[#0B0D11] to-purple-950/40" />
      )}

      {/* Top Studio Monitor Navigation Header */}
      <div
        className={
          isFullscreen
            ? 'group/topheader absolute top-0 left-0 right-0 z-50 pt-2 pb-6 px-4 transition-all duration-300 cursor-pointer'
            : 'relative z-10 shrink-0'
        }
      >
        <div
          className={`flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 ${
            isFullscreen
              ? 'rounded-2xl mx-2 sm:mx-6 mt-2 shadow-2xl -translate-y-full opacity-0 group-hover/topheader:translate-y-0 group-hover/topheader:opacity-100'
              : ''
          }`}
        >
          {/* Left: Digital Clock & Date */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-vault-accent/20 border border-vault-accent/40 flex items-center justify-center text-vault-accent shadow-lg shadow-vault-accent/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-vault-accent" />
                <span className="font-mono font-bold text-base sm:text-lg text-vault-text tracking-widest">
                  {timeString || '18:30:00'}
                </span>
              </div>
              <span className="text-[11px] font-sans text-vault-muted capitalize block -mt-0.5">
                {dateString || 'Hi-Fi Wall Monitor'}
              </span>
            </div>
          </div>

          {/* Center Title Spec Badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bronze-badge text-xs font-mono shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {targetSong.format} {targetSong.bitDepth ? `${targetSong.bitDepth}-bit` : ''}
              {targetSong.sampleRate ? ` / ${(targetSong.sampleRate / 1000).toFixed(1)}kHz` : ''}
            </span>
            <span className="opacity-60 font-mono">· {targetSong.bitrate || 'Lossless'}</span>
          </div>

          {/* Right Studio Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/14 text-vault-muted hover:text-vault-text transition-all cursor-pointer"
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Bật toàn màn hình (Wall Monitor)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal Button */}
            <button
              onClick={() => setActiveModal('none')}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/14 text-vault-muted hover:text-vault-text transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Stage (Dead-Center Vertically & Horizontally) */}
      <div className="relative z-10 flex-1 w-full h-full p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center overflow-y-auto no-scrollbar my-auto">
        <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-6 text-center mx-auto my-auto">
          {/* Centered 3D Vinyl Stage */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center group mx-auto">
            {/* Spinning Vinyl Disc */}
            <div
              className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 shadow-2xl border-4 border-neutral-800 flex items-center justify-center transition-all duration-700 ${
                isCurrentPlaying ? 'translate-x-12 sm:translate-x-14 animate-spin-slow' : 'translate-x-2'
              }`}
              style={{
                backgroundImage: 'radial-gradient(circle, #1a1a1a 30%, #111111 70%, #050505 100%)',
              }}
            >
              {/* Concentric Vinyl Grooves */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-neutral-700/40 flex items-center justify-center">
                <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-neutral-700/30 flex items-center justify-center">
                  {/* Center Gold Stamp */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300/40 flex items-center justify-center text-black font-mono font-bold text-[10px] text-center shadow-lg p-2">
                    <div>
                      <Disc className="w-5 h-5 mx-auto mb-0.5" />
                      <span>HI-FI VINYL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Art Box */}
            <div className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden glass-dock border-2 border-white/20 shadow-2xl p-2.5 bg-black/60">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                {targetSong.coverBlobUrl ? (
                  <img
                    src={targetSong.coverBlobUrl}
                    alt={targetSong.album}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-vault-accent/20 via-purple-600/20 to-black flex items-center justify-center">
                    <Music className="w-24 h-24 text-vault-accent opacity-80" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Track Metadata & Spectrum Visualizer */}
          <div className="space-y-2 w-full">
            <h2 className="font-bold text-2xl sm:text-3xl text-vault-text tracking-tight leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] truncate">
              {targetSong.title}
            </h2>
            <p className="text-base sm:text-lg text-vault-muted drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] truncate">
              {targetSong.artist} — <span className="italic opacity-80">{targetSong.album}</span>
            </p>

            {/* Audio Spectrum Waves */}
            <div className="flex items-end justify-center gap-1.5 h-7 py-1">
              <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-1' : 'h-2 opacity-30'}`} />
              <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-2' : 'h-4 opacity-30'}`} />
              <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-3' : 'h-6 opacity-30'}`} />
              <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-4' : 'h-3 opacity-30'}`} />
              <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-5' : 'h-5 opacity-30'}`} />
            </div>
          </div>

          {/* Progress & Main Control Buttons */}
          <div className="w-full space-y-5 pt-1">
            {/* Seekbar */}
            <div className="space-y-2 mono-tech text-xs text-vault-muted">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #7C86F5 0%, #7C86F5 ${seekPercent}%, rgba(255, 255, 255, 0.15) ${seekPercent}%, rgba(255, 255, 255, 0.15) 100%)`,
                  }}
                  className="w-full h-full rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Control Buttons (Symmetrical 5-button Layout with Repeat Switch) */}
            <div className="flex items-center justify-center gap-5 sm:gap-6">
              <button
                onClick={toggleRepeatMode}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'bg-vault-accent text-white shadow-lg shadow-vault-accent/30'
                    : 'text-vault-muted hover:text-vault-text hover:bg-white/10'
                }`}
                title={
                  repeatMode === 'one'
                    ? 'Chế độ: Lặp 1 bài (Song Loop)'
                    : repeatMode === 'all'
                    ? 'Chế độ: Lặp toàn bộ Album (Album Loop)'
                    : 'Chế độ: Tắt lặp'
                }
              >
                {repeatMode === 'one' ? <Repeat1 className="w-6 h-6 text-amber-300" /> : <Repeat className="w-6 h-6" />}
              </button>

              <button
                onClick={playPrev}
                className="p-2.5 text-vault-muted hover:text-vault-text transition-colors cursor-pointer"
                title="Bài trước"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={handlePlayPauseAction}
                className="w-16 h-16 rounded-full bg-vault-accent text-white flex items-center justify-center shadow-lg shadow-vault-accent/40 hover:scale-105 transition-transform shrink-0 cursor-pointer"
                title={isCurrentPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              >
                {isCurrentPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>

              <button
                onClick={playNext}
                className="p-2.5 text-vault-muted hover:text-vault-text transition-colors cursor-pointer"
                title="Bài tiếp"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isQueueDrawerOpen ? 'bg-vault-accent text-white' : 'text-vault-muted hover:text-vault-text hover:bg-white/10'
                }`}
                title="Hàng đợi phát nhạc"
              >
                <ListMusic className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
