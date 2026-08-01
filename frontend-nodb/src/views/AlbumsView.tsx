import React from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useUI } from '../contexts/UIContext';
import { Disc, Play, Trash2 } from 'lucide-react';

export const AlbumsView: React.FC = () => {
  const { albums, deleteAlbum } = useLibrary();
  const { searchQuery, setSelectedAlbum, setActiveModal, openConfirmModal } = useUI();

  const filteredAlbums = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vault-text">Danh sách Album</h1>
        <p className="text-sm text-vault-muted">{filteredAlbums.length} album</p>
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-vault-muted">
          <Disc className="w-12 h-12 mx-auto text-vault-accent opacity-50 mb-3" />
          <p className="text-lg font-medium">Chưa có album nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => {
                setSelectedAlbum(album);
                setActiveModal('album_detail');
              }}
              className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer group space-y-3 relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal({
                    title: 'Xác nhận Xóa Album',
                    message: `Bạn có chắc chắn muốn xóa album "${album.title}" cùng tất cả bài hát thuộc album này khỏi thư viện?`,
                    confirmText: 'Xóa Album',
                    confirmVariant: 'danger',
                    onConfirm: () => deleteAlbum(album.id, album.title),
                  });
                }}
                className="absolute top-6 right-6 p-2 rounded-xl bg-black/60 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg"
                title="Xóa Album"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="aspect-square rounded-xl bg-white/5 overflow-hidden relative">
                {album.coverBlobUrl ? (
                  <img
                    src={album.coverBlobUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-vault-accent/40">
                    <Disc className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-vault-accent text-white flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-vault-text truncate">{album.title}</h3>
                <p className="text-xs text-vault-muted truncate">{album.artist}</p>
                <div className="text-xs text-vault-accent/80 font-mono mt-1">
                  {album.songCount} bài hát {album.year ? `• ${album.year}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
