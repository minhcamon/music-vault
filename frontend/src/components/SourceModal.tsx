import React, { useState, useRef } from 'react';
import { X, FolderPlus, HardDrive, AlertTriangle, CheckCircle2, RefreshCw, FolderSearch, UploadCloud } from 'lucide-react';
import { MusicSource } from '../types';
import { DirectoryPicker } from './DirectoryPicker';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: MusicSource[];
  onAddSource: (name: string, path: string) => void;
  onDeleteSource?: (id: string) => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  isOpen,
  onClose,
  sources,
  onAddSource,
  onDeleteSource,
}) => {
  const [sourceName, setSourceName] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceName && sourcePath) {
      onAddSource(sourceName, sourcePath);
      setSourceName('');
      setSourcePath('');
    }
  };

  // Native OS File Explorer Folder Selection (Standard File Upload Dialog)
  const handleNativeFolderBrowse = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        const selectedName = dirHandle.name;
        if (!sourceName) setSourceName(selectedName);
        setSourcePath(selectedName);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          fileInputRef.current?.click();
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const firstFile = e.target.files[0];
      // @ts-ignore
      const pathValue = firstFile.path || (firstFile.webkitRelativePath ? firstFile.webkitRelativePath.split('/')[0] : '');
      const folderName = firstFile.webkitRelativePath ? firstFile.webkitRelativePath.split('/')[0] : 'Nguồn Nhạc';

      if (!sourceName) setSourceName(folderName);
      if (pathValue) setSourcePath(pathValue);
    }
  };

  const handleSelectServerDirectory = (selectedPath: string) => {
    setSourcePath(selectedPath);
    if (!sourceName) {
      const folderName = selectedPath.split(/[\/\\]/).filter(Boolean).pop() || 'Nguồn Nhạc';
      setSourceName(folderName);
    }
    setIsPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      {/* Hidden Native File Upload Input for webkitdirectory */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="glass-dock rounded-2xl w-full max-w-xl p-6 border border-white/14 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-accent-primary" />
            <h2 className="font-display font-bold text-lg text-text-primary">Quản Lý Nguồn Nhạc (Music Sources)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Picker Mode or Source Form */}
        {isPickerOpen ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
                <FolderSearch className="w-4 h-4" />
                Duyệt & Chọn Thư Mục Cụ Thể Trên Ổ Đĩa
              </h3>
            </div>
            <DirectoryPicker
              onSelectDirectory={handleSelectServerDirectory}
              onCancel={() => setIsPickerOpen(false)}
            />
          </div>
        ) : (
          <>
            {/* Existing Sources List */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary">Danh sách thư mục đang kết nối</h3>

              {sources.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center text-xs text-text-secondary">
                  Chưa có nguồn nhạc nào. Hãy thêm thư mục nhạc bên dưới để bắt đầu!
                </div>
              ) : (
                sources.map((src) => {
                  const isDisconnected = src.status === 'disconnected';
                  return (
                    <div
                      key={src.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDisconnected
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                          : 'bg-white/[0.04] border-white/10 text-text-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm flex items-center gap-2">
                            {isDisconnected ? (
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                            ) : src.status === 'scanning' ? (
                              <RefreshCw className="w-4 h-4 text-accent-primary animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            <span>{src.name}</span>
                          </div>
                          <p className="text-xs mono-tech text-text-secondary">{src.path}</p>
                        </div>

                        <span className="text-xs mono-tech px-2.5 py-1 rounded-full bg-white/10 text-text-secondary">
                          {src.trackCount.toLocaleString()} bài
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Source Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-accent-primary" />
                Thêm Thư Mục Nhạc Mới
              </h3>

              {/* Native OS File Explorer Dialog Trigger Banner */}
              <div
                onClick={handleNativeFolderBrowse}
                className="p-4 rounded-xl border border-dashed border-accent-primary/40 bg-accent-primary/10 hover:bg-accent-primary/15 cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Mở Cửa Sổ Chọn Thư Mục Hệ Điều Hành (File Explorer)</h4>
                    <p className="text-[11px] text-text-secondary">Browse thư mục chuẩn như Upload File (không tải file lên server, chỉ lưu đường dẫn để quét)</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-medium shadow-accent-glow shrink-0">
                  Chọn Thư Mục
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Đường dẫn thư mục được chọn</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={sourcePath}
                      onChange={(e) => setSourcePath(e.target.value)}
                      placeholder="Chọn thư mục từ cửa sổ hệ điều hành ở trên hoặc duyệt ổ đĩa..."
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-text-primary font-mono focus:border-accent-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-text-primary border border-white/10 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all"
                    >
                      <FolderSearch className="w-4 h-4 text-accent-primary" />
                      <span>Duyệt Cây Ổ Đĩa</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-1">Tên hiển thị nguồn nhạc</label>
                  <input
                    type="text"
                    required
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="VD: Ổ D - Lossless Music"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primaryHover text-white text-xs font-medium shadow-accent-glow"
                >
                  Lưu & Quét Nhạc
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
