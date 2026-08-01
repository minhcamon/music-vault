import React, { useState } from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { ProviderRegistry } from '../../providers';
import type { SourceType } from '../../types';
import { Folder, Cloud, Database, ShieldCheck, HardDrive, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

// ─── Permission Explanation Modal ─────────────────────────────────────────────
interface PermissionModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const PermissionExplainModal: React.FC<PermissionModalProps> = ({ open, onConfirm, onCancel }) => (
  <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
    <DialogContent className="max-w-sm z-[60]">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center shadow-lg shadow-vault-accent/20">
          <ShieldCheck className="w-8 h-8 text-vault-accent" />
        </div>

        <DialogHeader className="border-none pb-0 text-center items-center">
          <DialogTitle className="text-lg">Yêu cầu quyền truy cập</DialogTitle>
          <DialogDescription className="text-sm">
            Trình duyệt sẽ hiển thị hộp thoại yêu cầu quyền đọc thư mục nhạc trên máy tính của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 w-full text-left">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <HardDrive className="w-4 h-4 text-vault-accent mt-0.5 shrink-0" />
            <p className="text-xs text-vault-muted leading-relaxed">
              <span className="text-vault-text font-medium">Chỉ đọc nhạc</span> — Ứng dụng chỉ đọc file nhạc, không thay đổi hay xóa bất kỳ file nào.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Đây là yêu cầu bắt buộc của trình duyệt. Bấm <strong className="text-amber-300">"Cho phép"</strong> trong hộp thoại tiếp theo để tiếp tục.
            </p>
          </div>
        </div>

        <DialogFooter className="border-none w-full flex-row gap-3 sm:space-x-0">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Hủy
          </Button>
          <Button onClick={onConfirm} className="flex-1 gap-2">
            <Folder className="w-4 h-4" />
            Chọn thư mục
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
);

export const SourceModal: React.FC = () => {
  const { activeModal, setActiveModal } = useUI();
  const { addSource, scanSource } = useLibrary();

  const providerMetas = ProviderRegistry.getAllMetas();

  const [selectedType, setSelectedType] = useState<SourceType>('LOCAL');
  const [sourceName, setSourceName] = useState('');
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [localDirHandle, setLocalDirHandle] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const isOpen = activeModal === 'add_source';
  const currentMeta = providerMetas.find((m) => m.type === selectedType);

  const handleRequestPickDirectory = () => {
    setShowPermissionModal(true);
  };

  const handlePickLocalDirectory = async () => {
    setShowPermissionModal(false);
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        setLocalDirHandle(handle);
        setSourceName(handle.name);
        setErrorMsg('');
      } else {
        setErrorMsg('Trình duyệt của bạn không hỗ trợ File System Access API. Hãy dùng Chrome / Edge / Opera.');
      }
    } catch (e) {
      console.warn('Pick directory canceled:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sourceName) {
      setErrorMsg('Vui lòng nhập tên nguồn nhạc');
      return;
    }

    if (selectedType === 'LOCAL' && !localDirHandle) {
      setErrorMsg('Vui lòng chọn 1 thư mục trên máy tính');
      return;
    }

    const provider = ProviderRegistry.getProvider(selectedType);
    if (provider) {
      const finalConfig = { ...configValues, folderName: sourceName, directoryHandle: localDirHandle };
      const validation = await provider.validateConfig(finalConfig);
      if (!validation.valid) {
        setErrorMsg(validation.error || 'Cấu hình không hợp lệ');
        return;
      }

      const sourceId = await addSource({
        name: sourceName,
        type: selectedType,
        config: finalConfig,
        enabled: true,
      });

      setActiveModal('none');
      scanSource(sourceId);
    }
  };

  return (
    <>
      <PermissionExplainModal
        open={showPermissionModal}
        onConfirm={handlePickLocalDirectory}
        onCancel={() => setShowPermissionModal(false)}
      />

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setActiveModal('none'); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Thêm Nguồn Nhạc Mới</DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Provider Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs text-vault-muted uppercase font-mono">Chọn loại Nguồn</label>
              <div className="grid grid-cols-3 gap-3">
                {providerMetas.map((meta) => (
                  <button
                    key={meta.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(meta.type);
                      setErrorMsg('');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                      selectedType === meta.type
                        ? 'bg-vault-accent/20 border-vault-accent text-vault-accent shadow-lg shadow-vault-accent/20'
                        : 'bg-white/5 border-vault-border text-vault-muted hover:text-vault-text hover:bg-white/10'
                    }`}
                  >
                    {meta.type === 'LOCAL' && <Folder className="w-6 h-6" />}
                    {meta.type === 'GDRIVE' && <Cloud className="w-6 h-6" />}
                    {meta.type === 'S3' && <Database className="w-6 h-6" />}
                    <span className="text-xs font-semibold">{meta.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-xs text-vault-muted font-mono">Tên hiển thị nguồn</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="VD: Nhạc Lossless HDD / Google Drive"
                className="w-full bg-white/5 border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text focus:outline-none focus:border-vault-accent"
              />
            </div>

            {/* Local Folder Selection */}
            {selectedType === 'LOCAL' && (
              <div className="space-y-2">
                <label className="text-xs text-vault-muted font-mono">Thư mục máy tính</label>
                <button
                  type="button"
                  onClick={handleRequestPickDirectory}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-vault-accent/50 bg-vault-accent/10 hover:bg-vault-accent/20 text-vault-accent font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Folder className="w-5 h-5" />
                  {localDirHandle ? `Đã chọn: ${localDirHandle.name}` : 'Bấm vào đây để chọn thư mục'}
                </button>
              </div>
            )}

            {/* Dynamic Form Fields from Provider Metadata */}
            {selectedType !== 'LOCAL' && currentMeta?.configFields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-xs text-vault-muted font-mono">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={configValues[field.key] || ''}
                  onChange={(e) =>
                    setConfigValues({ ...configValues, [field.key]: e.target.value })
                  }
                  className="w-full bg-white/5 border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text focus:outline-none focus:border-vault-accent"
                />
              </div>
            ))}

            <DialogFooter className="pt-4 border-t border-vault-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveModal('none')}
              >
                Hủy
              </Button>
              <Button type="submit">
                Lưu & Quét Nhạc
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
