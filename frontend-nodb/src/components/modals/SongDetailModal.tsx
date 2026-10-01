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
  Clock,
  Maximize2,
  Minimize2,
  ListMusic,
  Music,
  Repeat,
  Repeat1,
  Volume1,
  Volume2,
  VolumeX,
  Plus,
  Minus,
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { VinylRecord } from '../common/VinylRecord';
import { CoverImage } from '../common/CoverImage';
import { useCoverUrl } from '../../hooks/useCoverUrl';

export const SongDetailModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedSong, isQueueDrawerOpen, setIsQueueDrawerOpen } = useUI();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
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
  const [isVolumeOpen, setIsVolumeOpen] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.8);

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 0.8);
    }
  };

  const handleDecreaseVolume = () => {
    setVolume(Math.max(0, Math.round((volume - 0.05) * 100) / 100));
  };

  const handleIncreaseVolume = () => {
    setVolume(Math.min(1, Math.round((volume + 0.05) * 100) / 100));
  };

  const targetSong = currentSong || selectedSong;
  const coverUrl = useCoverUrl(targetSong?.coverId, targetSong?.coverBlobUrl);

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

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 bg-[#0C0A09] text-[#FAFAF9] flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 selection:bg-vault-accent selection:text-white no-scrollbar">
        {/* Blurred Cover Art Background Backdrop */}
        {coverUrl ? (
          <div key={`bg-wrapper-${targetSong.id}`} className="absolute inset-0 pointer-events-none z-0 overflow-hidden animate-album-swap" aria-hidden="true">
            <img
              key={`bg-img-${targetSong.id}`}
              src={coverUrl}
              alt=""
              className={`w-full h-full object-cover blur-md opacity-85 scale-100 brightness-90 contrast-110 transition-all duration-1000 ${
                isCurrentPlaying ? 'animate-pulse' : 'grayscale-[10%]'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-amber-600/25 via-[#0C0A09] to-stone-900/60" />
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
            className={`flex items-center justify-between p-3 sm:p-6 border-b border-white/20 bg-black/25 backdrop-blur-2xl backdrop-saturate-100 shadow-2xl transition-all duration-300 ${
              isFullscreen
                ? 'rounded-2xl mx-2 sm:mx-6 mt-2 shadow-2xl -translate-y-full opacity-0 group-hover/topheader:translate-y-0 group-hover/topheader:opacity-100'
                : ''
            }`}
          >
            {/* Left: Digital Clock & Date */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <img src="/logo.png" alt="Logo Music Vault" className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-vault-accent" />
                  <span className="font-mono font-bold text-sm sm:text-lg text-vault-text tracking-widest">
                    {timeString || '18:30:00'}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-sans text-vault-muted capitalize block -mt-0.5 truncate">
                  {dateString || 'Hi-Fi Wall Monitor'}
                </span>
              </div>
            </div>

            {/* Center Title Spec Badge */}
            <Badge variant="bronze" className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {targetSong.format} {targetSong.bitDepth ? `${targetSong.bitDepth}-bit` : ''}
                {targetSong.sampleRate ? ` / ${(targetSong.sampleRate / 1000).toFixed(1)}kHz` : ''}
              </span>
              <span className="opacity-60 font-mono">· {targetSong.bitrate || 'Lossless'}</span>
            </Badge>

            {/* Right Studio Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="hidden sm:flex"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isFullscreen ? 'Thoát toàn màn hình' : 'Bật Wall Monitor'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={() => setActiveModal('none')}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Đóng Studio Monitor</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Studio Stage */}
        <div className="relative z-10 flex-1 w-full h-full p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center overflow-y-auto no-scrollbar my-auto">
          <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center mx-auto my-auto">
            {/* Centered 3D Vinyl Stage */}
            <div className="relative w-56 h-56 sm:w-80 sm:h-80 flex items-center justify-center group mx-auto">
              {/* Soft Ambient Glow Pulse on Swap */}
              <div
                key={`glow-${targetSong.id}`}
                className="absolute inset-0 rounded-full bg-vault-accent/30 blur-3xl pointer-events-none animate-glow-pulse-swap"
              />

              {/* Vinyl Disc Stage (Permanently Extended Out + Pull Nudge Effect on Swap) */}
              <div className="absolute transition-all duration-700 ease-out translate-x-10 sm:translate-x-20">
                <div key={`vinyl-pull-${targetSong.id}`} className="animate-vinyl-pull">
                  <div className="sm:hidden">
                    <VinylRecord isPlaying={isCurrentPlaying} size={200} />
                  </div>
                  <div className="hidden sm:block">
                    <VinylRecord isPlaying={isCurrentPlaying} size={280} />
                  </div>
                </div>
              </div>

              {/* Cover Art Box with Album Swap Transition */}
              <div
                key={`cover-${targetSong.id}`}
                className="relative z-10 w-48 h-48 sm:w-72 sm:h-72 rounded-3xl overflow-hidden glass-dock border-2 border-white/20 shadow-2xl p-2 sm:p-2.5 bg-black/60 animate-album-swap"
              >
                <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
                  <CoverImage
                    coverId={targetSong.coverId}
                    coverBlobUrl={targetSong.coverBlobUrl}
                    alt={targetSong.album}
                    className="w-full h-full object-cover rounded-2xl"
                    fallbackIcon={<Music className="w-16 h-16 sm:w-24 sm:h-24 text-vault-accent opacity-80" />}
                  />
                </div>
              </div>
            </div>

            {/* Track Metadata & Spectrum Visualizer */}
            <div key={`meta-${targetSong.id}`} className="space-y-1.5 sm:space-y-2 w-full animate-text-swap">
              <h2 className="font-bold text-xl sm:text-3xl text-vault-text tracking-tight leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] truncate px-2">
                {targetSong.title}
              </h2>
              <p className="text-sm sm:text-lg text-vault-muted drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] truncate px-2">
                {targetSong.artist} — <span className="italic opacity-80">{targetSong.album}</span>
              </p>

              {/* Audio Spectrum Waves */}
              <div className="flex items-end justify-center gap-1.5 h-6 sm:h-7 py-1">
                <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-1' : 'h-2 opacity-30'}`} />
                <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-2' : 'h-4 opacity-30'}`} />
                <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-3' : 'h-6 opacity-30'}`} />
                <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-4' : 'h-3 opacity-30'}`} />
                <span className={`w-1.5 bg-vault-accent rounded-full ${isCurrentPlaying ? 'animate-spectrum-5' : 'h-5 opacity-30'}`} />
              </div>
            </div>

            {/* Progress & Main Control Buttons */}
            <div className="w-full space-y-4 sm:space-y-5 pt-1">
              {/* Shadcn Slider Seekbar */}
              <div className="space-y-1.5 sm:space-y-2">
                <Slider
                  min={0}
                  max={totalDuration}
                  step={0.1}
                  value={[currentTime]}
                  onValueChange={(val) => seek(val[0])}
                />
                <div className="flex justify-between text-[11px] sm:text-xs font-mono text-vault-muted">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={repeatMode !== 'off' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={toggleRepeatMode}
                      className="rounded-xl"
                    >
                      {repeatMode === 'one' ? <Repeat1 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" /> : <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {repeatMode === 'one' ? 'Lặp 1 bài' : repeatMode === 'all' ? 'Lặp danh sách' : 'Tắt lặp'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={playPrev}
                    >
                      <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bài trước</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon-lg"
                      onClick={handlePlayPauseAction}
                      className="rounded-full shadow-lg shadow-vault-accent/40"
                    >
                      {isCurrentPlaying ? <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" /> : <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isCurrentPlaying ? 'Tạm dừng' : 'Phát nhạc'}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={playNext}
                    >
                      <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bài tiếp</TooltipContent>
                </Tooltip>

                {/* 5. Volume Button with Vertical Dropdown / Popover (Trước Playlist) */}
                <div
                  className="relative flex items-center justify-center"
                  onMouseEnter={() => setIsVolumeOpen(true)}
                  onMouseLeave={() => setIsVolumeOpen(false)}
                >
                  {/* Vertical Popover Slider Card */}
                  <div
                    className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all duration-200 z-50 ${
                      isVolumeOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                        : 'opacity-0 translate-y-2 pointer-events-none scale-95'
                    }`}
                  >
                    {/* Step Up */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleIncreaseVolume}
                          disabled={volume >= 1}
                          className="text-vault-muted hover:text-vault-text rounded-lg h-7 w-7 p-0 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Tăng (+5%)</TooltipContent>
                    </Tooltip>

                    {/* Vertical Slider */}
                    <div className="h-28 w-6 flex items-center justify-center py-1">
                      <Slider
                        orientation="vertical"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[volume]}
                        onValueChange={(val) => setVolume(val[0])}
                        className="h-full"
                      />
                    </div>

                    {/* Step Down */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleDecreaseVolume}
                          disabled={volume <= 0}
                          className="text-vault-muted hover:text-vault-text rounded-lg h-7 w-7 p-0 disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Giảm (-5%)</TooltipContent>
                    </Tooltip>

                    {/* Percentage */}
                    <span className="font-mono text-[10px] font-bold text-vault-accent tabular-nums pt-1 border-t border-white/10 w-full text-center">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  {/* Volume Trigger Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={volume === 0 ? 'ghost' : isVolumeOpen ? 'default' : 'ghost'}
                        size="icon"
                        onClick={toggleMute}
                        className="rounded-xl relative"
                      >
                        {volume === 0 ? (
                          <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {volume === 0 ? 'Bật âm thanh (Unmute)' : `Âm lượng: ${Math.round(volume * 100)}% (Nhấn để tắt tiếng)`}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* 6. Playlist / Hàng đợi phát nhạc */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isQueueDrawerOpen ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
                      className="rounded-xl"
                    >
                      <ListMusic className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Hàng đợi phát nhạc (Playlist)</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
