import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Music, Disc, User, HardDrive, ListMusic } from 'lucide-react';
import { usePlaylists } from '../../hooks/usePlaylists';
import type { ViewMode } from '../../types';

export const MobileNav: React.FC = () => {
  const { viewMode, setViewMode } = useUI();
  const { songs, albums, artists, sources } = useLibrary();
  const { playlists } = usePlaylists();

  const navItems: { mode: ViewMode; label: string; icon: React.ReactNode; count: number }[] = [
    { mode: 'songs', label: 'Bài hát', icon: <Music className="w-5 h-5" />, count: songs.length },
    { mode: 'albums', label: 'Albums', icon: <Disc className="w-5 h-5" />, count: albums.length },
    { mode: 'artists', label: 'Nghệ sĩ', icon: <User className="w-5 h-5" />, count: artists.length },
    { mode: 'playlists', label: 'Playlist', icon: <ListMusic className="w-5 h-5" />, count: playlists.length },
    { mode: 'sources', label: 'Nguồn', icon: <HardDrive className="w-5 h-5" />, count: sources.length },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass-header border-t border-vault-border md:hidden z-30 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = viewMode === item.mode;
        return (
          <button
            key={item.mode}
            onClick={() => setViewMode(item.mode)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              isActive ? 'text-vault-accent font-bold' : 'text-vault-muted hover:text-vault-text'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.count > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] font-mono px-1 rounded-full bg-vault-accent text-white leading-none py-0.5 shadow-sm">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-vault-accent mt-0.5 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
