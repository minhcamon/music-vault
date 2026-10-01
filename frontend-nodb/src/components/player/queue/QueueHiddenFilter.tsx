import React, { memo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface QueueHiddenFilterProps {
  hiddenCount: number;
  showHidden: boolean;
  onToggleShowHidden: () => void;
  hasItems: boolean;
}

/**
 * Component thanh thông báo & bộ lọc bài hát bị ẩn trong Hàng đợi
 */
export const QueueHiddenFilter: React.FC<QueueHiddenFilterProps> = memo(
  ({ hiddenCount, showHidden, onToggleShowHidden, hasItems }) => {
    return (
      <div className="shrink-0 flex flex-col gap-1 my-1">
        {/* Subheader: Hidden Filter Toggle */}
        {hiddenCount > 0 && (
          <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-vault-muted">
              Có <strong className="text-amber-300 font-mono">{hiddenCount}</strong> bài đang bị ẩn
            </span>
            <button
              onClick={onToggleShowHidden}
              className="flex items-center gap-1.5 text-vault-accent hover:underline font-medium cursor-pointer"
            >
              {showHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showHidden ? 'Giấu bài ẩn' : 'Hiện tất cả'}</span>
            </button>
          </div>
        )}

        {/* Gợi ý cử chỉ cho Mobile */}
        {hasItems && (
          <div className="sm:hidden flex items-center justify-center gap-2 py-1 px-2 text-[10px] text-vault-muted/80 font-mono tracking-tight text-center bg-white/[0.02] rounded-lg border border-white/5">
            <span>← Vuốt để Ẩn/Xóa</span>
            <span className="opacity-40">•</span>
            <span>Giữ 0.6s để Kéo sắp xếp ↕</span>
          </div>
        )}
      </div>
    );
  }
);

QueueHiddenFilter.displayName = 'QueueHiddenFilter';
