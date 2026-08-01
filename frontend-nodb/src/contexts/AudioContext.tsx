import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { Song } from '../types';
import { ProviderRegistry } from '../providers';
import { db } from '../db/database';
import { FileRefRegistry } from '../services/fileRefRegistry';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (vol: number) => void;
  queue: Song[];
  queueIndex: number;
  playSong: (song: Song, songList?: Song[]) => Promise<void>;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrev: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

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
    if (queue.length === 0 || queueIndex >= queue.length - 1) return;
    const nextIdx = queueIndex + 1;
    setQueueIndex(nextIdx);
    playSong(queue[nextIdx], queue);
  };

  const playPrev = () => {
    if (queue.length === 0 || queueIndex <= 0) return;
    const prevIdx = queueIndex - 1;
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx], queue);
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
        playSong,
        togglePlayPause,
        seek,
        playNext,
        playPrev,
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
