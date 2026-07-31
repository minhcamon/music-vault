Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\Data\Personal\STUDY\PROGRAMMING\REACT\music-player"
WshShell.Run "cmd /c npm run dev", 0, False
WScript.Sleep 2500
WshShell.Run "http://localhost:5173", 1, False
