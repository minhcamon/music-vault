import React, { useState } from 'react';
import { useUI } from '../../contexts/UIContext';
import { usePlaylists } from '../../hooks/usePlaylists';
import { ListPlus, Check, Plus, Music, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { CoverImage } from '../common/CoverImage';

export const AddToPlaylistModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    songToAddToPlaylist,
    setSongToAddToPlaylist,
  } = useUI();
  const { playlists, addSongsToPlaylist, removeSongFromPlaylist } = usePlaylists();

  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null);

  const isOpen = activeModal === 'add_to_playlist' && !!songToAddToPlaylist;

  const handleClose = () => {
    setActiveModal('none');
    setSongToAddToPlaylist(null);
  };

  const handleToggleSongInPlaylist = async (playlistId: string, isAlreadyIn: boolean) => {
    if (!songToAddToPlaylist) return;

    try {
      setLoadingPlaylistId(playlistId);
      if (isAlreadyIn) {
        await removeSongFromPlaylist(playlistId, songToAddToPlaylist.id);
      } else {
        await addSongsToPlaylist(playlistId, [songToAddToPlaylist.id]);
      }
    } catch (err) {
      console.error('Toggle song in playlist failed:', err);
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  const handleOpenCreatePlaylist = () => {
    setActiveModal('create_playlist');
  };

  if (!songToAddToPlaylist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-5 sm:p-6 bg-vault-card/95 backdrop-blur-2xl border-white/10 shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vault-accent/20 border border-vault-accent/40 flex items-center justify-center text-vault-accent">
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-vault-text">Thêm Vào Danh Sách Phát</DialogTitle>
              <p className="text-xs text-vault-muted mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                Bài hát: <span className="text-vault-text font-medium">{songToAddToPlaylist.title}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Target Song Preview Bar */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 my-2">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-vault-accent/20 border border-white/10 shrink-0 flex items-center justify-center">
            <CoverImage
              coverId={songToAddToPlaylist.coverId}
              coverBlobUrl={songToAddToPlaylist.coverBlobUrl}
              alt={songToAddToPlaylist.title}
              fallbackIcon={<Music className="w-5 h-5 text-vault-accent" />}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-vault-text truncate">{songToAddToPlaylist.title}</h4>
            <p className="text-[11px] text-vault-muted truncate">{songToAddToPlaylist.artist} • {songToAddToPlaylist.album}</p>
          </div>
        </div>

        {/* Playlists Selection List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar my-2">
          {playlists.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
              <Sparkles className="w-8 h-8 text-vault-accent/60 mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-vault-muted font-medium">Bạn chưa có danh sách phát nào.</p>
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenCreatePlaylist}
                className="mt-3 text-xs rounded-xl gap-1.5 shadow-md shadow-vault-accent/30"
              >
                <Plus className="w-4 h-4" /> Tạo playlist đầu tiên
              </Button>
            </div>
          ) : (
            playlists.map((pl) => {
              const isSongIn = (pl.songIds || []).includes(songToAddToPlaylist.id);
              const isLoading = loadingPlaylistId === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => !isLoading && handleToggleSongInPlaylist(pl.id, isSongIn)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSongIn
                      ? 'bg-vault-accent/15 border-vault-accent/40 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSongIn ? 'bg-vault-accent text-white shadow-md shadow-vault-accent/40' : 'bg-white/10 text-vault-muted'
                    }`}>
                      {pl.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h5 className="font-semibold text-xs text-vault-text truncate">{pl.name}</h5>
                      <span className="text-[10px] text-vault-muted">{(pl.songIds || []).length} bài hát</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isSongIn
                        ? 'bg-vault-accent text-white shadow-md shadow-vault-accent/40'
                        : 'bg-white/10 text-vault-muted hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {isSongIn ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {playlists.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenCreatePlaylist}
              className="text-xs text-vault-accent hover:text-amber-300 hover:bg-vault-accent/10 rounded-xl gap-1.5 p-0 sm:px-3"
            >
              <Plus className="w-4 h-4" /> Tạo playlist mới
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={handleClose}
              className="rounded-xl text-xs px-4"
            >
              Xong
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
