import React, { useState } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { useUI } from '../contexts/UIContext';
import { Disc, Play, Trash2, Sparkles, ArrowUpDown, FolderPlus } from 'lucide-react';
import { CoverImage } from '../components/common/CoverImage';

type AlbumFilter = 'all' | 'hires' | 'multi';
type AlbumSort = 'title' | 'artist' | 'year' | 'songs';

export const AlbumsView: React.FC = () => {
  const { albums, songs, deleteAlbum } = useLibrary();
  const { playSong } = useAudio();
  const { searchQuery, setSelectedAlbum, setActiveModal, openConfirmModal, setViewMode } = useUI();

  const [filterType, setFilterType] = useState<AlbumFilter>('all');
  const [sortBy, setSortBy] = useState<AlbumSort>('title');

  // Helper to check if an album contains Hi-Res songs (24-bit or >48kHz)
  const albumHasHiRes = (albumTitle: string) => {
    return songs.some(
      (s) => s.album === albumTitle && ((s.bitDepth && s.bitDepth >= 24) || (s.sampleRate && s.sampleRate > 48000))
    );
  };

  const filteredAlbums = albums
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.artist.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'hires') {
        return albumHasHiRes(a.title);
      }
      if (filterType === 'multi') {
        return a.songCount >= 5;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'songs') return b.songCount - a.songCount;
      return 0;
    });

  const handleQuickPlayAlbum = (e: React.MouseEvent, album: typeof albums[0]) => {
    e.stopPropagation();
    const albumSongs = songs.filter((s) => s.album === album.title);
    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* ─── Header & Controls Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-vault-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-vault-text tracking-tight font-heading">
              Danh Sách Album
            </h1>
            <span className="mono-tech text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-vault-muted border border-white/10">
              {filteredAlbums.length} album
            </span>
          </div>
          <p className="text-xs text-vault-muted mt-1">
            Bộ sưu tập album từ các nguồn lưu trữ đã kết nối
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Chips */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-vault-accent text-white shadow-lg shadow-vault-accent/30'
                  : 'text-vault-muted hover:text-vault-text'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('hires')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'hires'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono shadow-sm'
                  : 'text-vault-muted hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Hi-Res 24-bit</span>
            </button>
            <button
              onClick={() => setFilterType('multi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'multi'
                  ? 'bg-white/20 text-white'
                  : 'text-vault-muted hover:text-vault-text'
              }`}
            >
              &ge; 5 bài
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-vault-muted">
            <ArrowUpDown className="w-3.5 h-3.5 text-vault-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as AlbumSort)}
              className="bg-transparent text-vault-text focus:outline-none cursor-pointer"
            >
              <option value="title" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Tên album (A-Z)</option>
              <option value="artist" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Nghệ sĩ</option>
              <option value="year" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Năm phát hành</option>
              <option value="songs" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Số lượng bài</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Grid Albums / Empty State ───────────────────────────────────── */}
      {filteredAlbums.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 sm:p-14 text-center text-vault-muted space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-vault-accent">
            <Disc className="w-8 h-8 animate-spin-slow opacity-60" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-vault-text font-heading">
              {albums.length === 0 ? 'Chưa có album nào' : 'Không tìm thấy album phù hợp'}
            </h3>
            <p className="text-xs text-vault-muted mt-1">
              {albums.length === 0
                ? 'Hãy thêm một Nguồn Nhạc để bộ quét tự động phân nhóm Album theo metadata.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc.'}
            </p>
          </div>
          {albums.length === 0 && (
            <button
              onClick={() => {
                setViewMode('sources');
                setActiveModal('add_source');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vault-accent text-white font-medium text-xs hover:bg-vault-accent/90 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Thêm Nguồn Nhạc</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {filteredAlbums.map((album) => {
            const isHiRes = albumHasHiRes(album.title);

            return (
              <div
                key={album.id}
                onClick={() => {
                  setSelectedAlbum(album);
                  setActiveModal('album_detail');
                }}
                className="glass-panel glass-panel-hover rounded-2xl p-3 sm:p-4 cursor-pointer group space-y-2 sm:space-y-3 relative flex flex-col justify-between shadow-lg"
              >
                {/* Delete Album Button */}
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
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
                  title="Xóa Album"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Cover Container */}
                <div className="aspect-square rounded-xl bg-white/5 overflow-hidden relative flex items-center justify-center border border-white/10 shadow-md">
                  <CoverImage
                    coverId={album.coverId}
                    coverBlobUrl={album.coverBlobUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackIcon={<Disc className="w-12 h-12 sm:w-16 sm:h-16 text-vault-accent/40 animate-spin-slow" />}
                  />

                  {/* Hi-Res Badge on Cover Top Left */}
                  {isHiRes && (
                    <div className="absolute top-2.5 left-2.5 bronze-badge px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-md z-10">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>HI-RES</span>
                    </div>
                  )}

                  {/* Floating Quick Play Button */}
                  <div
                    onClick={(e) => handleQuickPlayAlbum(e, album)}
                    className="absolute bottom-2.5 right-2.5 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-vault-accent text-white flex items-center justify-center shadow-lg shadow-vault-accent/40 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 z-10"
                    title="Phát toàn bộ album"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Album Metadata */}
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-vault-text truncate group-hover:text-vault-accent transition-colors font-heading">
                    {album.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-vault-muted truncate mt-0.5">{album.artist}</p>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-vault-muted font-mono mt-1.5 pt-1.5 border-t border-white/5">
                    <span className="text-vault-accent font-bold">{album.songCount} bài</span>
                    {album.year ? <span>{album.year}</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

