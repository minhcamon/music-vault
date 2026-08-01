import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Music, Disc, User, HardDrive } from 'lucide-react';
import type { ViewMode } from '../../types';

export const Sidebar: React.FC = () => {
    const { viewMode, setViewMode } = useUI();
    const { songs, albums, artists, sources } = useLibrary();

    const navItems: { mode: ViewMode; label: string; icon: React.ReactNode; count: number }[] = [
        { mode: 'songs', label: 'Tất cả bài hát', icon: <Music className="w-5 h-5" />, count: songs.length },
        { mode: 'albums', label: 'Albums', icon: <Disc className="w-5 h-5" />, count: albums.length },
        { mode: 'artists', label: 'Nghệ sĩ', icon: <User className="w-5 h-5" />, count: artists.length },
        { mode: 'sources', label: 'Nguồn nhạc', icon: <HardDrive className="w-5 h-5" />, count: sources.length },
    ];

    return (
        <aside className="w-64 glass-sidebar flex flex-col justify-between p-4 select-none relative z-20">
            <div className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-3 px-3 py-2">
                    <img src="/logo.png" alt="Logo Music Vault" className="w-10 h-10" />
                    <div>
                        <h1 className="font-bold text-vault-text text-base leading-none">Music Vault</h1>
                        <span className="text-[10px] text-vault-muted font-mono tracking-widest uppercase">
                            Lossless Engine
                        </span>
                    </div>
                </div>

                {/* Navigation List */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = viewMode === item.mode;
                        return (
                            <button
                                key={item.mode}
                                onClick={() => setViewMode(item.mode)}
                                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-vault-accent text-white shadow-lg shadow-vault-accent/25'
                                    : 'text-vault-muted hover:text-vault-text hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                <span
                                    className={`text-xs font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-vault-muted'
                                        }`}
                                >
                                    {item.count}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};
