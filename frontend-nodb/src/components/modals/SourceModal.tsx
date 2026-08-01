import React, { useState } from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { ProviderRegistry } from '../../providers';
import type { SourceType } from '../../types';
import { X, Folder, Cloud, Database } from 'lucide-react';

export const SourceModal: React.FC = () => {
  const { activeModal, setActiveModal } = useUI();
  const { addSource, scanSource } = useLibrary();

  const providerMetas = ProviderRegistry.getAllMetas();

  const [selectedType, setSelectedType] = useState<SourceType>('LOCAL');
  const [sourceName, setSourceName] = useState('');
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [localDirHandle, setLocalDirHandle] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (activeModal !== 'add_source') return null;

  const currentMeta = providerMetas.find((m) => m.type === selectedType);

  const handlePickLocalDirectory = async () => {
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
      // Trigger scan immediately
      scanSource(sourceId);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onPointerDown={(e) => { if (e.target === e.currentTarget) setActiveModal('none'); }}
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-vault-border p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-vault-border pb-4">
          <h3 className="font-bold text-vault-text text-xl">Thêm Nguồn Nhạc Mới</h3>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-lg hover:bg-white/10 text-vault-muted hover:text-vault-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
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
                onClick={handlePickLocalDirectory}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-vault-accent/50 bg-vault-accent/10 hover:bg-vault-accent/20 text-vault-accent font-medium text-sm flex items-center justify-center gap-2 transition-colors"
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

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-vault-muted text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-vault-accent text-white font-medium text-sm shadow-lg shadow-vault-accent/30 hover:bg-vault-accent/90"
            >
              Lưu & Quét Nhạc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
