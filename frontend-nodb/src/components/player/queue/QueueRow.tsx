import React, { memo, useRef, useState } from 'react';
import type { Song } from '../../../types';
import { Play, Music, Volume2, GripVertical } from 'lucide-react';
import { CoverImage } from '../../common/CoverImage';
import { QueueRowActions } from './QueueRowActions';

export interface QueueRowProps {
  song: Song;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isHidden: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isTouchDragging?: boolean;
  isTouchDragOver?: boolean;
  onPlay: (song: Song) => void;
  onToggleHide: (songId: string, e: React.MouseEvent) => void;
  onRemove: (songId: string, e: React.MouseEvent) => void;
  onDragStart: (index: number, e: React.DragEvent) => void;
  onDragOver: (index: number, e: React.DragEvent) => void;
  onDragLeave: (index: number, e: React.DragEvent) => void;
  onDrop: (index: number, e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onTouchDragStart?: (index: number) => void;
  onTouchDragMove?: (clientX: number, clientY: number) => void;
  onTouchDragEnd?: () => void;
}

/**
 * Component hiển thị một hàng bài hát trong Hàng đợi phát
 * Hỗ trợ: Drag & Drop Reorder (Desktop & Mobile Long-press Hold), Mobile Touch Swipe-to-reveal, Desktop Hover-to-reveal
 */
export const QueueRow = memo<QueueRowProps>(
  ({
    song,
    index,
    isCurrent,
    isPlaying,
    isHidden,
    isDragging,
    isDragOver,
    isTouchDragging = false,
    isTouchDragOver = false,
    onPlay,
    onToggleHide,
    onRemove,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onTouchDragStart,
    onTouchDragMove,
    onTouchDragEnd,
  }) => {
    const [swipeOffset, setSwipeOffset] = useState<number>(0);
    const [isSwiping, setIsSwiping] = useState<boolean>(false);
    const [isHoldingProgress, setIsHoldingProgress] = useState<boolean>(false);

    const touchStartRef = useRef<{ x: number; y: number; initialOffset: number } | null>(null);
    const isHorizontalSwipeRef = useRef<boolean | null>(null);
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTouchDragActiveRef = useRef<boolean>(false);

    const formatTime = (secs: number) => {
      if (!secs || isNaN(secs)) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // ─── Touch Gesture Handlers (Swipe & Long-press Hold Drag) ────────────────
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        initialOffset: swipeOffset,
      };
      isHorizontalSwipeRef.current = null;
      isTouchDragActiveRef.current = false;
      setIsHoldingProgress(true);

      // Bắt đầu đếm thời gian Nhấn Giữ (Hold 650ms) để kích hoạt Kéo thả trên Mobile
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        isTouchDragActiveRef.current = true;
        setIsHoldingProgress(false);
        setSwipeOffset(0); // Hủy swipe nếu chuyển sang drag mode

        // Rung phản hồi haptic nếu thiết bị hỗ trợ
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(45);
          } catch {
            // ignore
          }
        }

