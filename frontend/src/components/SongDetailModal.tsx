import React, { useState, useEffect } from 'react';
import {
    X,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Sparkles,
    Disc,
    Repeat,
    Repeat1,
    FileText,
    Music,
    ListMusic,
    Clock,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    Radio
} from 'lucide-react';
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
    const [timeString, setTimeString] = useState<string>('');
    const [dateString, setDateString] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [lyricsFontSize, setLyricsFontSize] = useState<number>(18);

    // Lock body scroll when modal is open to eradicate page scrollbars
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

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
        <div className="fixed inset-0 z-50 bg-[#0B0D11] text-[#EDEFF3] flex flex-col justify-between overflow-hidden animate-in fade-in duration-500 selection:bg-accent-primary selection:text-white no-scrollbar">

            {/* Blurred Cover Art Background Backdrop */}
            {currentTrack.coverUrl ? (
                <div
                    className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                    aria-hidden="true"
                >
                    <img
                        src={currentTrack.coverUrl}
                        alt=""
                        className={`w-full h-full object-cover blur-sm opacity-55 scale-125 brightness-50 contrast-125 transition-all duration-1000 ${isPlaying ? 'animate-pulse-slow' : 'grayscale-[20%]'
                            }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11]/90 via-[#0B0D11]/60 to-[#0B0D11]/40" />
                </div>
            ) : (
                <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-amber-950/40 via-[#0B0D11] to-purple-950/40" />
            )}

            {/* Top Studio Monitor Navigation Header (Ẩn ở Fullscreen, rà chuột lên Top để xuất hiện) */}
            <div
                className={
                    isFullscreen
                        ? "group/topheader absolute top-0 left-0 right-0 z-50 pt-2 pb-6 px-4 transition-all duration-300 cursor-pointer"
                        : "relative z-10 shrink-0"
                }
            >
                <div
                    className={`flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 ${isFullscreen
                            ? 'rounded-2xl mx-2 sm:mx-6 mt-2 shadow-2xl -translate-y-full opacity-0 group-hover/topheader:translate-y-0 group-hover/topheader:opacity-100'
                            : ''
                        }`}
                >
                    {/* Left: Digital Clock & Date */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-accent-primary shadow-accent-glow">
                            <Radio className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-accent-primary" />
                                <span className="font-mono font-bold text-base sm:text-lg text-text-primary tracking-widest">
                                    {timeString || '18:30:00'}
                                </span>
                            </div>
                            <span className="text-[11px] font-sans text-text-secondary capitalize block -mt-0.5">
                                {dateString || 'Hi-Fi Wall Monitor'}
                            </span>
                        </div>
                    </div>

                    {/* Center Title Badge */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/14 text-xs font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-text-primary font-semibold">AudioVault Wall Monitor Engine</span>
                        <span className="opacity-40">|</span>
                        <span className="text-emerald-400 font-bold">LIVE STREAM</span>
                    </div>

                    {/* Right Studio Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Live Queue Button */}
                        <button
                            onClick={onOpenLiveQueue}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/14 text-xs font-semibold text-text-primary flex items-center gap-1.5 transition-all hover:scale-105"
                            title="Mở hàng chờ phát nhạc trực tiếp"
                        >
                            <ListMusic className="w-4 h-4 text-accent-primary" />
                            <span className="hidden sm:inline">Hàng chờ</span>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/14 text-text-secondary hover:text-text-primary transition-all"
                            title={isFullscreen ? 'Thoát toàn màn hình' : 'Bật toàn màn hình (Treo màn)'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        {/* Close Modal Button */}
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/14 text-text-secondary hover:text-text-primary transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Studio Display Stage (Hidden Scrollbar Everywhere) */}
            <div className="relative z-10 flex-1 p-4 sm:p-6 lg:p-10 overflow-hidden flex items-center justify-center no-scrollbar">
                {hasLyrics ? (
                    /* ==================== LAYOUT 1: 4:6 SPLIT LAYOUT (HAS LYRICS) ==================== */
                    <div className="w-full h-full max-w-7xl grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-12 items-center overflow-y-auto lg:overflow-hidden no-scrollbar">

                        {/* Left 40% (4 Columns): 3D Vinyl Stage & Controls */}
                        <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6 text-center">

                            {/* 3D Vinyl Record Stage */}
                            <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center group">
                                {/* Spinning Vinyl Record sliding out */}
                                <div
                                    className={`absolute w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 shadow-2xl border-4 border-neutral-800 flex items-center justify-center transition-all duration-700 ${isPlaying ? 'translate-x-10 sm:translate-x-12' : 'translate-x-2'
                                        }`}
                                    style={{
                                        animation: isPlaying ? 'spin 12s linear infinite' : 'none',
                                        backgroundImage: 'radial-gradient(circle, #1a1a1a 30%, #111111 70%, #050505 100%)',
                                    }}
                                >
                                    {/* Concentric Vinyl Grooves */}
                                    <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-full border border-neutral-700/40 flex items-center justify-center">
                                        <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-full border border-neutral-700/30 flex items-center justify-center">
                                            {/* Center Gold Label */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300/40 flex items-center justify-center text-black font-mono font-bold text-[9px] text-center shadow-lg p-1">
                                                <div>
                                                    <Disc className="w-5 h-5 mx-auto mb-0.5" />
                                                    <span>HI-RES</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Art Box */}
                                <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden glass-dock border-2 border-white/20 shadow-2xl p-2 bg-black/60">
                                    <div className="w-full h-full rounded-xl overflow-hidden relative group">
                                        {currentTrack.coverUrl ? (
                                            <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-black flex items-center justify-center">
                                                <Disc className="w-24 h-24 text-accent-primary animate-spin-slow" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Track Metadata */}
                            <div className="space-y-1.5 max-w-md">
                                <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary truncate tracking-tight">
                                    {currentTrack.title}
                                </h2>
                                <p className="text-base text-text-secondary truncate">
                                    {currentTrack.artist} — <span className="italic opacity-80">{currentTrack.album}</span>
                                </p>

                                {/* Hi-Res Quality Spec Badge */}
                                <div className="pt-2">
                                    <div className="bronze-badge px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-bronze-glow">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                        <span>{currentTrack.format} {currentTrack.bitDepth}/{currentTrack.sampleRate}</span>
                                        <span className="opacity-60 font-mono">· {currentTrack.bitrate} kbps</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress & Playback Controls */}
                            <div className="w-full max-w-sm space-y-4 pt-1">
                                {/* Seekbar */}
                                <div className="space-y-1.5 mono-tech text-xs text-text-secondary">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-primary to-amber-400 rounded-full shadow-accent-glow"
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

                                {/* Main Player Buttons (Symmetrical 5-button layout) */}
                                <div className="flex items-center justify-center gap-5 sm:gap-6">
                                    <button
                                        onClick={onToggleRepeat}
                                        className={`p-2 rounded-xl transition-all ${repeatMode !== 'off' ? 'bg-accent-primary text-white shadow-accent-glow' : 'text-text-secondary hover:text-text-primary'
                                            }`}
                                        title="Lặp bài"
                                    >
                                        {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                                    </button>

                                    <button onClick={onPrevTrack} className="p-1.5 text-text-secondary hover:text-text-primary" title="Bài trước">
                                        <SkipBack className="w-6 h-6 fill-current" />
                                    </button>

                                    <button
                                        onClick={onTogglePlay}
                                        className="w-14 h-14 rounded-full bg-accent-primary hover:bg-accent-primaryHover text-white flex items-center justify-center shadow-accent-glow hover:scale-105 transition-transform shrink-0"
                                        title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                                    >
                                        {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
                                    </button>

                                    <button onClick={onNextTrack} className="p-1.5 text-text-secondary hover:text-text-primary" title="Bài tiếp">
                                        <SkipForward className="w-6 h-6 fill-current" />
                                    </button>

                                    <button
                                        onClick={onOpenLiveQueue}
                                        className="p-2 text-text-secondary hover:text-accent-primary hover:bg-white/10 rounded-xl transition-all"
                                        title="Danh sách Hàng chờ"
                                    >
                                        <ListMusic className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Right 60% (6 Columns): High-End Lyrics HUD (Ẩn thanh Scrollbar) */}
                        <div className="lg:col-span-6 h-full min-h-[400px] lg:min-h-0 glass-dock rounded-3xl p-6 sm:p-8 border border-white/16 shadow-2xl flex flex-col space-y-4">

                            {/* Lyrics HUD Header & Font Controls */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent-primary">
                                    <FileText className="w-4 h-4" />
                                    <span>Lời Bài Hát (Lyrics Studio HUD)</span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
                                    <button
                                        onClick={() => setLyricsFontSize((prev) => Math.max(12, prev - 2))}
                                        className="p-1 text-text-secondary hover:text-text-primary rounded-md transition-colors"
                                        title="Giảm cỡ chữ"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <span className="font-mono text-[11px] text-text-secondary px-1">{lyricsFontSize}px</span>
                                    <button
                                        onClick={() => setLyricsFontSize((prev) => Math.min(28, prev + 2))}
                                        className="p-1 text-text-secondary hover:text-text-primary rounded-md transition-colors"
                                        title="Tăng cỡ chữ"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Lyrics Scrollable Panel - Hidden Scrollbar */}
                            <div
                                className="flex-1 overflow-y-auto space-y-4 font-sans text-text-primary leading-relaxed pr-1 no-scrollbar"
                                style={{ fontSize: `${lyricsFontSize}px` }}
                            >
                                {currentTrack.lyrics?.split('\n').map((line, idx) => (
                                    <p
                                        key={idx}
                                        className="hover:text-accent-primary hover:font-bold transition-all py-1 cursor-pointer opacity-85 hover:opacity-100 hover:scale-[1.01]"
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>

                    </div>
                ) : (
                    /* ==================== LAYOUT 2: CENTERED VINYL STAGE (NO LYRICS) ==================== */
                    <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-8 text-center no-scrollbar">

                        {/* Centered 3D Vinyl Stage */}
                        <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center group">
                            {/* Spinning Vinyl Disc */}
                            <div
                                className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 shadow-2xl border-4 border-neutral-800 flex items-center justify-center transition-all duration-700 ${isPlaying ? 'translate-x-14 sm:translate-x-16' : 'translate-x-4'
                                    }`}
                                style={{
                                    animation: isPlaying ? 'spin 12s linear infinite' : 'none',
                                    backgroundImage: 'radial-gradient(circle, #1a1a1a 30%, #111111 70%, #050505 100%)',
                                }}
                            >
                                {/* Concentric Vinyl Grooves */}
                                <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-neutral-700/40 flex items-center justify-center">
                                    <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-neutral-700/30 flex items-center justify-center">
                                        {/* Center Gold Stamp */}
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300/40 flex items-center justify-center text-black font-mono font-bold text-xs text-center shadow-lg p-2">
                                            <div>
                                                <Disc className="w-6 h-6 mx-auto mb-1" />
                                                <span>HI-FI VINYL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cover Art Box */}
                            <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden glass-dock border-2 border-white/20 shadow-2xl p-3 bg-black/60">
                                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                    {currentTrack.coverUrl ? (
                                        <img src={currentTrack.coverUrl} alt={currentTrack.album} className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-black flex items-center justify-center">
                                            <Disc className="w-32 h-32 text-accent-primary animate-spin-slow" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Track Metadata & Spectrum Visualizer */}
                        <div className="space-y-2 w-full">
                            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight truncate">
                                {currentTrack.title}
                            </h2>
                            <p className="text-lg text-text-secondary truncate">
                                {currentTrack.artist} — <span className="italic opacity-80">{currentTrack.album}</span>
                            </p>

                            {/* Audio Spectrum Waves */}
                            <div className="flex items-end justify-center gap-1.5 h-8 py-1">
                                <span className={`w-1.5 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-1' : 'h-2 opacity-30'}`} />
                                <span className={`w-1.5 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-2' : 'h-4 opacity-30'}`} />
                                <span className={`w-1.5 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-3' : 'h-6 opacity-30'}`} />
                                <span className={`w-1.5 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-4' : 'h-3 opacity-30'}`} />
                                <span className={`w-1.5 bg-accent-primary rounded-full ${isPlaying ? 'animate-spectrum-5' : 'h-5 opacity-30'}`} />
                            </div>

                            {/* Hi-Res Quality Specs Badge */}
                            <div className="pt-1">
                                <div className="bronze-badge px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-bronze-glow">
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                    <span>{currentTrack.format} {currentTrack.bitDepth}/{currentTrack.sampleRate}</span>
                                    <span className="opacity-60 font-mono">· {currentTrack.bitrate} kbps</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress & Main Control Buttons */}
                        <div className="w-full space-y-6 pt-2">
                            {/* Seekbar */}
                            <div className="space-y-2 mono-tech text-xs text-text-secondary">
                                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent-primary to-amber-400 rounded-full shadow-accent-glow"
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

                            {/* Control Buttons (5-item Symmetrical Layout for Dead-Center Play Button) */}
                            <div className="flex items-center justify-center gap-6 sm:gap-8">
                                <button
                                    onClick={onToggleRepeat}
                                    className={`p-2.5 rounded-xl transition-all ${repeatMode !== 'off' ? 'bg-accent-primary text-white shadow-accent-glow' : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                    title="Lặp bài"
                                >
                                    {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                                </button>

                                <button onClick={onPrevTrack} className="p-2 text-text-secondary hover:text-text-primary" title="Bài trước">
                                    <SkipBack className="w-8 h-8 fill-current" />
                                </button>

                                <button
                                    onClick={onTogglePlay}
                                    className="w-16 h-16 rounded-full bg-accent-primary hover:bg-accent-primaryHover text-white flex items-center justify-center shadow-accent-glow hover:scale-105 transition-transform shrink-0"
                                    title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                                >
                                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                                </button>

                                <button onClick={onNextTrack} className="p-2 text-text-secondary hover:text-text-primary" title="Bài tiếp">
                                    <SkipForward className="w-8 h-8 fill-current" />
                                </button>

                                <button
                                    onClick={onOpenLiveQueue}
                                    className="p-2.5 text-text-secondary hover:text-accent-primary hover:bg-white/10 rounded-xl transition-all"
                                    title="Danh sách Hàng chờ"
                                >
                                    <ListMusic className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};
