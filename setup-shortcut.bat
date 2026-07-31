@echo off
chcp 65001 >nul
echo 🚀 Đang tạo Phím tắt Khởi chạy (Shortcut Ctrl+Alt+M) trên Windows Desktop...

set SCRIPT_DIR=%~dp0
set VBS_TARGET=%SCRIPT_DIR%launch-audiovault.vbs
set DESKTOP_PATH=%USERPROFILE%\Desktop\AudioVault.lnk

set PS_SCRIPT=$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%'); $Shortcut.TargetPath = '%VBS_TARGET%'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Hotkey = 'Ctrl+Alt+M'; $Shortcut.Description = 'Khởi chạy AudioVault Hi-Fi Music Player'; $Shortcut.Save()

powershell -NoProfile -ExecutionPolicy Bypass -Command "%PS_SCRIPT%"

echo.
echo ✅ ĐÃ TẠO PHÍM TẮT THÀNH CÔNG!
echo -------------------------------------------------------------
echo 📌 Tên phím tắt: AudioVault
echo ⌨️  PHÍM TẮT KHỞI CHẠY WINDOWS:  Ctrl + Alt + M
echo 🌐 Đường dẫn: http://localhost:5173
echo -------------------------------------------------------------
echo Bây giờ bạn có thể nhấn [Ctrl + Alt + M] từ bất kỳ đâu trên Windows để mở ứng dụng!
pause
