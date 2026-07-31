import React from 'react';
import { 
  Library, 
  Disc, 
  Music, 
  Users, 
  ListMusic, 
  HardDrive, 
  FolderPlus, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  X
} from 'lucide-react';
import { MusicSource } from '../types';

interface SidebarProps {
  sources: MusicSource[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedSourceId: string | null;
  onSelectSource: (sourceId: string | null) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAddSourceModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sources,
  activeTab,
  onTabChange,
  selectedSourceId,
  onSelectSource,
  isOpenMobile,
  onCloseMobile,
  onOpenAddSourceModal,
}) => {
  const navItems = [
    { id: 'albums', label: 'Album', icon: Disc },
    { id: 'tracks', label: 'Bài hát (Dense List)', icon: Music },
    { id: 'artists', label: 'Nghệ sĩ', icon: Users },
    { id: 'playlists', label: 'Danh sách phát', icon: ListMusic },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 lg:p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Mobile Header Close Button */}
        <div className="flex lg:hidden items-center justify-between pb-3 border-b border-white/10">
          <span className="font-display font-bold text-sm tracking-wider uppercase text-text-primary">Menu Điều Hướng</span>
          <button onClick={onCloseMobile} className="p-1 text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Thư Viện Nav */}
        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-text-secondary mb-3 px-2 flex items-center gap-1.5">
            <Library className="w-3.5 h-3.5 text-accent-primary" />
            Thư Viện Nhạc
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => { onTabChange('albums'); onSelectSource(null); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'albums' && selectedSourceId === null
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40 shadow-accent-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Disc className="w-4 h-4" />
                <span>Tất cả Album</span>
              </div>
              <span className="mono-tech text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {sources.reduce((acc, s) => acc + s.trackCount, 0)}
              </span>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: NGUỒN NHẠC (Vocabulary quy chuẩn từ SRS) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-[11px] font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-accent-primary" />
              Nguồn Nhạc (Sources)
            </h2>
            <span className="text-[10px] mono-tech text-text-muted">{sources.length} thư mục</span>
          </div>

          <div className="space-y-1.5">
            {sources.map((src) => {
              const isSelected = selectedSourceId === src.id;
              const isDisconnected = src.status === 'disconnected';
              const isScanning = src.status === 'scanning';

              return (
                <div
                  key={src.id}
                  onClick={() => onSelectSource(src.id)}
                  className={`group relative p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-accent-primary/15 border-accent-primary/50 text-text-primary'
                      : isDisconnected
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200 hover:bg-rose-500/15'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium truncate flex items-center gap-2 text-text-primary">
                      {isDisconnected ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : isScanning ? (
                        <RefreshCw className="w-3.5 h-3.5 text-accent-primary animate-spin shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{src.name}</span>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] mono-tech text-text-muted">
                    <span>{src.trackCount.toLocaleString()} bài</span>
                    <span className={isDisconnected ? 'text-rose-400 font-semibold' : ''}>
                      {src.lastScan}
                    </span>
                  </div>

                  {isDisconnected && (
                    <div className="mt-2 text-[10px] text-rose-300/80 bg-rose-950/40 p-1.5 rounded border border-rose-500/20">
                      Mất kết nối ổ cứng. Bài hát tạm ẩn.
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={onOpenAddSourceModal}
              className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-white/20 hover:border-accent-primary/60 text-xs font-medium text-text-secondary hover:text-accent-primary flex items-center justify-center gap-2 transition-all bg-white/[0.02] hover:bg-white/[0.06]"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Thêm Thư Mục Nhạc</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="pt-4 border-t border-white/10 text-[11px] mono-tech text-text-muted flex items-center justify-between">
        <span>Prisma Engine</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LAN Ready
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 260px) */}
      <aside className="hidden lg:block w-64 glass-panel border-r border-white/10 shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-out) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[80vw] bg-[#15171C] border-r border-white/14 shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
