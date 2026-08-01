import React from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { useUI } from '../contexts/UIContext';
import { Play, Music, Clock, Info } from 'lucide-react';

export const SongsView: React.FC = () => {
  const { songs } = useLibrary();
  const { playSong, currentSong } = useAudio();
  const { searchQuery, setSelectedSong, setActiveModal } = useUI();

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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vault-text">Tất cả bài hát</h1>
          <p className="text-sm text-vault-muted">
            {filteredSongs.length} bài hát trong thư viện
          </p>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-vault-muted space-y-3">
          <Music className="w-12 h-12 mx-auto text-vault-accent opacity-50" />
          <p className="text-lg font-medium">Chưa có bài hát nào</p>
          <p className="text-sm">Hãy thêm một Nguồn Nhạc (Local hoặc Cloud) để quét bài hát vào thư viện.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-vault-border">
          <table className="w-full text-left text-sm text-vault-text">
            <thead className="bg-white/5 text-vault-muted uppercase text-xs tracking-wider border-b border-vault-border">
              <tr>
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Tên bài hát</th>
                <th className="px-6 py-4">Nghệ sĩ</th>
                <th className="px-6 py-4">Album</th>
                <th className="px-6 py-4 text-center">Chất lượng</th>
                <th className="px-6 py-4 text-right">
                  <Clock className="w-4 h-4 inline" />
                </th>
                <th className="px-4 py-4 w-12 text-center">Chi tiết</th>
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
                    <td className="px-6 py-4 font-mono text-vault-muted">
                      <span className={isCurrent ? 'hidden' : 'group-hover:hidden'}>
                        {index + 1}
                      </span>
                      <Play
                        className={`w-4 h-4 text-vault-accent fill-current ${
                          isCurrent ? 'block' : 'hidden group-hover:block'
                        }`}
                      />
                    </td>

                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      {song.coverBlobUrl ? (
                        <img
                          src={song.coverBlobUrl}
                          alt={song.title}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent">
                          <Music className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className={`font-bold ${isCurrent ? 'text-vault-accent' : 'text-vault-text'}`}>
                          {song.title}
                        </div>
                        <div className="text-xs text-vault-muted font-mono">{song.format}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-vault-muted font-medium">{song.artist}</td>
                    <td className="px-6 py-4 text-vault-muted">{song.album}</td>

                    <td className="px-6 py-4 text-center">
                      <span className="bronze-badge px-2 py-0.5 rounded text-xs font-semibold">
                        {song.bitrate || 'Lossless'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-vault-muted">
                      {formatTime(song.duration)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSong(song);
                          setActiveModal('song_detail');
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-vault-muted hover:text-vault-text transition-colors"
                        title="Xem chi tiết bài hát"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
