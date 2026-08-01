import React from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useUI } from '../../contexts/UIContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ListMusic,
  Maximize2,
  Repeat,
  Repeat1,
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export const PlayerDock: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    repeatMode,
    toggleRepeatMode,
    togglePlayPause,
    seek,
    playNext,
    playPrev,
    queue,
  } = useAudio();

  const { isQueueDrawerOpen, setIsQueueDrawerOpen, setSelectedSong, setActiveModal } = useUI();

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenSongDetail = () => {
    setSelectedSong(currentSong);
    setActiveModal('song_detail');
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <TooltipProvider>
      {/* ─── DESKTOP PLAYER DOCK (md:flex) ─────────────────────────────────── */}
      <div
        className="hidden md:flex fixed bottom-3 left-6 right-6 h-24 glass-dock rounded-3xl px-6 py-3 items-center justify-between z-40"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* 1. Left: Current Track Meta */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleOpenSongDetail}
              className="flex items-center gap-4 w-1/4 min-w-[220px] cursor-pointer group hover:opacity-95 transition-all p-1.5 rounded-2xl hover:bg-white/5"
            >
              <div className="relative shrink-0">
                {currentSong.coverBlobUrl ? (
                  <img
                    src={currentSong.coverBlobUrl}
                    alt={currentSong.title}
                    className="w-14 h-14 rounded-2xl object-cover shadow-xl border border-white/15 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent group-hover:scale-105 transition-transform">
                    <Music className="w-7 h-7" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>

              <div className="overflow-hidden space-y-0.5 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-vault-text text-sm sm:text-base truncate group-hover:text-vault-accent transition-colors leading-snug">
                    {currentSong.title}
                  </h4>
                  <Maximize2 className="w-3.5 h-3.5 text-vault-accent shrink-0 opacity-70 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-xs text-vault-muted font-medium truncate">
                  {currentSong.artist} — <span className="opacity-75">{currentSong.album}</span>
                </p>
                <div className="pt-0.5">
                  <Badge variant="bronze" className="text-[10px] px-2 py-0.5">
                    {currentSong.bitrate || 'FLAC Lossless'}
                  </Badge>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            Mở Studio Wall Monitor (Chi tiết bài hát)
          </TooltipContent>
        </Tooltip>

        {/* 2. Center: Playback Controls & High-Precision Slider */}
        <div className="flex flex-col items-center gap-2 w-2/4 max-w-xl">
          <div className="flex items-center gap-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={repeatMode !== 'off' ? 'default' : 'ghost'}
                  size="icon-sm"
                  onClick={toggleRepeatMode}
                  className="rounded-xl"
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4 text-amber-300" /> : <Repeat className="w-4 h-4" />}
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
                  size="icon-sm"
                  onClick={playPrev}
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bài trước</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon-lg"
                  onClick={togglePlayPause}
                  className="rounded-full shadow-lg shadow-vault-accent/40"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Tạm dừng' : 'Phát nhạc'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={playNext}
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bài tiếp</TooltipContent>
            </Tooltip>
          </div>

          {/* Seekbar & Timers */}
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-vault-text w-12 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="flex-1">
              <Slider
                min={0}
                max={duration || 100}
                step={0.1}
                value={[currentTime]}
                onValueChange={(val) => seek(val[0])}
              />
            </div>

            <span className="text-xs font-mono font-medium text-vault-muted w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 3. Right: Volume & Queue Drawer Toggle */}
        <div className="flex items-center justify-end gap-5 w-1/4 min-w-[200px]">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                  className="text-vault-muted hover:text-vault-text transition-colors cursor-pointer"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{volume === 0 ? 'Bật âm thanh' : 'Tắt tiếng'}</TooltipContent>
            </Tooltip>

            <div className="w-20">
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={(val) => setVolume(val[0])}
              />
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isQueueDrawerOpen ? 'default' : 'glass'}
                onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
                className="rounded-2xl gap-2 relative"
              >
                <ListMusic className="w-5 h-5" />
                {queue.length > 0 && (
                  <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                    {queue.length}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Hàng đợi phát nhạc</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* ─── MOBILE MINI-PLAYER (md:hidden) ─────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-[68px] left-3 right-3 h-16 glass-dock rounded-2xl px-3 py-2 flex items-center justify-between z-40 shadow-2xl overflow-hidden"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Top Progress Line Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-vault-accent transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Cover & Track Metadata (Clickable to open Fullscreen Monitor) */}
        <div
          onClick={handleOpenSongDetail}
          className="flex items-center gap-3 flex-1 overflow-hidden pr-2 cursor-pointer"
        >
          {currentSong.coverBlobUrl ? (
            <img
              src={currentSong.coverBlobUrl}
              alt={currentSong.title}
              className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent shrink-0">
              <Music className="w-5 h-5" />
            </div>
          )}

          <div className="overflow-hidden flex-1">
            <h4 className="font-bold text-vault-text text-xs truncate leading-snug">
              {currentSong.title}
            </h4>
            <p className="text-[11px] text-vault-muted truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Play/Pause Button */}
          <Button
            variant="default"
            size="icon-sm"
            onClick={togglePlayPause}
            className="rounded-full shadow-md shadow-vault-accent/40"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={playNext}
            className="text-vault-muted hover:text-vault-text"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>

          {/* Queue Drawer Button */}
          <Button
            variant={isQueueDrawerOpen ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
            className="rounded-xl relative"
          >
            <ListMusic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
