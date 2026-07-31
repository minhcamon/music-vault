import React, { useState } from 'react';
import { Play, Heart, Disc, ArrowUpDown, Sparkles } from 'lucide-react';
import { Album } from '../types';
import { Song } from '../services/api';
import { AlbumDetailModal } from './AlbumDetailModal';

interface AlbumGridProps {
  albums: Album[];
  songs: Song[];
  onSelectAlbum: (album: Album) => void;
  onPlayAlbum: (album: Album) => void;
  onPlaySong: (song: Song) => void;
  selectedSourceFilterName?: string | null;
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  songs,
  onSelectAlbum,
  onPlayAlbum,
  onPlaySong,
  selectedSourceFilterName,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'hires' | 'favorite'>('all');
  const [sortBy, setSortBy] = useState<'artist' | 'year' | 'title'>('artist');
  const [selectedModalAlbum, setSelectedModalAlbum] = useState<Album | null>(null);

  // Filter & Sort Logic
  const filteredAlbums = albums.filter((alb) => {
    if (filterType === 'hires') return alb.isHiRes;
    if (filterType === 'favorite') return alb.isFavorite;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
    if (sortBy === 'year') return b.year - a.year;
    return a.title.localeCompare(b.title);
  });

  const handleCardClick = (album: Album) => {
    setSelectedModalAlbum(album);
    onSelectAlbum(album);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl lg:text-2xl text-text-primary tracking-wide">
              Thư Viện Album
            </h2>
            <span className="mono-tech text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-secondary border border-white/10">
              {filteredAlbums.length} album
            </span>
          </div>
          {selectedSourceFilterName && (
            <p className="text-xs text-accent-primary mt-1 font-mono flex items-center gap-1">
              <span>Đang lọc theo nguồn:</span> <strong>{selectedSourceFilterName}</strong>
            </p>
          )}
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Chips */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-accent-primary text-white shadow-accent-glow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('hires')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                filterType === 'hires'
                  ? 'bg-accent-bronzeBg text-accent-bronze border border-accent-bronze/40 shadow-bronze-glow font-mono'
                  : 'text-text-secondary hover:text-accent-bronze'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Hi-Res 24-bit</span>
            </button>
            <button
              onClick={() => setFilterType('favorite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                filterType === 'favorite'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>Yêu thích</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-text-secondary">
            <ArrowUpDown className="w-3.5 h-3.5 text-accent-primary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="artist" className="bg-[#15171C] text-text-primary">Sắp xếp: Nghệ sĩ</option>
              <option value="year" className="bg-[#15171C] text-text-primary">Sắp xếp: Năm phát hành</option>
              <option value="title" className="bg-[#15171C] text-text-primary">Sắp xếp: Tên album</option>
            </select>
          </div>
        </div>
      </div>

      {/* Album Grid Cards */}
      {filteredAlbums.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl p-8 border border-white/10">
          <Disc className="w-12 h-12 text-text-secondary/40 mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-semibold text-text-primary">Không tìm thấy album phù hợp</h3>
          <p className="text-xs text-text-secondary mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc thêm nguồn nhạc mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => handleCardClick(album)}
              className="group glass-panel glass-panel-hover rounded-2xl p-3.5 cursor-pointer relative flex flex-col justify-between"
            >
              {/* Album Art Container with Vinyl Fallback */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#1C1F26] border border-white/10 flex items-center justify-center">
                {album.hasCover && album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  /* Fallback Vinyl Glass Artwork */
                  <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center animate-spin-slow">
                      <div className="w-8 h-8 rounded-full border-2 border-white/40 bg-accent-primary/20 flex items-center justify-center">
                        <Disc className="w-4 h-4 text-accent-primary" />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary mt-2 tracking-widest uppercase">No Cover Tag</span>
                  </div>
                )}

                {/* Quick Play Floating Hover Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayAlbum(album);
                  }}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-accent-primary text-white shadow-accent-glow opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center hover:scale-110"
                  aria-label={`Phát album ${album.title}`}
                >
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                </button>

                {/* Hi-Res Bronze Quality Badge */}
                {album.isHiRes && (
                  <div className="absolute top-2.5 left-2.5 bronze-badge px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1 shadow-bronze-glow">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>HI-RES</span>
                  </div>
                )}
              </div>

              {/* Album Metadata */}
              <div>
                <h3 className="font-display font-semibold text-sm text-text-primary truncate group-hover:text-accent-primary transition-colors">
                  {album.title}
                </h3>
                <p className="text-xs text-text-secondary truncate mt-0.5">{album.artist}</p>

                {/* Technical Format Tag (JetBrains Mono tabular font) */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] mono-tech">
                  <span className="text-accent-bronze font-medium truncate max-w-[130px]">
                    {album.format}
                  </span>
                  <span className="text-text-muted">{album.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album Tracklist Modal */}
      <AlbumDetailModal
        album={selectedModalAlbum}
        songs={songs}
        onClose={() => setSelectedModalAlbum(null)}
        onPlaySong={(song) => {
          onPlaySong(song);
          setSelectedModalAlbum(null);
        }}
      />
    </div>
  );
};
