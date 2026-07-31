import { X, Play, Pause, SkipBack, SkipForward, Sparkles, Disc, Repeat, Repeat1, FileText, Music, ListMusic } from 'lucide-react';
import { Track } from '../types';
import { RepeatMode } from '../hooks/useAudioPlayer';

interface SongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onOpenLiveQueue: () => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  isOpen,
  onClose,
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
  onOpenLiveQueue,
}) => {
  if (!isOpen) return null;

  const hasLyrics = Boolean(currentTrack.lyrics && currentTrack.lyrics.trim().length > 0);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const totalDuration = duration || currentTrack.duration || 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#121418]/95 backdrop-blur-2xl p-4 sm:p-6 lg:p-10 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-text-primary block">AudioVault Player Detail</span>
            <span className="text-[11px] font-mono text-text-secondary">Hi-Fi Audio Stream Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLiveQueue}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-all"
            title="Mở hàng chờ phát nhạc trực tiếp"
          >
            <ListMusic className="w-4 h-4 text-accent-primary" />
            <span>Hàng chờ</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Responsive 4:6 Split or Centered Layout */}
      <div className="flex-1 my-6 overflow-hidden flex items-center justify-center">
        {hasLyrics ? (
          /* ==================== LAYOUT 1: 4:6 SPLIT LAYOUT (HAS LYRICS) ==================== */
          <div className="w-full h-full max-w-6xl grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-10 items-center overflow-y-auto lg:overflow-hidden">
            {/* Left 40% (4 Columns): Album Cover & Track Controls */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6 text-center">
              {/* Album Art Container */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden glass-panel border-2 border-white/14 shadow-2xl p-3 flex items-center justify-center bg-black/40 group">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center relative overflow-hidden">
                  {currentTrack.coverUrl ? (
                    <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Disc className="w-28 h-28 text-accent-primary animate-spin-slow" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                      <span className="w-4 h-4 rounded-full bg-accent-primary animate-ping" />
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-1 max-w-sm">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-sm text-text-secondary truncate">
                  {currentTrack.artist} — <span className="italic">{currentTrack.album}</span>
                </p>

                {/* Hi-Res Quality Specs Badge */}
                <div className="pt-2">
                  <div className="bronze-badge px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-bronze-glow">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentTrack.format} {currentTrack.bitDepth}/{currentTrack.sampleRate}</span>
                  </div>
                </div>
              </div>

              {/* Progress & Controls Column */}
              <div className="w-full max-w-sm space-y-4">
                {/* Seekbar */}
                <div className="space-y-1.5 mono-tech text-xs text-text-secondary">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
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
                  <div className="flex justify-between text-[11px]">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(totalDuration)}</span>
                  </div>
                </div>

                {/* Main Player Buttons */}
                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={onToggleRepeat}
                    className={`p-2 rounded-xl transition-all ${
                      repeatMode !== 'off' ? 'bg-accent-primary text-white shadow-accent-glow' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Lặp bài"
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                  </button>

                  <button onClick={onPrevTrack} className="p-2 text-text-secondary hover:text-text-primary">
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className="w-14 h-14 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-accent-glow hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
                  </button>

                  <button onClick={onNextTrack} className="p-2 text-text-secondary hover:text-text-primary">
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 60% (6 Columns): Formatted Glassmorphism Lyrics Panel */}
            <div className="lg:col-span-6 h-full min-h-[350px] lg:min-h-0 glass-panel rounded-2xl p-6 border border-white/14 flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-mono uppercase tracking-wider text-accent-primary">
                <FileText className="w-4 h-4" />
                <span>Lời Bài Hát (Lyrics)</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 font-sans text-sm sm:text-base text-text-primary leading-relaxed pr-2">
                {currentTrack.lyrics?.split('\n').map((line, idx) => (
                  <p key={idx} className="hover:text-accent-primary transition-colors py-1">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ==================== LAYOUT 2: CENTERED LAYOUT (NO LYRICS) ==================== */
          <div className="w-full max-w-md flex flex-col items-center justify-center space-y-6 text-center">
            {/* Centered Vinyl Cover Container */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden glass-dock border-2 border-white/16 shadow-2xl p-3 flex items-center justify-center bg-black/40">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center relative overflow-hidden">
                {currentTrack.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Disc className="w-36 h-36 text-accent-primary animate-spin-slow" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                    <span className="w-6 h-6 rounded-full bg-accent-primary animate-ping" />
                  </div>
                )}
              </div>
            </div>

            {/* Track Metadata */}
            <div className="space-y-1.5 w-full">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary truncate">
                {currentTrack.title}
              </h2>
              <p className="text-base text-text-secondary truncate">
                {currentTrack.artist} — <span className="italic">{currentTrack.album}</span>
              </p>

              {/* Hi-Res Quality Specs Badge */}
              <div className="pt-2">
                <div className="bronze-badge px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-bronze-glow">
                  <Sparkles className="w-4 h-4" />
                  <span>{currentTrack.format} {currentTrack.bitDepth}/{currentTrack.sampleRate}</span>
                  <span className="opacity-60 font-mono">· {currentTrack.bitrate} kbps</span>
                </div>
              </div>
            </div>

            {/* Progress & Controls Column */}
            <div className="w-full space-y-5 pt-2">
              {/* Seekbar */}
              <div className="space-y-2 mono-tech text-xs text-text-secondary">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
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
                <div className="flex justify-between text-xs font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>

              {/* Main Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={onToggleRepeat}
                  className={`p-2.5 rounded-xl transition-all ${
                    repeatMode !== 'off' ? 'bg-accent-primary text-white shadow-accent-glow' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Lặp bài"
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                </button>

                <button onClick={onPrevTrack} className="p-2 text-text-secondary hover:text-text-primary">
                  <SkipBack className="w-8 h-8 fill-current" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="w-16 h-16 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-accent-glow hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-0.5" />}
                </button>

                <button onClick={onNextTrack} className="p-2 text-text-secondary hover:text-text-primary">
                  <SkipForward className="w-8 h-8 fill-current" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
