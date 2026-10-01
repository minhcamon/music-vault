import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useUI } from '../../contexts/UIContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { Song } from '../../types';
import { TooltipProvider } from '../ui/tooltip';
import {
  QueueHeader,
  QueueHiddenFilter,
  QueueEmptyState,
  QueueRow,
} from './queue';

/**
 * LiveQueueDrawer - Drawer hiển thị và điều khiển Hàng đợi phát (Live Queue)
 * Áp dụng SOLID & Separation of Concerns:
 * - Điều phối trạng thái Hàng đợi từ AudioContext & UIContext
 * - Composition Root kết nối QueueHeader, QueueHiddenFilter, QueueEmptyState và QueueRow
 */
export const LiveQueueDrawer: React.FC = () => {
  const {
    queue,
    playSong,
    currentSong,
    isPlaying,
    hiddenQueueSongIds,
    removeSongFromQueue,
    clearQueue,
    reorderQueue,
    toggleHideQueueSong,
    shuffleQueue,
  } = useAudio();
  const { isQueueDrawerOpen, setIsQueueDrawerOpen, openConfirmModal } = useUI();

  const [showHidden, setShowHidden] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Mobile Touch Drag & Drop State
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchDragOverIndex, setTouchDragOverIndex] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, () => setIsQueueDrawerOpen(false), isQueueDrawerOpen);

  const hiddenCount = hiddenQueueSongIds.length;
  const validCount = queue.length - hiddenCount;

  // Lọc danh sách bài hát hiển thị theo toggle showHidden
  const displayQueue = useMemo(() => {
    if (showHidden) return queue;
    const hiddenSet = new Set(hiddenQueueSongIds);
    return queue.filter((s) => !hiddenSet.has(s.id));
  }, [queue, hiddenQueueSongIds, showHidden]);

  // Callback Play
  const handlePlay = useCallback(
    (song: Song) => playSong(song, queue),
    [playSong, queue]
  );

  // HTML5 Desktop Drag & Drop Handlers
  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((index: number) => {
    setDragOverIndex((prev) => (prev === index ? null : prev));
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number, e: React.DragEvent) => {
      e.preventDefault();
      const sourceIndexStr = e.dataTransfer.getData('text/plain');
      const sourceIndex = sourceIndexStr !== '' ? Number(sourceIndexStr) : draggedIndex;

      if (sourceIndex !== null && !isNaN(sourceIndex) && sourceIndex !== targetIndex) {
        reorderQueue(sourceIndex, targetIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, reorderQueue]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Mobile Touch Long-Press Hold Drag & Drop Handlers
  const handleTouchDragStart = useCallback((index: number) => {
    setTouchDragIndex(index);
    setTouchDragOverIndex(index);
  }, []);

  const handleTouchDragMove = useCallback((clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    const rowEl = element?.closest('[data-queue-index]');
    if (rowEl) {
      const targetIdxStr = rowEl.getAttribute('data-queue-index');
      if (targetIdxStr !== null) {
        const targetIdx = Number(targetIdxStr);
        if (!isNaN(targetIdx)) {
          setTouchDragOverIndex(targetIdx);
        }
      }
    }
  }, []);

  const handleTouchDragEnd = useCallback(() => {
    if (
      touchDragIndex !== null &&
      touchDragOverIndex !== null &&
      touchDragIndex !== touchDragOverIndex
    ) {
      reorderQueue(touchDragIndex, touchDragOverIndex);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(30);
        } catch {
          // ignore
        }
      }
    }
    setTouchDragIndex(null);
    setTouchDragOverIndex(null);
  }, [touchDragIndex, touchDragOverIndex, reorderQueue]);

  // Callback Toggle Hide
  const handleToggleHide = useCallback(
    (songId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      toggleHideQueueSong(songId);
    },
    [toggleHideQueueSong]
  );

  // Callback Remove Song
  const handleRemove = useCallback(
    (songId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      removeSongFromQueue(songId);
    },
    [removeSongFromQueue]
  );

  // Callback Clear Queue
  const handleClearAll = useCallback(() => {
    openConfirmModal({
      title: 'Xóa Hàng Đợi Phát',
      message: 'Bạn có chắc chắn muốn xóa tất cả bài hát khỏi hàng đợi phát hiện tại?',
      confirmText: 'Xóa Hàng Đợi',
      confirmVariant: 'danger',
      onConfirm: () => {
        clearQueue();
      },
    });
  }, [openConfirmModal, clearQueue]);

  if (!isQueueDrawerOpen) return null;

  return (
    <TooltipProvider>
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-[60] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ willChange: 'transform' }}
      >
        {/* Blurred Smoked Glass Background Layer */}
        <div className="absolute inset-0 bg-[#0C0A09]/92 backdrop-blur-3xl border-l border-white/10 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-4 sm:p-5 overflow-hidden">
          {/* Header */}
          <QueueHeader
            totalCount={queue.length}
            validCount={validCount}
            hiddenCount={hiddenCount}
            onShuffle={shuffleQueue}
            onClearAll={handleClearAll}
            onClose={() => setIsQueueDrawerOpen(false)}
          />

          {/* Subheader Filter */}
          <QueueHiddenFilter
            hiddenCount={hiddenCount}
            showHidden={showHidden}
            onToggleShowHidden={() => setShowHidden((prev) => !prev)}
            hasItems={queue.length > 0}
          />

          {/* Queue List / Empty State */}
          {queue.length === 0 ? (
            <QueueEmptyState />
          ) : (
            <div
              className="flex-1 overflow-y-auto mt-1 flex flex-col gap-2 p-1 pr-1.5 no-scrollbar"
              style={{
                overscrollBehavior: 'contain',
              }}
            >
              {displayQueue.map((song) => {
                const originalIndex = queue.findIndex((s) => s.id === song.id);
                const isHidden = hiddenQueueSongIds.includes(song.id);
                const isDragging = draggedIndex === originalIndex;
                const isDragOver = dragOverIndex === originalIndex;
                const isTouchDragging = touchDragIndex === originalIndex;
                const isTouchDragOver =
                  touchDragOverIndex === originalIndex && touchDragIndex !== originalIndex;

                return (
                  <QueueRow
                    key={song.id}
                    song={song}
                    index={originalIndex}
                    isCurrent={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    isHidden={isHidden}
                    isDragging={isDragging}
                    isDragOver={isDragOver}
                    isTouchDragging={isTouchDragging}
                    isTouchDragOver={isTouchDragOver}
                    onPlay={handlePlay}
                    onToggleHide={handleToggleHide}
                    onRemove={handleRemove}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onTouchDragStart={handleTouchDragStart}
                    onTouchDragMove={handleTouchDragMove}
                    onTouchDragEnd={handleTouchDragEnd}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
