import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Search, Sparkles, RefreshCw, Menu } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsMobileSidebarOpen } = useUI();
  const { isScanning, scanProgress } = useLibrary();

  const scanPercent = scanProgress.total > 0
    ? Math.min(100, Math.round((scanProgress.processed / scanProgress.total) * 100))
    : 0;

  return (
    <header className="h-16 glass-header px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 gap-2 sm:gap-4">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-vault-text md:hidden shrink-0 border border-white/10"
          title="Mở Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[180px] sm:max-w-[320px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài hát..."
            className="w-full bg-white/5 border border-vault-border rounded-xl pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
          />
        </div>
      </div>

      {/* Global Scan Indicator & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isScanning ? (
          <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-vault-accent/15 border border-vault-accent/30 flex items-center gap-2 sm:gap-3 text-xs text-vault-accent max-w-[180px] sm:min-w-[240px]">
            <RefreshCw className="w-4 h-4 animate-spin text-vault-accent shrink-0" />
            <div className="space-y-1 flex-1 overflow-hidden">
              <div className="font-semibold flex items-center justify-between gap-1 text-[11px] sm:text-xs">
                <span className="truncate">Đang quét...</span>
                <span className="font-mono text-[10px] sm:text-[11px]">{scanProgress.processed}/{scanProgress.total}</span>
              </div>
              <Progress value={scanPercent} className="h-1 sm:h-1.5" />
            </div>
          </div>
        ) : (
          <Badge variant="bronze" className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Client-Side No-DB Engine</span>
            <span className="sm:hidden font-mono">No-DB Engine</span>
          </Badge>
        )}
      </div>
    </header>
  );
};
