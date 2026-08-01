import React from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useUI } from '../contexts/UIContext';
import { User, Trash2 } from 'lucide-react';

export const ArtistsView: React.FC = () => {
  const { artists, deleteArtist } = useLibrary();
  const { searchQuery, openConfirmModal } = useUI();

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-vault-text">Nghệ sĩ</h1>
        <p className="text-sm text-vault-muted">{filtered.length} nghệ sĩ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {filtered.map((artist) => (
          <div
            key={artist.id}
            className="glass-panel glass-panel-hover rounded-2xl p-6 text-center space-y-3 cursor-pointer group relative"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                openConfirmModal({
                  title: 'Xác nhận Xóa Nghệ sĩ',
                  message: `Bạn có chắc chắn muốn xóa nghệ sĩ "${artist.name}" cùng tất cả bài hát & album liên quan khỏi thư viện?`,
                  confirmText: 'Xóa Nghệ sĩ',
                  confirmVariant: 'danger',
                  onConfirm: () => deleteArtist(artist.id, artist.name),
                });
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg"
              title="Xóa Nghệ sĩ"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-24 h-24 mx-auto rounded-full bg-vault-accent/15 flex items-center justify-center text-vault-accent group-hover:scale-105 transition-transform">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-semibold text-vault-text truncate">{artist.name}</h3>
              <p className="text-xs text-vault-muted">
                {artist.albumCount} album • {artist.songCount} bài hát
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
