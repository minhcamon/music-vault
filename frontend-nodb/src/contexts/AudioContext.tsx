import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { Song } from '../types';
import { ProviderRegistry } from '../providers';
import { db } from '../db/database';
import { FileRefRegistry } from '../services/fileRefRegistry';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (vol: number) => void;
  queue: Song[];
  queueIndex: number;
  hiddenQueueSongIds: string[];
  repeatMode: RepeatMode;
  toggleRepeatMode: () => void;
  playSong: (song: Song, songList?: Song[]) => Promise<void>;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrev: () => void;
  setQueue: (songs: Song[]) => void;
  removeSongFromQueue: (songId: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  toggleHideQueueSong: (songId: string) => void;
  shuffleQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [hiddenQueueSongIds, setHiddenQueueSongIds] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const repeatModeRef = useRef<RepeatMode>('off');
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef<number>(-1);
  const hiddenQueueSongIdsRef = useRef<string[]>([]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  useEffect(() => {
    hiddenQueueSongIdsRef.current = hiddenQueueSongIds;
  }, [hiddenQueueSongIds]);

  // Helper tìm vị trí bài hát hợp lệ tiếp theo (bỏ qua bài bị ẩn)
  const findNextValidIndex = (startIndex: number, q: Song[], hiddenSet: Set<string>, loop: boolean): number => {
    if (q.length === 0) return -1;
    let idx = startIndex;
    const count = q.length;

    for (let i = 0; i < count; i++) {
      idx = loop ? (idx + 1) % count : idx + 1;
      if (idx >= count && !loop) return -1;
      if (!hiddenSet.has(q[idx].id)) {
        return idx;
      }
    }
    return -1;
  };

  // Helper tìm vị trí bài hát hợp lệ trước đó (bỏ qua bài bị ẩn)
  const findPrevValidIndex = (startIndex: number, q: Song[], hiddenSet: Set<string>, loop: boolean): number => {
    if (q.length === 0) return -1;
    let idx = startIndex;
    const count = q.length;

    for (let i = 0; i < count; i++) {
      idx = loop ? (idx - 1 + count) % count : idx - 1;
      if (idx < 0 && !loop) return -1;
      if (!hiddenSet.has(q[idx].id)) {
        return idx;
      }
    }
    return -1;
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);

    const handleEnded = () => {
      const mode = repeatModeRef.current;
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      const hiddenSet = new Set(hiddenQueueSongIdsRef.current);

      if (mode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (mode === 'all') {
        const nextIdx = findNextValidIndex(idx, q, hiddenSet, true);
        if (nextIdx !== -1) {
          setQueueIndex(nextIdx);
          playSong(q[nextIdx], q);
        } else {
          setIsPlaying(false);
        }
      } else {
        // 'off' mode
        const nextIdx = findNextValidIndex(idx, q, hiddenSet, false);
        if (nextIdx !== -1) {
          setQueueIndex(nextIdx);
          playSong(q[nextIdx], q);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  const toggleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const playSong = async (song: Song, songList?: Song[]) => {
    if (!audioRef.current) return;

    try {
      const source = await db.sources.get(song.sourceId);
      if (!source) return;

      const provider = ProviderRegistry.getProvider(source.type);
      if (!provider) return;

      await provider.init(source.config);
      const fileRef = FileRefRegistry.get(song.id) || song.path;
      const streamUrl = await provider.getStreamUrl(fileRef);

      // Clean up previous blob URL if exists to prevent memory leak
      if (activeBlobUrlRef.current && activeBlobUrlRef.current !== streamUrl) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }

      if (streamUrl.startsWith('blob:')) {
        activeBlobUrlRef.current = streamUrl;
      }

      audioRef.current.src = streamUrl;
      audioRef.current.volume = volume;
      await audioRef.current.play();

      setCurrentSong(song);
      setIsPlaying(true);

      if (songList && songList.length > 0) {
        setQueue(songList);
        const idx = songList.findIndex((s) => s.id === song.id);
        setQueueIndex(idx !== -1 ? idx : 0);
      }
    } catch (e) {
      console.error('Play song failed:', e);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    const hiddenSet = new Set(hiddenQueueSongIds);
    const isLoop = repeatMode === 'all';
    const nextIdx = findNextValidIndex(queueIndex, queue, hiddenSet, isLoop);
    if (nextIdx !== -1) {
      setQueueIndex(nextIdx);
      playSong(queue[nextIdx], queue);
    }
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    const hiddenSet = new Set(hiddenQueueSongIds);
    const isLoop = repeatMode === 'all';
    const prevIdx = findPrevValidIndex(queueIndex, queue, hiddenSet, isLoop);
    if (prevIdx !== -1) {
      setQueueIndex(prevIdx);
      playSong(queue[prevIdx], queue);
    }
  };

  /**
   * Xóa một bài hát khỏi Hàng đợi phát (Queue)
   */
  const removeSongFromQueue = (songId: string) => {
    const updatedQueue = queue.filter((s) => s.id !== songId);
    const updatedHidden = hiddenQueueSongIds.filter((id) => id !== songId);
    setHiddenQueueSongIds(updatedHidden);
    setQueue(updatedQueue);

    if (currentSong?.id === songId) {
      if (updatedQueue.length === 0) {
        if (audioRef.current) audioRef.current.pause();
        setCurrentSong(null);
        setIsPlaying(false);
        setQueueIndex(-1);
      } else {
        const hiddenSet = new Set(updatedHidden);
        const nextIdx = findNextValidIndex(queueIndex - 1, updatedQueue, hiddenSet, true);
        if (nextIdx !== -1) {
          setQueueIndex(nextIdx);
          playSong(updatedQueue[nextIdx], updatedQueue);
        } else {
          if (audioRef.current) audioRef.current.pause();
          setCurrentSong(null);
          setIsPlaying(false);
          setQueueIndex(-1);
        }
      }
    } else if (currentSong) {
      const newIdx = updatedQueue.findIndex((s) => s.id === currentSong.id);
      setQueueIndex(newIdx);
    }
  };

  /**
   * Xóa toàn bộ Hàng đợi phát (Clear Queue)
   */
  const clearQueue = () => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
    setHiddenQueueSongIds([]);
    setQueueIndex(-1);
  };

  /**
   * Đổi vị trí bài hát trong Hàng đợi phát (Reorder Queue)
   */
  const reorderQueue = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex < 0 ||
      toIndex >= queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const updatedQueue = [...queue];
    const [movedSong] = updatedQueue.splice(fromIndex, 1);
    updatedQueue.splice(toIndex, 0, movedSong);
    setQueue(updatedQueue);

    if (currentSong) {
      const newIdx = updatedQueue.findIndex((s) => s.id === currentSong.id);
      setQueueIndex(newIdx);
    }
  };

  /**
   * Bật/Tắt trạng thái ẩn bài hát trong Hàng đợi phát (không phát tự động)
   */
  const toggleHideQueueSong = (songId: string) => {
    setHiddenQueueSongIds((prev) => {
      if (prev.includes(songId)) {
        return prev.filter((id) => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  /**
   * Xáo trộn ngẫu nhiên hàng đợi phát (giữ nguyên bài đang phát ở đầu)
   */
  const shuffleQueue = () => {
    if (queue.length <= 1) return;
    if (!currentSong) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      return;
    }
    const otherSongs = queue.filter((s) => s.id !== currentSong.id);
    const shuffledOthers = [...otherSongs].sort(() => Math.random() - 0.5);
    const newQueue = [currentSong, ...shuffledOthers];
    setQueue(newQueue);
    setQueueIndex(0);
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        setVolume,
        queue,
        queueIndex,
        hiddenQueueSongIds,
        repeatMode,
        toggleRepeatMode,
        playSong,
        togglePlayPause,
        seek,
        playNext,
        playPrev,
        setQueue,
        removeSongFromQueue,
        clearQueue,
        reorderQueue,
        toggleHideQueueSong,
        shuffleQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
