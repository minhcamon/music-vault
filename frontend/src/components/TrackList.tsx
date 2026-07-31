import React from 'react';
import { Play, Music, Sparkles } from 'lucide-react';
import { Song } from '../services/api';

interface TrackListProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
  activeSongId?: string;
  isPlaying?: boolean;
}

export const TrackList: React.FC<TrackListProps> = ({ songs, onPlaySong, activeSongId, isPlaying }) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-accent-primary" />
          <h2 className="font-display font-bold text-xl text-text-primary">Tất Cả Bài Hát ({songs.length})</h2>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl p-8 border border-white/10">
          <Music className="w-12 h-12 text-text-secondary/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text-primary">Chưa có bài hát nào trong cơ sở dữ liệu</h3>
          <p className="text-xs text-text-secondary mt-1">Vui lòng chọn "Nguồn Nhạc" rồi bấm "Thêm Thư Mục Nhạc" để quét nhạc từ ổ đĩa của bạn.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {songs.map((song, index) => {
              const isActive = activeSongId === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.06] transition-colors ${
                    isActive ? 'bg-accent-primary/15' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center text-xs font-mono text-text-muted shrink-0">
                      {index + 1}
                    </span>

                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0 relative flex items-center justify-center">
                      {song.coverUrl ? (
                        <img
                          src={`http://localhost:3001${song.coverUrl}`}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-4 h-4 text-accent-primary" />
                      )}
                      <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-accent-primary' : 'text-text-primary'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-text-secondary truncate">
                        {song.artist?.name || 'Unknown Artist'} — <span className="italic">{song.album?.title || 'Single'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="bronze-badge px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{song.format} {song.bitrate || 'Lossless'}</span>
                    </div>
                    <span className="text-xs font-mono text-text-secondary">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
