import React, { memo } from 'react';
import { ListMusic, Shuffle, Trash2, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';

export interface QueueHeaderProps {
  totalCount: number;
  validCount: number;
  hiddenCount: number;
  onShuffle: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

/**
 * Component thanh Header của Hàng đợi phát
 */
export const QueueHeader: React.FC<QueueHeaderProps> = memo(
  ({ totalCount, validCount, hiddenCount, onShuffle, onClearAll, onClose }) => {
    return (
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5 shrink-0">
        <div className="flex items-center gap-2.5 text-vault-text">
          <div className="w-9 h-9 rounded-xl bg-vault-accent/20 border border-vault-accent/40 flex items-center justify-center text-vault-accent">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
              <span>Hàng đợi phát</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-vault-accent/20 text-vault-accent font-semibold border border-vault-accent/30">
                {totalCount}
              </span>
            </h3>
            <span className="text-[11px] text-vault-muted">
              {validCount} bài sẵn sàng phát {hiddenCount > 0 ? `• ${hiddenCount} bài ẩn` : ''}
            </span>
          </div>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-1.5">
          {totalCount > 1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={onShuffle}
                  className="rounded-xl"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xáo trộn hàng đợi</TooltipContent>
            </Tooltip>
          )}

          {totalCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={onClearAll}
                  className="rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xóa sạch hàng đợi</TooltipContent>
            </Tooltip>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-vault-muted hover:text-vault-text transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
);

QueueHeader.displayName = 'QueueHeader';