        onTouchDragStart?.(index);
      }, 650);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.hypot(deltaX, deltaY);

      // Nếu người dùng di chuyển tay trước khi hết thời gian Hold -> Hủy chế độ Hold
      if (!isTouchDragActiveRef.current && distance > 10) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        setIsHoldingProgress(false);
      }

      // NẾU ĐANG TRONG CHẾ ĐỘ KÉO THẢ TOUCH DRAG
      if (isTouchDragActiveRef.current) {
        if (e.cancelable) e.preventDefault();
        onTouchDragMove?.(touch.clientX, touch.clientY);
        return;
      }

      // Xác định hướng vuốt ngang cho Swipe-to-reveal
      if (isHorizontalSwipeRef.current === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      // Nếu vuốt ngang, cập nhật vị trí trượt và ngăn cuộn trang
      if (isHorizontalSwipeRef.current) {
        setIsSwiping(true);
        let newOffset = touchStartRef.current.initialOffset + deltaX;
        // Giới hạn khoảng vuốt: tối đa -80px sang trái, và tối đa 0px sang phải
        if (newOffset > 0) newOffset = 0;
        if (newOffset < -80) newOffset = -80 - (newOffset + 80) * 0.2; // Damping
        setSwipeOffset(newOffset);
      }
    };

    const handleTouchEnd = () => {
      setIsHoldingProgress(false);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      // Nếu đang trong chế độ Kéo thả Touch -> Kết thúc thả bài
      if (isTouchDragActiveRef.current) {
        isTouchDragActiveRef.current = false;
        onTouchDragEnd?.();
        touchStartRef.current = null;
        isHorizontalSwipeRef.current = null;
        return;
      }

      setIsSwiping(false);
      touchStartRef.current = null;
      isHorizontalSwipeRef.current = null;

      // Snap logic: nếu kéo quá -35px thì mở rộng để lộ cụm action (-80px), ngược lại đóng về 0
      if (swipeOffset < -35) {
        setSwipeOffset(-80);
      } else {
        setSwipeOffset(0);
      }
    };

    const handleRowClick = () => {
      // Nếu đang mở swipe hoặc vừa kéo thả, click sẽ đóng lại thay vì phát nhạc
      if (swipeOffset !== 0 || isTouchDragActiveRef.current) {
        setSwipeOffset(0);
        return;
      }
      onPlay(song);
    };

    return (
      <div
        data-queue-index={index}
        className={`relative overflow-hidden rounded-xl group/item shrink-0 transition-all duration-200 ${
          isTouchDragging
            ? 'scale-[1.03] ring-2 ring-vault-accent border-vault-accent shadow-[0_10px_30px_rgba(245,158,11,0.25)] z-40'
            : isHoldingProgress
            ? 'scale-[0.99] ring-1 ring-amber-500/50'
            : 'shadow-sm'
        }`}
      >
        {/* Drop Insertion Indicator Line (Hiện khi DragOver trên Desktop hoặc Touch DragOver trên Mobile) */}
        {(isDragOver || isTouchDragOver) && (
          <div className="absolute inset-x-1 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,1)] z-50 animate-pulse pointer-events-none" />
        )}

        {/* Long-press Hold visual feedback bar */}
        {isHoldingProgress && !isTouchDragging && (
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-vault-accent animate-pulse z-30" />
        )}

        {/* ─── NỘI DUNG CHÍNH CỦA ROW ────────────────────────────────────────── */}
        <div
          draggable
          onDragStart={(e) => onDragStart(index, e)}
          onDragOver={(e) => onDragOver(index, e)}
          onDragLeave={(e) => onDragLeave(index, e)}
          onDrop={(e) => onDrop(index, e)}
          onDragEnd={onDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={handleRowClick}
          className={`group relative z-10 flex items-center justify-between px-3 py-2.5 rounded-xl select-none cursor-pointer border transition-colors ${
            isDragging || isTouchDragging
              ? 'opacity-70 border-dashed border-vault-accent bg-vault-accent/20'
              : isCurrent
              ? 'bg-amber-500/10 border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
              : 'bg-[#13100E] hover:bg-stone-800/40 border-transparent hover:border-white/5'
          } ${
            isHidden ? 'opacity-35 hover:opacity-75' : 'opacity-100'
          } ${
            isDragOver || isTouchDragOver
              ? 'ring-2 ring-vault-accent/60 border-vault-accent bg-vault-accent/15 scale-[1.01]'
              : ''
          }`}
        >
          {/* ─── LEFT: Index / Grip, Cover & Track Metadata (Trượt nhẹ khi vuốt) ─ */}
          <div
            className="flex items-center gap-3 min-w-0 flex-1 mr-2"
            style={{
              transform: `translateX(${swipeOffset}px)`,
              transition: isSwiping ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* Slot thứ tự: Mặc định hiện số hoặc sóng âm; khi hover biến thành Drag Handle 6-chấm */}
            <div className="w-6 h-6 flex items-center justify-center shrink-0 text-vault-muted">
              {isCurrent ? (
                isPlaying ? (
                  <Volume2 className="w-4 h-4 text-vault-accent animate-pulse group-hover:hidden" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-vault-accent fill-current group-hover:hidden" />
                )
              ) : (
                <span className="text-xs font-mono group-hover:hidden">{index + 1}</span>
              )}
              {/* Hiện GripVertical khi rê chuột */}
              <GripVertical
                className="w-4 h-4 text-vault-muted/70 hidden group-hover:block cursor-grab active:cursor-grabbing hover:text-vault-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Thumbnail Cover Art */}
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-900 border border-white/5 shadow-inner flex items-center justify-center">
              <CoverImage
                coverId={song.coverId}
                coverBlobUrl={song.coverBlobUrl}
                alt={song.title}
                fallbackIcon={<Music className="w-4 h-4 text-vault-accent/60" />}
              />
              {isCurrent && isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-vault-accent animate-ping" />
                </div>
              )}
            </div>

            {/* Track Title & Artist / Album */}
            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center gap-1.5">
                <h4
                  className={`text-xs sm:text-sm font-medium truncate transition-colors duration-150 ${
                    isCurrent
                      ? 'text-vault-accent font-semibold'
                      : 'text-stone-200 group-hover:text-white'
                  } ${isHidden ? 'line-through text-stone-400 decoration-stone-500/60' : ''}`}
                >
                  {song.title}
                </h4>
                {isHidden && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    Ẩn
                  </span>
                )}
              </div>
              <p className="text-[11px] text-vault-muted truncate">
                {song.artist} <span className="opacity-50">•</span> {song.album}
              </p>
            </div>
          </div>

          {/* ─── RIGHT: Duration (Idle) / Unified Action Set (Hover & Swipe) ─── */}
          <div className="flex items-center justify-end shrink-0 relative min-w-[50px]">
            {/* Thời lượng bài hát: Hiện khi idle, ẩn khi rê chuột hoặc khi đang swipe */}
            <span
              className={`text-xs font-mono text-vault-muted transition-all text-right tabular-nums ${
                swipeOffset !== 0 ? 'hidden' : 'group-hover:hidden'
              }`}
            >
              {formatTime(song.duration)}
            </span>

            {/* Bộ Action duy nhất: Hiện khi Hover trên desktop HOẶC khi Swipe trên mobile */}
            <div
              className={`${
                swipeOffset < 0 ? 'flex' : 'hidden group-hover:flex'
              }`}
            >
              <QueueRowActions
                songId={song.id}
                isHidden={isHidden}
                onToggleHide={onToggleHide}
                onRemove={onRemove}
                onActionComplete={() => setSwipeOffset(0)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QueueRow.displayName = 'QueueRow';
