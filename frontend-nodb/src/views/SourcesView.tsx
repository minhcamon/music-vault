import React from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useUI } from '../contexts/UIContext';
import { Folder, Cloud, Database, Plus, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import type { SourceType } from '../types';

export const SourcesView: React.FC = () => {
  const { sources, scanSource, deleteSource, isScanning, scanProgress } = useLibrary();
  const { setActiveModal, openConfirmModal } = useUI();

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'LOCAL':
        return <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-vault-accent" />;
      case 'GDRIVE':
        return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />;
      case 'S3':
        return <Database className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />;
      default:
        return <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-vault-accent" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-vault-text">Quản lý Nguồn Nhạc (Sources)</h1>
          <p className="text-xs sm:text-sm text-vault-muted">
            Thêm & quét nhạc từ Thư mục máy tính hoặc Cloud (Google Drive, AWS S3)
          </p>
        </div>
        <button
          onClick={() => setActiveModal('add_source')}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-vault-accent text-white text-xs sm:text-sm font-medium flex items-center gap-2 hover:bg-vault-accent/90 transition-colors shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Thêm nguồn nhạc
        </button>
      </div>

      {isScanning && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border-vault-accent/40 space-y-3 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
            <span className="font-semibold text-vault-accent flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Đang quét nhạc... ({scanProgress.processed}/{scanProgress.total})
            </span>
            <span className="text-vault-muted font-mono text-xs truncate max-w-[250px] sm:max-w-xs">{scanProgress.currentFile}</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-vault-accent transition-all duration-200"
              style={{
                width: `${
                  scanProgress.total > 0
                    ? Math.round((scanProgress.processed / scanProgress.total) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sources.map((source) => (
          <div key={source.id} className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5">{getSourceIcon(source.type)}</div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-vault-text">{source.name}</h3>
                  <span className="text-[10px] sm:text-xs text-vault-muted font-mono uppercase">
                    {source.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  openConfirmModal({
                    title: 'Xác nhận Xóa Nguồn Nhạc',
                    message: `Bạn có chắc chắn muốn xóa nguồn nhạc "${source.name}" cùng tất cả bài hát liên quan khỏi thư viện?`,
                    confirmText: 'Xóa Nguồn Nhạc',
                    confirmVariant: 'danger',
                    onConfirm: () => deleteSource(source.id),
                  })
                }
                className="text-vault-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Xóa nguồn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-vault-muted space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span>Số bài hát:</span>
                <span className="text-vault-text font-bold">{source.songCount || 0} bài</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lần quét cuối:</span>
                <span>
                  {source.lastScannedAt
                    ? new Date(source.lastScannedAt).toLocaleTimeString()
                    : 'Chưa quét'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-vault-border flex items-center justify-between">
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
              </span>
              <button
                onClick={() => scanSource(source.id)}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-vault-accent hover:text-white text-xs font-medium text-vault-text transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                Quét ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
