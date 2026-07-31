import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AlbumGrid } from './components/AlbumGrid';
import { PlayerDock } from './components/PlayerDock';
import { MobilePlayerSheet } from './components/MobilePlayerSheet';
import { SourceModal } from './components/SourceModal';
import { mockAlbums, initialSources, currentPlayingTrack } from './data/mockData';
import { Album, MusicSource, Track } from './types';

export const App: React.FC = () => {
  const [sources, setSources] = useState<MusicSource[]>(initialSources);
  const [albums, setAlbums] = useState<Album[]>(mockAlbums);
  const [activeTab, setActiveTab] = useState<string>('albums');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTrack, setActiveTrack] = useState<Track>(currentPlayingTrack);

  // Modals & Mobile Sheet States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);

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

  // Add Source Handler
  const handleAddSource = (name: string, path: string) => {
    const newSource: MusicSource = {
      id: `src-${Date.now()}`,
      name,
      path,
      trackCount: Math.floor(Math.random() * 2000) + 500,
      status: 'ready',
      lastScan: 'Vừa thêm',
    };
    setSources([...sources, newSource]);
    setIsSourceModalOpen(false);
  };

  // Play Album Handler
  const handlePlayAlbum = (album: Album) => {
    setActiveTrack({
      id: `trk-${album.id}`,
      title: `${album.title} (Track 01)`,
      artist: album.artist,
      album: album.title,
      duration: 345,
      format: 'FLAC',
      sampleRate: album.format.includes('192') ? '192kHz' : '96kHz',
      bitDepth: '24-bit',
      bitrate: album.format.includes('192') ? 5644 : 3120,
      trackNumber: 1,
    });
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#15171C] text-[#EDEFF3] flex flex-col font-sans selection:bg-accent-primary selection:text-white">
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
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onOpenMobileSheet={() => setIsMobileSheetOpen(true)}
      />

      {/* Mobile Full-Screen Now Playing Sheet */}
      <MobilePlayerSheet
        currentTrack={activeTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
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
