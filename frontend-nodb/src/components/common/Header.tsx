import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Search, FolderPlus, Sparkles, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setActiveModal } = useUI();
  const { isScanning, scanProgress } = useLibrary();

  return (
    <header className="h-16 border-b border-vault-border bg-vault-bg/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
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
          <div className="px-4 py-1.5 rounded-xl bg-vault-accent/20 border border-vault-accent/40 flex items-center gap-3 text-xs text-vault-accent animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-vault-accent" />
            <div className="space-y-0.5">
              <div className="font-semibold flex items-center gap-2">
                <span>Đang quét nhạc...</span>
                <span className="font-mono">{scanProgress.processed}/{scanProgress.total}</span>
              </div>
              <div className="text-[10px] text-vault-muted max-w-[200px] truncate font-mono">
                {scanProgress.currentFile}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bronze-badge text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-vault-bronze" />
            <span>Client-Side No-DB Engine</span>
          </div>
        )}

        <button
          onClick={() => setActiveModal('add_source')}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-vault-text text-sm font-medium transition-colors flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4 text-vault-accent" />
          Thêm Nguồn Nhạc
        </button>
      </div>
    </header>
  );
};
