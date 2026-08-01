import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useUI();

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
    <Dialog open={confirmModal.isOpen} onOpenChange={(open) => { if (!open) closeConfirmModal(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-none pb-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDanger
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-vault-accent/15 text-vault-accent border border-vault-accent/30'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg">{confirmModal.title}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm leading-relaxed">
          {confirmModal.message}
        </DialogDescription>

        <DialogFooter className="border-none pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={closeConfirmModal}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={isDanger ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmModal.confirmText || (isDanger ? 'Xác nhận xóa' : 'Xác nhận')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
