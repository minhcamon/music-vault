export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  format: 'FLAC' | 'WAV' | 'MP3' | 'ALAC';
  sampleRate: string; // e.g. "192kHz", "96kHz"
  bitDepth: string;  // e.g. "24-bit", "16-bit"
  bitrate: number;   // kbps, e.g. 5644
  trackNumber: number;
  lyrics?: string | null;
  coverUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl?: string;
  hasCover: boolean;
  totalTracks: number;
  format: string;     // e.g. "FLAC 24-bit / 192kHz"
  isHiRes: boolean;
  isFavorite?: boolean;
  sourceId: string;
}

export interface MusicSource {
  id: string;
  name: string;        // e.g. "Ổ D - HiRes Lossless"
  path: string;        // e.g. "D:\Music\Lossless"
  trackCount: number;
  status: 'ready' | 'scanning' | 'disconnected' | 'disabled';
  lastScan?: string;
}
