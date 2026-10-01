import React, { memo } from 'react';
import { Music } from 'lucide-react';

/**
 * Component hiển thị khi Hàng đợi phát đang trống
 */
export const QueueEmptyState: React.FC = memo(() => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center text-vault-muted space-y-3 p-6">
      <div className="w-14 h-14 rounded-2xl bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center text-vault-accent/60 mb-1">
        <Music className="w-8 h-8" />
      </div>
      <p className="text-sm font-bold text-vault-text">Hàng đợi phát đang trống</p>
      <p className="text-xs max-w-xs leading-relaxed text-vault-muted/80">
        Chọn một bài hát, album hoặc playlist bất kỳ từ thư viện để bắt đầu thưởng thức âm nhạc.
      </p>
    </div>
  );
});

QueueEmptyState.displayName = 'QueueEmptyState';
