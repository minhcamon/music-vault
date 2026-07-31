Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\Data\Personal\STUDY\PROGRAMMING\REACT\music-player"
WshShell.Run "cmd /c npm run dev", 0, False