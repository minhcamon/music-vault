import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AlbumGrid } from './components/AlbumGrid';
import { TrackList } from './components/TrackList';
import { ArtistGrid } from './components/ArtistGrid';
import { PlayerDock } from './components/PlayerDock';
import { MobilePlayerSheet } from './components/MobilePlayerSheet';
import { SourceModal } from './components/SourceModal';
import { Album, MusicSource, Track } from './types';
import { api, Song, Artist } from './services/api';

const defaultPlayingTrack: Track = {
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

export const App: React.FC = () => {
  const [sources, setSources] = useState<MusicSource[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState<string>('albums');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback & HTML5 Audio Element Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrack, setActiveTrack] = useState<Track>(defaultPlayingTrack);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Modals & Mobile Sheet States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Load Sources and Songs from Fastify Backend
  useEffect(() => {
    loadBackendData();
  }, []);

  const loadBackendData = async () => {
    try {
      const backendSources = await api.getSources();
      if (backendSources) {
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

      const backendSongs = await api.getSongs(searchQuery);
      setSongs(backendSongs || []);

      const backendArtists = await api.getArtists();
      setArtists(backendArtists || []);

      if (backendSongs && backendSongs.length > 0) {
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
                : undefined,
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
      } else {
        setAlbums([]);
      }
    } catch (err) {
      console.warn('Backend API connection error:', err);
    }
  };

  // Add Source Handler
  const handleAddSource = async (name: string, path: string) => {
    setIsScanning(true);
    try {
      const newSource = await api.addSource(name, path);
      const scanResult = await api.scanSource(newSource.id);
      await loadBackendData();
      alert(`Đã kết nối nguồn nhạc "${name}" thành công!\n- Tìm thấy: ${scanResult?.totalAudioFiles || 0} file nhạc.\n- Thêm mới: ${scanResult?.filesAdded || 0} bài.`);
    } catch (err: any) {
      alert(`Lỗi thêm nguồn nhạc:\n${err.message || err}`);
    } finally {
      setIsScanning(false);
      setIsSourceModalOpen(false);
    }
  };

  // Play Single Song via HTTP Range Streaming URL
  const handlePlaySong = (song: Song) => {
    const streamUrl = api.getStreamUrl(song.id);

    setActiveTrack({
      id: song.id,
      title: song.title,
      artist: song.artist?.name || 'Unknown Artist',
      album: song.album?.title || 'Single',
      duration: song.duration || 240,
      format: (song.format as any) || 'FLAC',
      sampleRate: song.sampleRate ? `${song.sampleRate / 1000}kHz` : '96kHz',
      bitDepth: song.bitDepth ? `${song.bitDepth}-bit` : '24-bit',
      bitrate: 3120,
      trackNumber: song.trackNumber || 1,
    });

    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Play Album Handler
  const handlePlayAlbum = (album: Album) => {
    const matchingSong = songs.find((s) => s.album?.title === album.title || s.album?.id === album.id);
    if (matchingSong) {
      handlePlaySong(matchingSong);
    }
  };

  const togglePlay = () => {
    if (!activeTrack.id || activeTrack.id === 'none') return;
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
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          loadBackendData();
        }}
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
          {activeTab === 'albums' && (
            <AlbumGrid
              albums={displayedAlbums}
              onSelectAlbum={(alb) => handlePlayAlbum(alb)}
              onPlayAlbum={handlePlayAlbum}
              selectedSourceFilterName={selectedSource?.name}
            />
          )}

          {activeTab === 'tracks' && (
            <TrackList
              songs={songs}
              onPlaySong={handlePlaySong}
              activeSongId={activeTrack.id}
              isPlaying={isPlaying}
            />
          )}

          {activeTab === 'artists' && (
            <ArtistGrid
              artists={artists}
              onSelectArtist={(art) => {
                setSearchQuery(art.name);
                setActiveTab('tracks');
              }}
            />
          )}

          {activeTab === 'playlists' && (
            <div className="text-center py-16 glass-panel rounded-2xl p-8 border border-white/10">
              <h3 className="text-base font-semibold text-text-primary">Danh Sách Phát (Playlists)</h3>
              <p className="text-xs text-text-secondary mt-1">Tính năng tạo playlist cá nhân khả dụng khi có bài hát trong thư viện.</p>
            </div>
          )}
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
