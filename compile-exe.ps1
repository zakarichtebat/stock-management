# Installer NuGet si nécessaire
if (!(Get-PackageProvider -Name NuGet -ErrorAction SilentlyContinue)) {
    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
}

# Installer PS2EXE si ce n'est pas déjà fait
if (-not (Get-Module -Name ps2exe -ListAvailable)) {
    Install-Module -Name ps2exe -Force -Scope CurrentUser
}

# Extraire une icône de shell32.dll
$iconPath = "$env:TEMP\didopro.ico"
Add-Type -AssemblyName System.Drawing
$shell32 = [System.Drawing.Icon]::ExtractAssociatedIcon("C:\Windows\System32\shell32.dll")
$shell32.ToBitmap().Save($iconPath)

# Compiler en exe
$inputFile = "DIDOPRO.ps1"
$outputFile = "DIDOPRO.exe"

Write-Host "Compilation de DIDOPRO en exécutable..."
ps2exe -inputFile $inputFile -outputFile $outputFile -noConsole -title "DIDOPRO" -version "1.0.0" -company "DIDOPRO" -product "Gestionnaire de Stock" -copyright "DIDOPRO 2024" -verbose

if (Test-Path $outputFile) {
    Write-Host "Compilation terminée avec succès !"
    Write-Host "L'exécutable a été créé : $outputFile"
}
else {
    Write-Host "Erreur lors de la compilation !"
}

# Nettoyer le fichier d'icône temporaire
if (Test-Path $iconPath) {
    Remove-Item $iconPath -Force
} 