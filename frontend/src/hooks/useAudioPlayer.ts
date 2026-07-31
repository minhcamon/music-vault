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
  disabledSongIds: Set<string>;
}

const defaultTrack: Track = {
  id: 'none',
  title: 'Chưa chọn bài hát',
  artist: 'AudioVault Hi-Fi',
  album: 'Chưa có nhạc trong CSDL',
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
  const [disabledSongIds, setDisabledSongIds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Initialize HTML5 Audio Element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Audio element error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const currentSong = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  const rawCover = currentSong?.coverUrl || currentSong?.album?.coverUrl;
  const coverUrl = rawCover
    ? rawCover.startsWith('http') ? rawCover : `http://localhost:3001${rawCover}`
    : undefined;

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
        lyrics: currentSong.lyrics,
        coverUrl,
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
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback play() promise error:', err);
            setIsPlaying(false);
          });
      }
    },
    [queue]
  );

  // Helper to find the next enabled track index (bypassing disabled tracks)
  const getNextEnabledIndex = useCallback(
    (startIdx: number, direction: 1 | -1): number => {
      if (queue.length === 0) return -1;
      let curr = startIdx + direction;
      const count = queue.length;

      for (let i = 0; i < count; i++) {
        if (curr >= count) {
          if (repeatMode === 'all') {
            curr = 0;
          } else {
            return -1;
          }
        } else if (curr < 0) {
          if (repeatMode === 'all') {
            curr = count - 1;
          } else {
            return 0;
          }
        }

        const song = queue[curr];
        if (song && !disabledSongIds.has(song.id)) {
          return curr;
        }

        curr += direction;
      }

      return -1;
    },
    [queue, disabledSongIds, repeatMode]
  );

  // Next Track Logic (Album Loop / Song Loop / Sequential bypassing disabled tracks)
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    const nextIdx = getNextEnabledIndex(currentIndex, 1);
    if (nextIdx >= 0) {
      playTrackAtIndex(nextIdx);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, queue, repeatMode, getNextEnabledIndex, playTrackAtIndex]);

  // Previous Track Logic
  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIdx = getNextEnabledIndex(currentIndex, -1);
    if (prevIdx >= 0) {
      playTrackAtIndex(prevIdx);
    }
  }, [currentIndex, queue, getNextEnabledIndex, playTrackAtIndex]);

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
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  };

  // Toggle single track status in active queue
  const toggleTrackInQueue = (songId: string) => {
    setDisabledSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  // Select All / Deselect All queue tracks
  const selectAllQueueTracks = () => {
    setDisabledSongIds(new Set());
  };

  const deselectAllQueueTracks = () => {
    // Keep only current song enabled if deselect all
    if (currentSong) {
      const disabled = new Set(queue.map((s) => s.id));
      disabled.delete(currentSong.id);
      setDisabledSongIds(disabled);
    }
  };

  // Play a full queue starting at index
  const playQueue = (newQueue: Song[], startIndex: number = 0) => {
    setQueue(newQueue);
    setDisabledSongIds(new Set());
    playTrackAtIndex(startIndex, newQueue);
  };

  // Play a single song in context of a list
  const playSong = (song: Song, contextList?: Song[]) => {
    const activeList = contextList && contextList.length > 0 ? contextList : [song];
    const foundIndex = activeList.findIndex((s) => s.id === song.id);
    const targetIdx = foundIndex >= 0 ? foundIndex : 0;

    setQueue(activeList);
    setDisabledSongIds(new Set());
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
    disabledSongIds,
    toggleTrackInQueue,
    selectAllQueueTracks,
    deselectAllQueueTracks,
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
