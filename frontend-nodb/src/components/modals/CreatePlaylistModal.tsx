import React, { useState, useEffect } from 'react';
import { useUI } from '../../contexts/UIContext';
import { usePlaylists } from '../../hooks/usePlaylists';
import { ListMusic, Edit3, Plus, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const CreatePlaylistModal: React.FC = () => {
  const { activeModal, setActiveModal, playlistToEdit, setPlaylistToEdit, setSelectedPlaylist } = useUI();
  const { createPlaylist, updatePlaylist } = usePlaylists();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = activeModal === 'edit_playlist' && !!playlistToEdit;
  const isOpen = activeModal === 'create_playlist' || activeModal === 'edit_playlist';

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && playlistToEdit) {
        setName(playlistToEdit.name);
        setDescription(playlistToEdit.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setError(null);
    }
  }, [isOpen, isEditMode, playlistToEdit]);

  const handleClose = () => {
    setActiveModal('none');
    setPlaylistToEdit(null);
    setName('');
    setDescription('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên danh sách phát.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode && playlistToEdit) {
        await updatePlaylist(playlistToEdit.id, {
          name: trimmedName,
          description: description.trim() || undefined,
        });
        setSelectedPlaylist({
          ...playlistToEdit,
          name: trimmedName,
          description: description.trim() || undefined,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newPl = await createPlaylist({
          name: trimmedName,
          description: description.trim() || undefined,
        });
        setSelectedPlaylist(newPl);
      }

      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu danh sách phát.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-5 sm:p-6 bg-vault-card/95 backdrop-blur-2xl border-white/10 shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vault-accent/20 border border-vault-accent/40 flex items-center justify-center text-vault-accent">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <ListMusic className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-vault-text">
                {isEditMode ? 'Chỉnh Sửa Danh Sách Phát' : 'Tạo Danh Sách Phát Mới'}
              </DialogTitle>
              <p className="text-xs text-vault-muted mt-0.5">
                {isEditMode
                  ? 'Cập nhật tiêu đề và mô tả cho danh sách phát của bạn'
                  : 'Tập hợp các bài hát yêu thích theo chủ đề hoặc cảm xúc'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-vault-text flex items-center justify-between">
              <span>Tên danh sách phát <span className="text-vault-accent">*</span></span>
              <span className="text-[10px] text-vault-muted font-normal">{name.length}/100</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 100));
                if (error) setError(null);
              }}
              placeholder="VD: Tuyển tập Acoustic, Nhạc tập trung..."
              autoFocus
              className="bg-white/5 border-white/10 focus:border-vault-accent rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-vault-text flex items-center justify-between">
              <span>Mô tả (Tùy chọn)</span>
              <span className="text-[10px] text-vault-muted font-normal">{description.length}/300</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              placeholder="Ghi chú ngắn về thể loại, tâm trạng hoặc nguồn cảm hứng..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-vault-accent focus:outline-none text-sm text-vault-text placeholder:text-vault-muted/50 resize-none transition-colors"
            />
          </div>

          <DialogFooter className="pt-2 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="glass"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs sm:text-sm"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting || !name.trim()}
              className="rounded-xl text-xs sm:text-sm shadow-lg shadow-vault-accent/30 gap-1.5"
            >
              {isEditMode ? (
                <>
                  <Sparkles className="w-4 h-4" /> Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Tạo danh sách
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
