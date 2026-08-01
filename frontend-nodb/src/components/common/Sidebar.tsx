import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Music, Disc, User, HardDrive, X } from 'lucide-react';
import type { ViewMode } from '../../types';

export const Sidebar: React.FC = () => {
  const { viewMode, setViewMode, isMobileSidebarOpen, setIsMobileSidebarOpen } = useUI();
  const { songs, albums, artists, sources } = useLibrary();

  const navItems: { mode: ViewMode; label: string; icon: React.ReactNode; count: number }[] = [
    { mode: 'songs', label: 'Tất cả bài hát', icon: <Music className="w-5 h-5" />, count: songs.length },
    { mode: 'albums', label: 'Albums', icon: <Disc className="w-5 h-5" />, count: albums.length },
    { mode: 'artists', label: 'Nghệ sĩ', icon: <User className="w-5 h-5" />, count: artists.length },
    { mode: 'sources', label: 'Nguồn nhạc', icon: <HardDrive className="w-5 h-5" />, count: sources.length },
  ];

  const handleSelectNav = (mode: ViewMode) => {
    setViewMode(mode);
    setIsMobileSidebarOpen(false);
  };

  const navContent = (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Music Vault" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-vault-text text-base leading-none font-logo">Music Vault</h1>
              <span className="text-[10px] text-vault-muted font-mono tracking-widest uppercase">
                Lossless Engine
              </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-vault-muted hover:text-vault-text md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = viewMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => handleSelectNav(item.mode)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-vault-accent text-white shadow-lg shadow-vault-accent/25'
                    : 'text-vault-muted hover:text-vault-text hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-vault-muted'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-2 text-[11px] text-vault-muted/70 font-mono border-t border-white/5 pt-4">
        MusicVault Client v1.0 • NoDB
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 glass-sidebar flex-col justify-between p-4 select-none relative z-20 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <aside className="absolute inset-y-0 left-0 w-72 glass-sidebar flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-300">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
