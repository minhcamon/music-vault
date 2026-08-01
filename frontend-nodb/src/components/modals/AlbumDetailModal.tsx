import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useAudio } from '../../contexts/AudioContext';
import { X, Play, Disc, Clock, Trash2 } from 'lucide-react';

export const AlbumDetailModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedAlbum, openConfirmModal } = useUI();
  const { songs, deleteAlbum } = useLibrary();
  const { playSong } = useAudio();

  if (activeModal !== 'album_detail' || !selectedAlbum) return null;

  const albumSongs = songs.filter((s) => s.album === selectedAlbum.title);

  const handleDelete = () => {
    openConfirmModal({
      title: 'Xác nhận Xóa Album',
      message: `Bạn có chắc chắn muốn xóa album "${selectedAlbum.title}" cùng toàn bộ bài hát thuộc album này khỏi thư viện?`,
      confirmText: 'Xóa Album',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await deleteAlbum(selectedAlbum.id, selectedAlbum.title);
        setActiveModal('none');
      },
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onPointerDown={(e) => { if (e.target === e.currentTarget) setActiveModal('none'); }}
    >
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-2xl border border-vault-border p-6 flex flex-col space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-vault-border pb-4">
          <div className="flex items-center gap-3">
            <Disc className="w-6 h-6 text-vault-accent" />
            <h3 className="font-bold text-vault-text text-xl">Chi tiết Album</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Xóa Album này"
            >
              <Trash2 className="w-4 h-4" /> Xóa Album
            </button>
            <button
              onClick={() => setActiveModal('none')}
              className="p-1 rounded-lg hover:bg-white/10 text-vault-muted hover:text-vault-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Album Header Info */}
        <div className="flex items-center gap-6">
          {selectedAlbum.coverBlobUrl ? (
            <img
              src={selectedAlbum.coverBlobUrl}
              alt={selectedAlbum.title}
              className="w-28 h-28 rounded-2xl object-cover shadow-2xl border border-white/10"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent">
              <Disc className="w-14 h-14" />
            </div>
          )}

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-vault-text leading-tight">
              {selectedAlbum.title}
            </h2>
            <p className="text-vault-muted font-medium text-sm">{selectedAlbum.artist}</p>
            <p className="text-xs text-vault-accent font-mono">
              {albumSongs.length} bài hát {selectedAlbum.year ? `• Năm ${selectedAlbum.year}` : ''}
            </p>
            <button
              onClick={() => {
                if (albumSongs.length > 0) playSong(albumSongs[0], albumSongs);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-vault-accent text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-vault-accent/30 hover:bg-vault-accent/90"
            >
              <Play className="w-4 h-4 fill-current" /> Phát toàn bộ album
            </button>
          </div>
        </div>

        {/* Tracklist Table */}
        <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl border border-vault-border bg-white/5">
          <table className="w-full text-left text-sm text-vault-text">
            <thead className="bg-white/5 text-vault-muted uppercase text-xs tracking-wider border-b border-vault-border sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Tên bài</th>
                <th className="px-4 py-3 text-center">Chất lượng</th>
                <th className="px-4 py-3 text-right">
                  <Clock className="w-3.5 h-3.5 inline" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {albumSongs.map((song, idx) => (
                <tr
                  key={song.id}
                  onClick={() => playSong(song, albumSongs)}
                  className="hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-vault-muted text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{song.title}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bronze-badge px-2 py-0.5 rounded text-[10px]">
                      {song.bitrate || 'FLAC'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-vault-muted">
                    {Math.floor(song.duration / 60)}:
                    {Math.floor(song.duration % 60) < 10 ? '0' : ''}
                    {Math.floor(song.duration % 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
