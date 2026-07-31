import { useState, useRef, useEffect, useCallback } from 'react';
import { Song, api } from '../services/api';
import { Track } from '../types';

export type RepeatMode = 'off' | 'one' | 'all';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  currentSong: Song | null;
  currentTrack: Track;
  queue: Song[];
  currentIndex: number;
}

const defaultTrack: Track = {
  id: 'none',
  title: 'Chưa chọn bài hát',
  artist: 'AudioVault Hi-Fi',
  album: 'Chưa có nhạc',
  duration: 0,
  format: 'FLAC',
  sampleRate: '96kHz',
  bitDepth: '24-bit',
  bitrate: 3120,
  trackNumber: 1,
};

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Initialize HTML5 Audio Element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const currentSong = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  const currentTrack: Track = currentSong
    ? {
        id: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist?.name || 'Unknown Artist',
        album: currentSong.album?.title || 'Single',
        duration: currentSong.duration || 240,
        format: (currentSong.format as any) || 'FLAC',
        sampleRate: currentSong.sampleRate ? `${currentSong.sampleRate / 1000}kHz` : '96kHz',
        bitDepth: currentSong.bitDepth ? `${currentSong.bitDepth}-bit` : '24-bit',
        bitrate: 3120,
        trackNumber: currentSong.trackNumber || 1,
      }
    : defaultTrack;

  // Load and play a specific song by index
  const playTrackAtIndex = useCallback(
    (index: number, targetQueue?: Song[]) => {
      const activeQueue = targetQueue || queue;
      if (index < 0 || index >= activeQueue.length) return;

      const song = activeQueue[index];
      setCurrentIndex(index);

      if (audioRef.current) {
        const streamUrl = api.getStreamUrl(song.id);
        audioRef.current.src = streamUrl;
        audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
      }
    },
    [queue]
  );

  // Next Track Logic (Album Loop / Song Loop / Sequential)
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    let nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0; // Album Loop wrap around
      } else {
        setIsPlaying(false);
        return;
      }
    }

    playTrackAtIndex(nextIdx);
  }, [currentIndex, queue, repeatMode, playTrackAtIndex]);

  // Previous Track Logic
  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      if (repeatMode === 'all') {
        prevIdx = queue.length - 1; // Album Loop wrap to end
      } else {
        prevIdx = 0;
      }
    }

    playTrackAtIndex(prevIdx);
  }, [currentIndex, queue, repeatMode, playTrackAtIndex]);

  // Handle Track Ended Event (Automatic Song / Album Loop)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, nextTrack]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Play a full queue starting at index
  const playQueue = (newQueue: Song[], startIndex: number = 0) => {
    setQueue(newQueue);
    playTrackAtIndex(startIndex, newQueue);
  };

  // Play a single song in context of a list
  const playSong = (song: Song, contextList?: Song[]) => {
    const activeList = contextList && contextList.length > 0 ? contextList : [song];
    const foundIndex = activeList.findIndex((s) => s.id === song.id);
    const targetIdx = foundIndex >= 0 ? foundIndex : 0;

    setQueue(activeList);
    playTrackAtIndex(targetIdx, activeList);
  };

  // Toggle Repeat Mode ('off' -> 'one' -> 'all' -> 'off')
  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'one';
      if (prev === 'one') return 'all';
      return 'off';
    });
  };

  // Seek to specific time
  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    currentSong,
    currentTrack,
    queue,
    currentIndex,
    playQueue,
    playSong,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleRepeat,
    toggleShuffle: () => setIsShuffle((prev) => !prev),
    seek,
  };
}
