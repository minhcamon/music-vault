import React, { useState } from 'react';
import { X, FolderPlus, HardDrive, AlertTriangle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { MusicSource } from '../types';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: MusicSource[];
  onAddSource: (name: string, path: string) => void;
  onSeedDemo?: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({
  isOpen,
  onClose,
  sources,
  onAddSource,
  onSeedDemo,
}) => {
  const [sourceName, setSourceName] = useState('');
  const [sourcePath, setSourcePath] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceName && sourcePath) {
      onAddSource(sourceName, sourcePath);
      setSourceName('');
      setSourcePath('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
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

        {/* Existing Sources List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary">Danh sách thư mục đang kết nối</h3>

          {sources.map((src) => {
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

                  <span className={`text-xs mono-tech px-2.5 py-1 rounded-full ${
                    isDisconnected ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-text-secondary'
                  }`}>
                    {src.trackCount.toLocaleString()} bài
                  </span>
                </div>

                {isDisconnected && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-xs text-rose-200 flex items-center justify-between gap-2">
                    <span>Thư mục không thể truy cập (ổ cứng ngoài chưa cắm).</span>
                    <button className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-[11px] font-medium border border-rose-500/40">
                      Quét lại
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Source Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <FolderPlus className="w-4 h-4 text-accent-primary" />
            Thêm Thư Mục Nhạc Mới
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Tên hiển thị nguồn nhạc (VD: "Ổ D - Lossless")</label>
              <input
                type="text"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Nhập tên dễ nhớ..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Đường dẫn thư mục trên máy/NAS</label>
              <input
                type="text"
                required
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="Ví dụ: D:\AudioVault\Lossless hoặc \\NAS\Music"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-text-primary font-mono focus:border-accent-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {onSeedDemo && (
              <button
                type="button"
                onClick={onSeedDemo}
                className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo Thư Mục Nhạc Mẫu (Demo)</span>
              </button>
            )}

            <div className="flex gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
};
