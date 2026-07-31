import React from 'react';
import { Power, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

interface ShutdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmShutdown: () => void;
  isShuttingDown: boolean;
  isShutdownComplete: boolean;
}

export const ShutdownModal: React.FC<ShutdownModalProps> = ({
  isOpen,
  onClose,
  onConfirmShutdown,
  isShuttingDown,
  isShutdownComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={!isShuttingDown && !isShutdownComplete ? onClose : undefined}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#181B22] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Close Button (disabled while shutting down) */}
        {!isShuttingDown && !isShutdownComplete && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* State 1: Confirmation */}
        {!isShuttingDown && !isShutdownComplete && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <Power className="w-7 h-7 text-rose-500" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-primary font-display">
                Dừng ứng dụng AudioVault?
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Thao tác này sẽ tắt máy chủ backend (Node.js/Fastify) và kết thúc phiên làm việc. Bạn sẽ cần khởi chạy lại lệnh hoặc script <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">launch-audiovault.vbs</code> để mở lại ứng dụng.
              </p>
            </div>

            <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-rose-200/90 leading-tight">
                Lưu ý: Mọi tiến trình phát nhạc sẽ dừng lại và kết nối từ các thiết bị LAN khác sẽ bị ngắt.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-text-primary transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmShutdown}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Power className="w-4 h-4" />
                <span>Tắt Server Ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Shutting Down In Progress */}
        {isShuttingDown && !isShutdownComplete && (
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Đang tắt máy chủ AudioVault...
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Đang đóng các kết nối và dừng quy trình backend Fastify.
              </p>
            </div>
          </div>
        )}

        {/* State 3: Shutdown Complete */}
        {isShutdownComplete && (
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-primary font-display">
                Đã dừng ứng dụng thành công!
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Máy chủ AudioVault backend đã tắt hoàn toàn. 
                <br />
                Bạn có thể an tâm đóng tab trình duyệt này.
              </p>
            </div>

            <div className="pt-3 w-full">
              <button
                type="button"
                onClick={() => window.close()}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-text-primary transition-all"
              >
                Đóng Tab Trình Duyệt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
