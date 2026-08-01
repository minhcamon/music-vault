import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Search, Sparkles, RefreshCw } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useUI();
  const { isScanning, scanProgress } = useLibrary();

  const scanPercent = scanProgress.total > 0
    ? Math.min(100, Math.round((scanProgress.processed / scanProgress.total) * 100))
    : 0;

  return (
    <header className="h-16 glass-header px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm bài hát, album, nghệ sĩ..."
          className="w-full bg-white/5 border border-vault-border rounded-xl pl-10 pr-4 py-2 text-sm text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
        />
      </div>

      {/* Global Scan Indicator & Actions */}
      <div className="flex items-center gap-4">
        {isScanning ? (
          <div className="px-4 py-2 rounded-xl bg-vault-accent/15 border border-vault-accent/30 flex items-center gap-3 text-xs text-vault-accent min-w-[240px]">
            <RefreshCw className="w-4 h-4 animate-spin text-vault-accent shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="font-semibold flex items-center justify-between gap-2">
                <span>Đang quét nhạc...</span>
                <span className="font-mono text-[11px]">{scanProgress.processed}/{scanProgress.total}</span>
              </div>
              <Progress value={scanPercent} className="h-1.5" />
              <div className="text-[10px] text-vault-muted max-w-[180px] truncate font-mono">
                {scanProgress.currentFile}
              </div>
            </div>
          </div>
        ) : (
          <Badge variant="bronze" className="px-3 py-1 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Client-Side No-DB Engine</span>
          </Badge>
        )}
      </div>
    </header>
  );
};
