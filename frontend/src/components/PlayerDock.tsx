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
    Repeat1,
    Disc,
    ListMusic
} from 'lucide-react';
import { Track } from '../types';
import { RepeatMode } from '../hooks/useAudioPlayer';

interface PlayerDockProps {
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
    onOpenSongDetail: () => void;
    onOpenLiveQueue: () => void;
}

export const PlayerDock: React.FC<PlayerDockProps> = ({
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
    onOpenSongDetail,
    onOpenLiveQueue,
}) => {
    const [volume, setVolume] = useState(85);
    const [isMuted, setIsMuted] = useState(false);

    // Format seconds to mm:ss
    const formatTime = (secs: number) => {
        if (!secs || isNaN(secs)) return '00:00';
        const mins = Math.floor(secs / 60);
        const remainder = Math.floor(secs % 60);
        return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
    };

    const totalDuration = duration || currentTrack.duration || 1;

    return (
        <div className="fixed bottom-3 lg:bottom-6 left-3 right-3 lg:left-1/2 lg:-translate-x-1/2 lg:w-[94%] max-w-6xl z-40">
            <div className="glass-dock rounded-2xl p-3 lg:p-4 flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-6 border border-white/14 shadow-2xl">

                {/* Track Metadata & Cover Thumbnail */}
                <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0 justify-between md:justify-start">
                    <div
                        onClick={onOpenSongDetail}
                        className="flex items-center gap-3 cursor-pointer min-w-0 group"
                        title="Mở giao diện chi tiết bài hát (Lyrics / Visualizer)"
                    >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/14 shrink-0 relative flex items-center justify-center">
                            {currentTrack.coverUrl ? (
                                <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-full h-full object-cover" />
                            ) : (
                                <Disc className="w-6 h-6 text-accent-primary animate-spin-slow" />
                            )}
                            {isPlaying && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <h4 className="font-display font-bold text-sm text-text-primary truncate group-hover:text-accent-primary transition-colors">
                                {currentTrack.title}
                            </h4>
                            <p className="text-xs text-text-secondary truncate mt-0.5">
                                {currentTrack.artist} — <span className="italic">{currentTrack.album}</span>
                            </p>
                        </div>
                    </div>

                    {/* Live Queue Drawer & Fullscreen Player Sheet Trigger Icons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onOpenLiveQueue}
                            className="p-2 text-text-secondary hover:text-accent-primary hover:bg-white/10 rounded-lg transition-colors"
                            title="Mở hàng chờ đang phát (Live Queue Checklist)"
                        >
                            <ListMusic className="w-4 h-4" />
                        </button>

                        <button
                            onClick={onOpenSongDetail}
                            className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-lg transition-colors"
                            title="Mở màn hình bài hát (Current Song Player Detail)"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Center: Controls & Seekbar */}
                <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-2">
                    {/* Main Control Buttons */}
                    <div className="flex items-center gap-4">
                        {/* Skip Previous */}
                        <button
                            onClick={onPrevTrack}
                            className="text-text-secondary hover:text-text-primary p-1 transition-colors"
                            title="Bài trước đó"
                        >
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>

                        {/* Play / Pause Toggle */}
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

                        {/* Skip Next */}
                        <button
                            onClick={onNextTrack}
                            className="text-text-secondary hover:text-text-primary p-1 transition-colors"
                            title="Bài tiếp theo"
                        >
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>

                        {/* Repeat Mode Toggle (Song Loop / Album Loop / Off) */}
                        <button
                            onClick={onToggleRepeat}
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${repeatMode === 'one'
                                    ? 'bg-accent-primary text-white shadow-accent-glow font-bold'
                                    : repeatMode === 'all'
                                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            title={
                                repeatMode === 'one'
                                    ? 'Lặp lại 1 bài (Song Loop)'
                                    : repeatMode === 'all'
                                        ? 'Lặp lại cả Album (Album Loop)'
                                        : 'Phát theo thứ tự (Tắt lặp)'
                            }
                        >
                            {repeatMode === 'one' ? (
                                <Repeat1 className="w-4 h-4 text-white" />
                            ) : (
                                <Repeat className="w-4 h-4" />
                            )}
                            {repeatMode !== 'off' && (
                                <span className="text-[10px] font-mono uppercase font-bold">
                                    {repeatMode === 'one' ? '1' : 'ALL'}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Seekbar with Buffer Range & Timestamps */}
                    <div className="w-full flex items-center gap-3 text-xs mono-tech text-text-secondary">
                        <span>{formatTime(currentTime)}</span>
                        <div className="flex-1 relative h-2 group cursor-pointer">
                            {/* Seekbar Background */}
                            <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                                {/* Active Played Progress */}
                                <div
                                    className="h-full bg-accent-primary rounded-full relative"
                                    style={{ width: `${Math.min(100, Math.max(0, (currentTime / totalDuration) * 100))}%` }}
                                />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={totalDuration}
                                value={currentTime}
                                onChange={(e) => onSeek(Number(e.target.value))}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <span>{formatTime(totalDuration)}</span>
                    </div>
                </div>

                {/* Right Section: Micro Spectrum & Quality Badge */}
                <div className="hidden md:flex items-center gap-4 w-1/3 justify-end">
                    {/* Micro Spectrum Visualizer */}
                    <div className="flex items-end gap-1 h-6 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                        <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-1' : 'h-1.5 opacity-40'}`} />
                        <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-2' : 'h-3 opacity-40'}`} />
                        <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-3' : 'h-4 opacity-40'}`} />
                        <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-4' : 'h-2 opacity-40'}`} />
                        <span className={`w-1 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-5' : 'h-3.5 opacity-40'}`} />
                    </div>

                    {/* Hi-Res Quality Badge */}
                    <div className="bronze-badge px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-bronze-glow whitespace-nowrap">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{currentTrack.format} {currentTrack.bitDepth}/{currentTrack.sampleRate}</span>
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
