import React from 'react';
import { Users, Music } from 'lucide-react';
import { Artist } from '../services/api';

interface ArtistGridProps {
  artists: Artist[];
  onSelectArtist: (artist: Artist) => void;
}

export const ArtistGrid: React.FC<ArtistGridProps> = ({ artists, onSelectArtist }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-primary" />
          <h2 className="font-display font-bold text-xl text-text-primary">Nghệ Sĩ ({artists.length})</h2>
        </div>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl p-8 border border-white/10">
          <Users className="w-12 h-12 text-text-secondary/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text-primary">Chưa có nghệ sĩ nào</h3>
          <p className="text-xs text-text-secondary mt-1">Thêm nguồn nhạc để tự động giải mã thông tin nghệ sĩ từ file nhạc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer text-center flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary/30 to-purple-600/30 border border-white/14 flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-accent-primary" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary truncate max-w-[150px]">
                  {artist.name}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5 flex items-center justify-center gap-1">
                  <Music className="w-3 h-3" />
                  <span>{artist._count?.songs || 0} bài hát</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
