import React, { memo } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';

export interface QueueRowActionsProps {
  songId: string;
  isHidden: boolean;
  onToggleHide: (songId: string, e: React.MouseEvent) => void;
  onRemove: (songId: string, e: React.MouseEvent) => void;
  onActionComplete?: () => void;
}

/**
 * Component cụm nút thao tác cho từng bài hát trong Hàng đợi
 * Sử dụng chung cho cả Desktop Hover lẫn Mobile Swipe
 */
export const QueueRowActions: React.FC<QueueRowActionsProps> = memo(
  ({ songId, isHidden, onToggleHide, onRemove, onActionComplete }) => {
    return (
      <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
        {/* Nút Ẩn / Bỏ qua */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                onToggleHide(songId, e);
                onActionComplete?.();
              }}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer active:scale-95 ${
                isHidden
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 hover:bg-amber-500/35'
                  : 'text-stone-400 hover:text-stone-200 bg-stone-900/80 hover:bg-stone-800 border-white/10'
              }`}
            >
              {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isHidden ? 'Bỏ ẩn bài hát' : 'Ẩn (bỏ qua khi phát tự động)'}
          </TooltipContent>
        </Tooltip>

        {/* Nút Xóa khỏi hàng đợi */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                onRemove(songId, e);
                onActionComplete?.();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 bg-stone-900/80 hover:bg-red-950/60 border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Xóa khỏi hàng đợi</TooltipContent>
        </Tooltip>
      </div>
    );
  }
);

QueueRowActions.displayName = 'QueueRowActions';
