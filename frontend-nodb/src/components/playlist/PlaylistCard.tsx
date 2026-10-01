import React from 'react';
import type { Playlist, Song } from '../../types';
import { usePlaylists } from '../../hooks/usePlaylists';
import { CoverImage } from '../common/CoverImage';
import { Play, Pin, ListMusic, Music, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PlaylistCardProps {
  playlist: Playlist;
  allSongs: Song[];
  onSelect: () => void;
  onPlay: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  allSongs,
  onSelect,
  onPlay,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const { getPlaylistWithStats } = usePlaylists();
  const stats = getPlaylistWithStats(playlist, allSongs);

  // Lấy danh sách ảnh bìa bài hát có sẵn để tạo collage
  const coverSongs = stats.songs.filter((s) => !!s.coverId || !!s.coverBlobUrl).slice(0, 4);

  return (
    <div
      onClick={onSelect}
      className={`group relative glass-panel rounded-3xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-vault-accent/40 hover:shadow-xl hover:shadow-vault-accent/10 cursor-pointer flex flex-col justify-between overflow-hidden ${
        playlist.isPinned ? 'border-vault-accent/30 bg-vault-accent/[0.03]' : ''
      }`}
    >
      {/* Pinned Indicator Badge */}
      {playlist.isPinned && (
        <div className="absolute top-3 left-3 z-20">
          <Badge variant="bronze" className="text-[10px] px-2 py-0.5 gap-1 shadow-md">
            <Pin className="w-3 h-3 fill-current text-amber-300" /> Đã ghim
          </Badge>
        </div>
      )}

      {/* Top Menu Dropdown / Actions */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePin}
          title={playlist.isPinned ? 'Bỏ ghim' : 'Ghim playlist'}
          className={`p-1.5 rounded-xl backdrop-blur-md border transition-all ${
            playlist.isPinned
              ? 'bg-vault-accent text-white border-vault-accent'
              : 'bg-black/60 text-vault-muted hover:text-white border-white/10'
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onEdit}
          title="Chỉnh sửa playlist"
          className="p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-vault-muted hover:text-white border border-white/10 backdrop-blur-md transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          title="Xóa playlist"
          className="p-1.5 rounded-xl bg-black/60 hover:bg-red-500/80 text-vault-muted hover:text-white border border-white/10 backdrop-blur-md transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cover Art Stage */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3.5 border border-white/10 bg-black/40 shadow-inner group-hover:shadow-2xl transition-all flex items-center justify-center">
        {coverSongs.length >= 4 ? (
          /* 4-Cover Art Collage Grid */
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-black/50 p-0.5">
            {coverSongs.slice(0, 4).map((s, idx) => (
              <div key={idx} className="relative w-full h-full overflow-hidden bg-vault-accent/10">
                <CoverImage
                  coverId={s.coverId}
                  coverBlobUrl={s.coverBlobUrl}
                  alt={s.title}
                  className="w-full h-full object-cover"
                  fallbackIcon={<Music className="w-4 h-4 text-vault-accent/50" />}
                />
              </div>
            ))}
          </div>
        ) : coverSongs.length > 0 ? (
          /* Single / Main Cover */
          <CoverImage
            coverId={coverSongs[0].coverId}
            coverBlobUrl={coverSongs[0].coverBlobUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackIcon={<ListMusic className="w-12 h-12 text-vault-accent/60" />}
          />
        ) : (
          /* Empty / Default Vinyl Graphic */
          <div className="w-full h-full bg-gradient-to-br from-vault-accent/20 via-black to-stone-900 flex flex-col items-center justify-center text-vault-accent/70 gap-2">
            <ListMusic className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Quick Play Hover Button */}
        {stats.validSongs.length > 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
            <Button
              variant="default"
              size="icon-lg"
              onClick={onPlay}
              className="rounded-full shadow-2xl shadow-vault-accent/60 hover:scale-110 transition-transform"
              title="Phát tất cả"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Playlist Meta Details */}
      <div className="space-y-1">
        <h4 className="font-bold text-sm sm:text-base text-vault-text group-hover:text-vault-accent transition-colors truncate">
          {playlist.name}
        </h4>
        {playlist.description ? (
          <p className="text-xs text-vault-muted truncate leading-relaxed">
            {playlist.description}
          </p>
        ) : (
          <p className="text-xs text-vault-muted/60 italic truncate">
            Không có mô tả
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-vault-muted pt-1.5 border-t border-white/5 font-mono">
          <span>{stats.songs.length} bài hát</span>
          {stats.hiddenSongs.length > 0 && (
            <span className="text-amber-400/80 font-medium">({stats.hiddenSongs.length} ẩn)</span>
          )}
          <span>{stats.formattedDuration}</span>
        </div>
      </div>
    </div>
  );
};
