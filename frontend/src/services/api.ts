const API_BASE_URL = 'http://localhost:3001/api';

export interface Source {
  id: string;
  name: string;
  path: string;
  enabled: boolean;
  lastScannedAt: string | null;
  createdAt: string;
  _count?: {
    songs: number;
  };
}

export interface Song {
  id: string;
  title: string;
  duration: number;
  fileUrl: string;
  coverUrl: string | null;
  format: string;
  bitrate: string | null;
  sampleRate: number | null;
  bitDepth: number | null;
  trackNumber: number | null;
  discNumber: number | null;
  genre: string | null;
  missing: boolean;
  artist?: { id: string; name: string };
  album?: { id: string; title: string; coverUrl: string | null };
  source?: { id: string; name: string };
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
  year: number | null;
  artist?: { id: string; name: string };
  _count?: { songs: number };
  songs?: Song[];
}

export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  _count?: { albums: number; songs: number };
  albums?: Album[];
  songs?: Song[];
}

export const api = {
  // Sources
  async getSources(): Promise<Source[]> {
    const res = await fetch(`${API_BASE_URL}/sources`);
    const json = await res.json();
    return json.data || [];
  },

  async addSource(name: string, path: string): Promise<Source> {
    const res = await fetch(`${API_BASE_URL}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add source');
    return json.data;
  },

  async scanSource(id: string) {
    const res = await fetch(`${API_BASE_URL}/sources/${id}/scan`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to scan source');
    return json.data;
  },

  async seedDemo() {
    const res = await fetch(`${API_BASE_URL}/sources/seed-demo`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to seed demo music');
    return json.data;
  },

  async deleteSource(id: string) {
    const res = await fetch(`${API_BASE_URL}/sources/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return json;
  },

  // Songs
  async getSongs(search?: string): Promise<Song[]> {
    const url = search
      ? `${API_BASE_URL}/songs?search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/songs`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  getStreamUrl(songId: string): string {
    return `${API_BASE_URL}/songs/${songId}/stream`;
  },

  // Albums
  async getAlbums(): Promise<Album[]> {
    const res = await fetch(`${API_BASE_URL}/albums`);
    const json = await res.json();
    return json.data || [];
  },

  async getAlbumById(id: string): Promise<Album> {
    const res = await fetch(`${API_BASE_URL}/albums/${id}`);
    const json = await res.json();
    return json.data;
  },

  // Artists
  async getArtists(): Promise<Artist[]> {
    const res = await fetch(`${API_BASE_URL}/artists`);
    const json = await res.json();
    return json.data || [];
  },
};
