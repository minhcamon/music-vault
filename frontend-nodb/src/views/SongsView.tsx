import React from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { useUI } from '../contexts/UIContext';
import { Play, Music, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export const SongsView: React.FC = () => {
  const { songs } = useLibrary();
  const { playSong, currentSong } = useAudio();
  const { searchQuery } = useUI();

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-vault-text">Tất cả bài hát</h1>
          <p className="text-xs sm:text-sm text-vault-muted">
            {filteredSongs.length} bài hát trong thư viện
          </p>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center text-vault-muted space-y-3">
          <Music className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-vault-accent opacity-50" />
          <p className="text-base sm:text-lg font-medium">Chưa có bài hát nào</p>
          <p className="text-xs sm:text-sm">Hãy thêm một Nguồn Nhạc (Local hoặc Cloud) để quét bài hát vào thư viện.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-vault-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-vault-text">
              <thead className="bg-white/5 text-vault-muted uppercase text-[10px] sm:text-xs tracking-wider border-b border-vault-border">
                <tr>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3.5 w-12">#</th>
                  <th className="px-3 sm:px-6 py-3.5">Tên bài hát</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3.5">Nghệ sĩ</th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3.5">Album</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3.5 text-center">Chất lượng</th>
                  <th className="px-3 sm:px-6 py-3.5 text-right">
                    <Clock className="w-3.5 h-3.5 inline" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSongs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <tr
                      key={song.id}
                      onClick={() => playSong(song, filteredSongs)}
                      className={`group cursor-pointer hover:bg-white/10 transition-colors ${
                        isCurrent ? 'bg-vault-accent/15' : ''
                      }`}
                    >
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 font-mono text-vault-muted">
                        <span className={isCurrent ? 'hidden' : 'group-hover:hidden'}>
                          {index + 1}
                        </span>
                        <Play
                          className={`w-4 h-4 text-vault-accent fill-current ${
                            isCurrent ? 'block' : 'hidden group-hover:block'
                          }`}
                        />
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center gap-2.5 sm:gap-3">
                        {song.coverBlobUrl ? (
                          <img
                            src={song.coverBlobUrl}
                            alt={song.title}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent shrink-0">
                            <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                        <div className="overflow-hidden flex-1 min-w-0">
                          <div className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-vault-accent' : 'text-vault-text'}`}>
                            {song.title}
                          </div>
                          <div className="text-[11px] text-vault-muted sm:hidden truncate">
                            {song.artist}
                          </div>
                          <div className="text-[10px] text-vault-muted/70 font-mono hidden sm:block">{song.format}</div>
                        </div>
                      </td>

                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-vault-muted font-medium truncate max-w-[150px]">
                        {song.artist}
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 text-vault-muted truncate max-w-[180px]">
                        {song.album}
                      </td>

                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-center">
                        <Badge variant="bronze" className="text-[10px] sm:text-xs font-semibold px-2 py-0.5">
                          {song.bitrate || 'Lossless'}
                        </Badge>
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-mono text-vault-muted text-xs sm:text-sm">
                        {formatTime(song.duration)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
