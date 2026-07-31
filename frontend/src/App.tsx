import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AlbumGrid } from './components/AlbumGrid';
import { TrackList } from './components/TrackList';
import { ArtistGrid } from './components/ArtistGrid';
import { PlayerDock } from './components/PlayerDock';
import { SongDetailModal } from './components/SongDetailModal';
import { LiveQueueDrawer } from './components/LiveQueueDrawer';
import { SourceModal } from './components/SourceModal';
import { Album, MusicSource } from './types';
import { api, Song, Artist } from './services/api';
import { useAudioPlayer } from './hooks/useAudioPlayer';

export const App: React.FC = () => {
  const [sources, setSources] = useState<MusicSource[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState<string>('albums');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSongDetailOpen, setIsSongDetailOpen] = useState<boolean>(false);
  const [isLiveQueueOpen, setIsLiveQueueOpen] = useState<boolean>(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);

  // Audio Player Custom Hook
  const {
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    currentTrack,
    queue,
    currentIndex,
    disabledSongIds,
    toggleTrackInQueue,
    selectAllQueueTracks,
    deselectAllQueueTracks,
    playSong,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleRepeat,
    seek,
  } = useAudioPlayer();

  // Load Sources, Songs, and Artists from Fastify Backend
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
    try {
      const newSource = await api.addSource(name, path);
      const scanResult = await api.scanSource(newSource.id);
      await loadBackendData();
      alert(`Đã kết nối nguồn nhạc "${name}" thành công!\n- Tìm thấy: ${scanResult?.totalAudioFiles || 0} file nhạc.\n- Thêm mới: ${scanResult?.filesAdded || 0} bài.`);
    } catch (err: any) {
      alert(`Lỗi thêm nguồn nhạc:\n${err.message || err}`);
    } finally {
      setIsSourceModalOpen(false);
    }
  };

  // Play Single Song via Audio Player Engine
  const handlePlaySong = (song: Song, contextQueue?: Song[]) => {
    let queueToUse = contextQueue;
    if (!queueToUse || queueToUse.length === 0) {
      if (song.album?.title) {
        queueToUse = songs
          .filter((s) => s.album?.title === song.album?.title)
          .sort((a, b) => {
            if ((a.discNumber || 1) !== (b.discNumber || 1)) return (a.discNumber || 1) - (b.discNumber || 1);
            if ((a.trackNumber || 0) !== (b.trackNumber || 0)) return (a.trackNumber || 0) - (b.trackNumber || 0);
            return a.title.localeCompare(b.title);
          });
      } else {
        queueToUse = songs;
      }
    }
    playSong(song, queueToUse);
  };

  // Play Album Handler
  const handlePlayAlbum = (album: Album) => {
    const albumSongs = songs
      .filter((s) => s.album?.title === album.title || s.album?.id === album.id)
      .sort((a, b) => {
        if ((a.discNumber || 1) !== (b.discNumber || 1)) return (a.discNumber || 1) - (b.discNumber || 1);
        if ((a.trackNumber || 0) !== (b.trackNumber || 0)) return (a.trackNumber || 0) - (b.trackNumber || 0);
        return a.title.localeCompare(b.title);
      });

    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
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
              songs={songs}
              onSelectAlbum={(alb) => handlePlayAlbum(alb)}
              onPlayAlbum={handlePlayAlbum}
              onPlaySong={handlePlaySong}
              selectedSourceFilterName={selectedSource?.name}
            />
          )}

          {activeTab === 'tracks' && (
            <TrackList
              songs={songs}
              onPlaySong={(song) => handlePlaySong(song, songs)}
              activeSongId={currentTrack.id}
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
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        repeatMode={repeatMode}
        onTogglePlay={togglePlay}
        onNextTrack={nextTrack}
        onPrevTrack={prevTrack}
        onToggleRepeat={toggleRepeat}
        onSeek={seek}
        onOpenSongDetail={() => setIsSongDetailOpen(true)}
        onOpenLiveQueue={() => setIsLiveQueueOpen(true)}
      />

      {/* Responsive Desktop & Mobile Fullscreen Current Song Detail View */}
      <SongDetailModal
        isOpen={isSongDetailOpen}
        onClose={() => setIsSongDetailOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        repeatMode={repeatMode}
        onTogglePlay={togglePlay}
        onNextTrack={nextTrack}
        onPrevTrack={prevTrack}
        onToggleRepeat={toggleRepeat}
        onSeek={seek}
        onOpenLiveQueue={() => setIsLiveQueueOpen(true)}
      />

      {/* Live Playing Queue Drawer with real-time Checklist toggles */}
      <LiveQueueDrawer
        isOpen={isLiveQueueOpen}
        onClose={() => setIsLiveQueueOpen(false)}
        queue={queue}
        currentIndex={currentIndex}
        disabledSongIds={disabledSongIds}
        isPlaying={isPlaying}
        onToggleTrack={toggleTrackInQueue}
        onSelectAll={selectAllQueueTracks}
        onDeselectAll={deselectAllQueueTracks}
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
