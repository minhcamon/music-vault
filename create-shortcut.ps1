$WshShell = New-Object -ComObject WScript.Shell

$desktopPaths = @(
    [System.Environment]::GetFolderPath('Desktop'),
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop"
)

foreach ($dir in $desktopPaths) {
    if (Test-Path $dir) {
        $linkPath = Join-Path $dir "AudioVault.lnk"
        $Shortcut = $WshShell.CreateShortcut($linkPath)
        $Shortcut.TargetPath = "d:\Data\Personal\STUDY\PROGRAMMING\REACT\music-player\launch-audiovault.vbs"
        $Shortcut.WorkingDirectory = "d:\Data\Personal\STUDY\PROGRAMMING\REACT\music-player"
        $Shortcut.Hotkey = "Ctrl+Alt+M"
        $Shortcut.Description = "Khởi chạy AudioVault Hi-Fi Music Player"
        $Shortcut.Save()
        Write-Host "Created shortcut: $linkPath with Hotkey Ctrl+Alt+M"
    }
}
