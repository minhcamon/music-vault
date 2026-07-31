import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, HardDrive, ChevronRight, ArrowLeft, Check, Music } from 'lucide-react';
import { api, BrowseResult, DirectoryItem } from '../services/api';

interface DirectoryPickerProps {
  onSelectDirectory: (selectedPath: string) => void;
  onCancel: () => void;
}

export const DirectoryPicker: React.FC<DirectoryPickerProps> = ({ onSelectDirectory, onCancel }) => {
  const [drives, setDrives] = useState<string[]>([]);
  const [browseResult, setBrowseResult] = useState<BrowseResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialDrives();
  }, []);

  const loadInitialDrives = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const availableDrives = await api.getDrives();
      setDrives(availableDrives);
      const initialPath = availableDrives[0] || 'C:\\';
      const contents = await api.getDirectoryContents(initialPath);
      setBrowseResult(contents);
    } catch (err: any) {
      setError(err.message || 'Lỗi đọc ổ đĩa');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPath = async (targetPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contents = await api.getDirectoryContents(targetPath);
      setBrowseResult(contents);
    } catch (err: any) {
      setError(err.message || 'Không thể truy cập thư mục này');
    } finally {
      setIsLoading(false);
    }
  };

  if (!browseResult && isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary text-sm flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <span>Đang đọc danh sách ổ đĩa...</span>
      </div>
    );
  }

  const currentPath = browseResult?.currentPath || '';
  const pathParts = currentPath.split(/[\/\\]/).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Drive Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-text-secondary font-mono flex items-center gap-1 shrink-0">
          <HardDrive className="w-3.5 h-3.5 text-accent-primary" />
          <span>Ổ đĩa:</span>
        </span>
        {drives.map((drive) => {
          const isSelected = currentPath.startsWith(drive);
          return (
            <button
              key={drive}
              onClick={() => navigateToPath(drive)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-accent-primary text-white shadow-accent-glow'
                  : 'bg-white/[0.06] text-text-secondary hover:text-text-primary hover:bg-white/[0.12]'
              }`}
            >
              {drive}
            </button>
          );
        })}
      </div>

      {/* Path Breadcrumbs & Go Back */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-text-primary overflow-x-auto">
        {browseResult?.parentPath && (
          <button
            onClick={() => navigateToPath(browseResult.parentPath!)}
            className="p-1 rounded hover:bg-white/10 text-accent-primary shrink-0 flex items-center gap-1"
            title="Quay lại thư mục cha"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lên 1 cấp</span>
          </button>
        )}
        <span className="text-text-secondary">/</span>
        <span className="truncate text-accent-primary font-semibold">{currentPath}</span>
      </div>

      {/* Directory Contents List */}
      <div className="h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2 space-y-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary gap-2">
            <span className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tải thư mục...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-xs text-rose-300 p-4 text-center">
            {error}
          </div>
        ) : browseResult?.items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            Thư mục trống (Không có thư mục con nào).
          </div>
        ) : (
          browseResult?.items.map((item) => (
            <div
              key={item.path}
              onDoubleClick={() => navigateToPath(item.path)}
              onClick={() => navigateToPath(item.path)}
              className="p-2.5 rounded-lg hover:bg-white/[0.08] cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderOpen className="w-4 h-4 text-accent-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-text-primary truncate">{item.name}</span>
              </div>

              {item.audioCount > 0 && (
                <span className="mono-tech text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <Music className="w-2.5 h-2.5" />
                  <span>{item.audioCount} file nhạc</span>
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Pill Button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-[11px] text-text-secondary truncate max-w-[280px]">
          Đã chọn: <strong className="text-text-primary font-mono">{currentPath}</strong>
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSelectDirectory(currentPath)}
            className="px-4 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primaryHover text-white text-xs font-medium shadow-accent-glow flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Chọn thư mục này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
