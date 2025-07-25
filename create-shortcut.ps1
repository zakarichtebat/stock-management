$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\DIDOPRO.lnk")
$Shortcut.TargetPath = "$PWD\DIDOPRO.exe"
$Shortcut.WorkingDirectory = $PWD
$Shortcut.IconLocation = "C:\Windows\System32\imageres.dll,67"
$Shortcut.Description = "DIDOPRO - Gestionnaire de Stock"
$Shortcut.Save() 