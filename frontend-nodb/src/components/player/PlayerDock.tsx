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

  const seekPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const volumePercent = Math.min(100, Math.max(0, volume * 100));

  const handleOpenSongDetail = () => {
    setSelectedSong(currentSong);
    setActiveModal('song_detail');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#12141A]/95 border-t border-white/10 backdrop-blur-2xl px-6 flex items-center justify-between z-40 shadow-2xl">
      {/* 1. Left: Current Track Meta (Clickable to open Fullscreen Studio Monitor) */}
      <div
        onClick={handleOpenSongDetail}
        className="flex items-center gap-4 w-1/4 min-w-[240px] cursor-pointer group hover:opacity-95 transition-all"
        title="Mở màn hình phát nhạc Studio toàn màn hình"
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
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>

        <div className="overflow-hidden space-y-0.5">
          <h4 className="font-bold text-vault-text text-sm sm:text-base truncate group-hover:text-vault-accent transition-colors leading-snug">
            {currentSong.title}
          </h4>
          <p className="text-xs text-vault-muted font-medium truncate">
            {currentSong.artist} — <span className="opacity-75">{currentSong.album}</span>
          </p>
          <div className="pt-0.5">
            <span className="bronze-badge text-[10px] px-2 py-0.5 rounded-md font-mono inline-block">
              {currentSong.bitrate || 'FLAC Lossless'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Playback Controls & High-Precision Seekbar */}
      <div className="flex flex-col items-center gap-2 w-2/4 max-w-xl">
        <div className="flex items-center gap-6">
          {/* Repeat Mode Toggle Button */}
          <button
            onClick={toggleRepeatMode}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode !== 'off'
                ? 'bg-vault-accent text-white shadow-lg shadow-vault-accent/30 font-bold'
                : 'text-vault-muted hover:text-vault-text hover:bg-white/5'
            }`}
            title={
              repeatMode === 'one'
                ? 'Chế độ: Lặp 1 bài (Song Loop)'
                : repeatMode === 'all'
                ? 'Chế độ: Lặp toàn bộ Album (Album Loop)'
                : 'Chế độ: Tắt lặp'
            }
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4 text-amber-300" /> : <Repeat className="w-4 h-4" />}
          </button>

          {/* Prev Button */}
          <button
            onClick={playPrev}
            className="text-vault-muted hover:text-vault-text transition-colors p-1.5 hover:bg-white/5 rounded-xl cursor-pointer"
            title="Bài trước"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause Main Button */}
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-vault-accent text-white flex items-center justify-center shadow-lg shadow-vault-accent/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            className="text-vault-muted hover:text-vault-text transition-colors p-1.5 hover:bg-white/5 rounded-xl cursor-pointer"
            title="Bài tiếp"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Seekbar & Timers */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-vault-text w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, #7C86F5 0%, #7C86F5 ${seekPercent}%, rgba(255, 255, 255, 0.15) ${seekPercent}%, rgba(255, 255, 255, 0.15) 100%)`,
              }}
              className="w-full h-full rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <span className="text-xs font-mono font-medium text-vault-muted w-12">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right: Volume & Current Playlist Queue Drawer Toggle */}
      <div className="flex items-center justify-end gap-5 w-1/4 min-w-[200px]">
        {/* Volume Slider */}
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-vault-muted hover:text-vault-text transition-colors cursor-pointer"
            title={volume === 0 ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, #7C86F5 0%, #7C86F5 ${volumePercent}%, rgba(255, 255, 255, 0.15) ${volumePercent}%, rgba(255, 255, 255, 0.15) 100%)`,
            }}
            className="w-20 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Current Playlist Queue Drawer Toggle Button */}
        <button
          onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
          className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 relative ${
            isQueueDrawerOpen
              ? 'bg-vault-accent text-white shadow-lg shadow-vault-accent/30'
              : 'bg-white/5 hover:bg-white/10 text-vault-muted hover:text-vault-text border border-white/10'
          }`}
          title="Xem Danh sách Hàng đợi (Current Playlist)"
        >
          <ListMusic className="w-5 h-5" />
          {queue.length > 0 && (
            <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {queue.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
