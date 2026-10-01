import React, { useState } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { useUI } from '../contexts/UIContext';
import { Play, Pause, Music, Clock, Sparkles, ArrowUpDown, Disc, FolderPlus, ListPlus } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { CoverImage } from '../components/common/CoverImage';

type SongFilter = 'all' | 'hires' | 'flac' | 'mp3';
type SongSort = 'title' | 'artist' | 'album' | 'duration' | 'year';

export const SongsView: React.FC = () => {
  const { songs } = useLibrary();
  const { playSong, togglePlayPause, currentSong, isPlaying } = useAudio();
  const { searchQuery, setViewMode, setActiveModal, setSongToAddToPlaylist } = useUI();

  const [filterType, setFilterType] = useState<SongFilter>('all');
  const [sortBy, setSortBy] = useState<SongSort>('title');

  const filteredSongs = songs
    .filter((s) => {
      // Search matching
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.album.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter chips
      if (filterType === 'hires') {
        return (s.bitDepth && s.bitDepth >= 24) || (s.sampleRate && s.sampleRate > 48000);
      }
      if (filterType === 'flac') {
        return s.format?.toUpperCase() === 'FLAC';
      }
      if (filterType === 'mp3') {
        return s.format?.toUpperCase() === 'MP3';
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'album') return a.album.localeCompare(b.album);
      if (sortBy === 'duration') return (b.duration || 0) - (a.duration || 0);
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
      return 0;
    });

  const totalDurationSecs = filteredSongs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const formatTotalTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours} giờ ${mins} phút`;
    return `${mins} phút`;
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddToPlaylist = (song: typeof songs[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setSongToAddToPlaylist(song);
    setActiveModal('add_to_playlist');
  };

  const handleRowClick = (song: typeof songs[0]) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song, filteredSongs);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* ─── Header & Thống Kê ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-vault-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-vault-text tracking-tight font-heading">
              Tất Cả Bài Hát
            </h1>
            <span className="mono-tech text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-vault-muted border border-white/10">
              {filteredSongs.length} bài
            </span>
          </div>
          <p className="text-xs text-vault-muted mt-1 flex items-center gap-2">
            <span>Tổng thời lượng: <strong className="text-vault-text font-mono">{formatTotalTime(totalDurationSecs)}</strong></span>
            <span>•</span>
            <span>Chất lượng Hi-Fi Lossless</span>
          </p>
        </div>

        {/* Filter Chips & Sort Controls */}
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
              onClick={() => setFilterType('flac')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-mono cursor-pointer ${
                filterType === 'flac'
                  ? 'bg-white/20 text-white'
                  : 'text-vault-muted hover:text-vault-text'
              }`}
            >
              FLAC
            </button>
            <button
              onClick={() => setFilterType('mp3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-mono cursor-pointer ${
                filterType === 'mp3'
                  ? 'bg-white/20 text-white'
                  : 'text-vault-muted hover:text-vault-text'
              }`}
            >
              MP3
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-vault-muted">
            <ArrowUpDown className="w-3.5 h-3.5 text-vault-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SongSort)}
              className="bg-transparent text-vault-text focus:outline-none cursor-pointer"
            >
              <option value="title" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Tên bài hát (A-Z)</option>
              <option value="artist" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Nghệ sĩ</option>
              <option value="album" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Album</option>
              <option value="duration" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Thời lượng</option>
              <option value="year" className="bg-[#1C1917] text-[#FAFAF9]">Sắp xếp: Năm phát hành</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Danh Sách Bài Hát / Empty State ─────────────────────────────── */}
      {filteredSongs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 sm:p-14 text-center text-vault-muted space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-vault-accent">
            <Disc className="w-8 h-8 animate-spin-slow opacity-60" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-vault-text font-heading">
              {songs.length === 0 ? 'Thư viện chưa có bài hát nào' : 'Không tìm thấy bài hát phù hợp'}
            </h3>
            <p className="text-xs text-vault-muted mt-1">
              {songs.length === 0
                ? 'Hãy kết nối thư mục nhạc (Local hoặc Cloud) để bắt đầu trải nghiệm âm thanh Lossless.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.'}
            </p>
          </div>
          {songs.length === 0 && (
            <button
              onClick={() => {
                setViewMode('sources');
                setActiveModal('add_source');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vault-accent text-white font-medium text-xs hover:bg-vault-accent/90 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Thêm Nguồn Nhạc Mới</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-vault-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-vault-text">
              <thead className="bg-white/5 text-vault-muted uppercase text-[10px] sm:text-xs tracking-wider border-b border-vault-border">
                <tr>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3.5 w-12 text-center">#</th>
                  <th className="px-3 sm:px-6 py-3.5">Tên bài hát</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3.5">Nghệ sĩ</th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3.5">Album</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3.5 text-center">Chất lượng</th>
                  <th className="px-3 sm:px-6 py-3.5 text-right w-20">
                    <Clock className="w-3.5 h-3.5 inline" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSongs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isCurrentActive = isCurrent && isPlaying;

                  return (
                    <tr
                      key={song.id}
                      onClick={() => handleRowClick(song)}
                      className={`group cursor-pointer hover:bg-white/10 transition-colors ${
                        isCurrent ? 'bg-vault-accent/15' : ''
                      }`}
                    >
                      {/* # Index / Play / Active Spectrum Indicator */}
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 font-mono text-vault-muted text-center w-12">
                        {isCurrentActive ? (
                          /* Mini Equalizer Spectrum Wave */
                          <div className="flex items-end justify-center gap-0.5 h-4 w-4 mx-auto">
                            <span className="w-1 bg-vault-accent rounded-full animate-spectrum-1" />
                            <span className="w-1 bg-vault-accent rounded-full animate-spectrum-2" />
                            <span className="w-1 bg-vault-accent rounded-full animate-spectrum-3" />
                          </div>
                        ) : isCurrent ? (
                          <Pause className="w-4 h-4 text-vault-accent fill-current mx-auto" />
                        ) : (
                          <>
                            <span className="group-hover:hidden">{index + 1}</span>
                            <Play className="w-4 h-4 text-vault-accent fill-current mx-auto hidden group-hover:block" />
                          </>
                        )}
                      </td>

                      {/* Cover & Track Title */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium flex items-center gap-2.5 sm:gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-vault-accent/20 flex items-center justify-center relative shadow-md">
                          <CoverImage
                            coverId={song.coverId}
                            coverBlobUrl={song.coverBlobUrl}
                            alt={song.title}
                            fallbackIcon={<Music className="w-5 h-5 text-vault-accent" />}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isCurrentActive ? (
                              <Pause className="w-4 h-4 fill-white text-white" />
                            ) : (
                              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="overflow-hidden flex-1 min-w-0">
                          <div className={`font-bold text-xs sm:text-sm truncate transition-colors ${isCurrent ? 'text-vault-accent' : 'text-vault-text group-hover:text-vault-accent'}`}>
                            {song.title}
                          </div>
                          <div className="text-[11px] text-vault-muted sm:hidden truncate mt-0.5">
                            {song.artist} • <span className="opacity-75">{song.album}</span>
                          </div>
                          <div className="text-[10px] text-vault-muted/70 font-mono hidden sm:block mt-0.5">{song.format}</div>
                        </div>
                      </td>

                      {/* Artist */}
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-vault-muted font-medium truncate max-w-[160px]">
                        {song.artist}
                      </td>

                      {/* Album */}
                      <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 text-vault-muted truncate max-w-[180px]">
                        {song.album}
                      </td>

                      {/* Lossless Quality Badge */}
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-center">
                        <Badge variant="bronze" className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300 mr-1 inline" />
                          <span>{song.bitrate || `${song.format} Lossless`}</span>
                        </Badge>
                      </td>

                      {/* Duration & Quick Action (Hover to Reveal) */}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-mono text-vault-muted text-xs sm:text-sm tabular-nums">
                        <div className="flex items-center justify-end min-h-[32px]">
                          {/* Duration: Hiện khi idle, ẩn khi hover */}
                          <span className="group-hover:hidden transition-all">{formatTime(song.duration)}</span>

                          {/* Quick Action: Hiện khi hover thay thế thời lượng */}
                          <button
                            type="button"
                            onClick={(e) => handleAddToPlaylist(song, e)}
                            title="Thêm vào danh sách phát"
                            className="hidden group-hover:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-vault-accent hover:text-black text-vault-accent border border-white/10 hover:border-vault-accent transition-all cursor-pointer text-xs font-sans font-medium animate-in fade-in"
                          >
                            <ListPlus className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Thêm</span>
                          </button>
                        </div>
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

