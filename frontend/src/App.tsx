import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AlbumGrid } from './components/AlbumGrid';
import { PlayerDock } from './components/PlayerDock';
import { MobilePlayerSheet } from './components/MobilePlayerSheet';
import { SourceModal } from './components/SourceModal';
import { mockAlbums, initialSources, currentPlayingTrack } from './data/mockData';
import { Album, MusicSource, Track } from './types';
import { api, Song } from './services/api';

export const App: React.FC = () => {
  const [sources, setSources] = useState<MusicSource[]>(initialSources);
  const [albums, setAlbums] = useState<Album[]>(mockAlbums);
  const [activeTab, setActiveTab] = useState<string>('albums');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback & HTML5 Audio Element Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrack, setActiveTrack] = useState<Track>(currentPlayingTrack);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(345);

  // Modals & Mobile Sheet States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);

  // Load Sources and Songs from Fastify Backend
  useEffect(() => {
    loadBackendData();
  }, []);

  const loadBackendData = async () => {
    try {
      const backendSources = await api.getSources();
      if (backendSources && backendSources.length > 0) {
        setSources(
          backendSources.map((s) => ({
            id: s.id,
            name: s.name,
            path: s.path,
            trackCount: s._count?.songs || 0,
            status: s.enabled ? 'ready' : 'disabled',
            lastScan: s.lastScannedAt ? new Date(s.lastScannedAt).toLocaleString('vi-VN') : 'Chưa quét',
          }))
        );
      }

      const backendSongs = await api.getSongs();
      if (backendSongs && backendSongs.length > 0) {
        // Group backend songs into displayable album format
        const albumMap = new Map<string, Album>();
        backendSongs.forEach((song) => {
          const albumName = song.album?.title || 'Single / Unknown Album';
          const albumKey = `${albumName}-${song.artist?.name || ''}`;

          if (!albumMap.has(albumKey)) {
            albumMap.set(albumKey, {
              id: song.album?.id || `alb-${song.id}`,
              title: albumName,
              artist: song.artist?.name || 'Unknown Artist',
              coverUrl: song.coverUrl
                ? `http://localhost:3001${song.coverUrl}`
                : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
              hasCover: !!song.coverUrl,
              year: 2026,
              format: `${song.format} ${song.bitDepth || 24}-bit/${(song.sampleRate || 96000) / 1000}kHz`,
              totalTracks: 1,
              isHiRes: true,
              sourceId: song.source?.id || 'src-1',
            });
          } else {
            const alb = albumMap.get(albumKey)!;
            alb.totalTracks += 1;
          }
        });
        setAlbums(Array.from(albumMap.values()));
      }
    } catch (err) {
      console.warn('Backend not available yet, using mock data:', err);
    }
  };

  // Add Source Handler
  const handleAddSource = async (name: string, path: string) => {
    try {
      const newSource = await api.addSource(name, path);
      // Trigger instant scan
      await api.scanSource(newSource.id);
      await loadBackendData();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm nguồn nhạc');
    }
    setIsSourceModalOpen(false);
  };

  // Play Album / Track Handler using HTTP Range Streaming URL
  const handlePlayAlbum = (album: Album) => {
    const streamUrl = `http://localhost:3001/api/songs/${album.id}/stream`;

    setActiveTrack({
      id: `trk-${album.id}`,
      title: `${album.title}`,
      artist: album.artist,
      album: album.title,
      duration: 345,
      format: album.format.includes('FLAC') ? 'FLAC' : 'WAV',
      sampleRate: album.format.includes('192') ? '192kHz' : '96kHz',
      bitDepth: '24-bit',
      bitrate: album.format.includes('192') ? 5644 : 3120,
      trackNumber: 1,
    });

    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Filter Albums by Selected Source & Search Query
  const displayedAlbums = albums.filter((album) => {
    const matchesSource = selectedSourceId ? album.sourceId === selectedSourceId : true;
    const matchesSearch = searchQuery
      ? album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.format.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSource && matchesSearch;
  });

  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  return (
    <div className="min-h-screen bg-[#15171C] text-[#EDEFF3] flex flex-col font-sans selection:bg-accent-primary selection:text-white">
      {/* Hidden HTML5 Audio Element for HTTP Range Streaming */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 345);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex w-full max-w-[1800px] mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          sources={sources}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedSourceId={selectedSourceId}
          onSelectSource={setSelectedSourceId}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAddSourceModal={() => setIsSourceModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 pb-32 overflow-y-auto">
          <AlbumGrid
            albums={displayedAlbums}
            onSelectAlbum={(alb) => handlePlayAlbum(alb)}
            onPlayAlbum={handlePlayAlbum}
            selectedSourceFilterName={selectedSource?.name}
          />
        </main>
      </div>

      {/* Signature Element: Floating Spectrum Glass Capsule Player Dock */}
      <PlayerDock
        currentTrack={activeTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onOpenMobileSheet={() => setIsMobileSheetOpen(true)}
      />

      {/* Mobile Full-Screen Now Playing Sheet */}
      <MobilePlayerSheet
        currentTrack={activeTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
      />

      {/* Source Management Modal */}
      <SourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        sources={sources}
        onAddSource={handleAddSource}
      />
    </div>
  );
};
export default App;
