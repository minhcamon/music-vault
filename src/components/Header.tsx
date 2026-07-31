import React from 'react';
import { Search, Disc, Loader2, Menu, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileSidebar: () => void;
  onOpenSourceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
  onOpenSourceModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-[#5A63D8] flex items-center justify-center shadow-accent-glow">
            <Disc className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base lg:text-lg tracking-wider text-text-primary uppercase flex items-center gap-2">
              AUDIOVAULT <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary border border-accent-primary/30">HI-FI</span>
            </h1>
            <p className="text-[11px] text-text-secondary hidden sm:block">Self-Hosted Lossless Music Server</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl relative hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm album, nghệ sĩ, bài hát FLAC... (Ví dụ: Miles Davis)"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-20 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-primary/60 focus:bg-white/[0.08] transition-all"
          />
          <kbd className="absolute right-3 text-[10px] font-mono text-text-secondary bg-white/10 px-2 py-0.5 rounded border border-white/10 pointer-events-none">
            Cmd + K
          </kbd>
        </div>
      </div>

      {/* Real-time Scan Status & Action Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSourceModal}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-accent-primary/40 hover:bg-white/[0.08] transition-all text-xs text-text-primary"
        >
          <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
          <span className="text-text-secondary">Quét Nguồn Nhạc:</span>
          <span className="mono-tech text-accent-primary font-medium">NAS (98%)</span>
        </button>

        <button
          onClick={onOpenSourceModal}
          className="p-2 rounded-xl bg-white/[0.06] border border-white/14 hover:border-accent-primary/50 text-text-primary transition-all flex items-center gap-2 text-xs font-medium"
        >
          <SlidersHorizontal className="w-4 h-4 text-accent-primary" />
          <span className="hidden md:inline">Nguồn Nhạc</span>
        </button>
      </div>
    </header>
  );
};
