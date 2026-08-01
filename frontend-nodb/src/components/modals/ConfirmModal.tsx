import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useUI();

  if (!confirmModal.isOpen) return null;

  const isDanger = confirmModal.confirmVariant !== 'primary';

  const handleConfirm = async () => {
    try {
      await confirmModal.onConfirm();
    } catch (e) {
      console.error('Confirm action failed:', e);
    } finally {
      closeConfirmModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-vault-border p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDanger ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-vault-accent/15 text-vault-accent border border-vault-accent/30'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-vault-text text-lg">{confirmModal.title}</h3>
          </div>
          <button
            onClick={closeConfirmModal}
            className="p-1 rounded-lg hover:bg-white/10 text-vault-muted hover:text-vault-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-vault-muted leading-relaxed">
          {confirmModal.message}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-vault-muted hover:text-vault-text text-sm font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm shadow-lg transition-colors text-white ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                : 'bg-vault-accent hover:bg-vault-accent/90 shadow-vault-accent/30'
            }`}
          >
            {confirmModal.confirmText || (isDanger ? 'Xác nhận xóa' : 'Xác nhận')}
          </button>
        </div>
      </div>
    </div>
  );
};
