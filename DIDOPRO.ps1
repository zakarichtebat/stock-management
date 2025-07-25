# Définir les chemins
$API_PATH = "C:\Users\AA\Desktop\stock-management\stock-management-api"
$FRONTEND_PATH = "C:\Users\AA\Desktop\stock-management\stock-management-frontend"

# Fonction pour les messages d'erreur
function Show-Error {
    param($Message)
    $null = [System.Windows.Forms.MessageBox]::Show($Message, "DIDOPRO - Erreur")
}

try {
    # Vérifier Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Show-Error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org"
        exit 1
    }

    # Vérifier les dossiers
    if (-not (Test-Path $API_PATH) -or -not (Test-Path $FRONTEND_PATH)) {
        Show-Error "Dossiers du projet non trouvés."
        exit 1
    }

    # Arrêter les processus existants
    Get-NetTCPConnection -LocalPort 3000, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }

    # Démarrer l'API
    Set-Location $API_PATH
    Start-Process npm -ArgumentList "install" -NoNewWindow -Wait
    Start-Process npm -ArgumentList "run start" -WindowStyle Hidden

    # Démarrer le Frontend
    Set-Location $FRONTEND_PATH
    Start-Process npm -ArgumentList "install" -NoNewWindow -Wait
    Start-Process npm -ArgumentList "run dev" -WindowStyle Hidden

    # Attendre et ouvrir le navigateur
    Start-Sleep -Seconds 10
    Start-Process "http://localhost:5173"
}
catch {
    Show-Error "Une erreur est survenue : $_"
    exit 1
} 