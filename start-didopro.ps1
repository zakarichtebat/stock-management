Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Définir les chemins
$API_PATH = "C:\Users\AA\Desktop\stock-management\stock-management-api"
$FRONTEND_PATH = "C:\Users\AA\Desktop\stock-management\stock-management-frontend"

# Créer la fenêtre principale
$form = New-Object System.Windows.Forms.Form
$form.Text = "DIDOPRO - Gestionnaire de Stock"
$form.Size = New-Object System.Drawing.Size(600, 400)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::White
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false

# Logo et titre
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Location = New-Object System.Drawing.Point(0, 20)
$titleLabel.Size = New-Object System.Drawing.Size(600, 40)
$titleLabel.Text = "DIDOPRO"
$titleLabel.TextAlign = "MiddleCenter"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($titleLabel)

# Sous-titre
$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Location = New-Object System.Drawing.Point(0, 70)
$subtitleLabel.Size = New-Object System.Drawing.Size(600, 30)
$subtitleLabel.Text = "Système de Gestion de Stock"
$subtitleLabel.TextAlign = "MiddleCenter"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 12)
$form.Controls.Add($subtitleLabel)

# Status Label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Location = New-Object System.Drawing.Point(50, 120)
$statusLabel.Size = New-Object System.Drawing.Size(500, 60)
$statusLabel.Text = "Prêt à démarrer"
$statusLabel.TextAlign = "MiddleCenter"
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Controls.Add($statusLabel)

# Progress Bar
$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(50, 200)
$progressBar.Size = New-Object System.Drawing.Size(500, 30)
$progressBar.Style = "Continuous"
$form.Controls.Add($progressBar)

# Bouton Démarrer
$startButton = New-Object System.Windows.Forms.Button
$startButton.Location = New-Object System.Drawing.Point(200, 250)
$startButton.Size = New-Object System.Drawing.Size(200, 40)
$startButton.Text = "Démarrer l'Application"
$startButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$startButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$startButton.ForeColor = [System.Drawing.Color]::White
$startButton.FlatStyle = "Flat"
$form.Controls.Add($startButton)

# URLs Label
$urlsLabel = New-Object System.Windows.Forms.Label
$urlsLabel.Location = New-Object System.Drawing.Point(50, 310)
$urlsLabel.Size = New-Object System.Drawing.Size(500, 40)
$urlsLabel.Text = ""
$urlsLabel.TextAlign = "MiddleCenter"
$urlsLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$form.Controls.Add($urlsLabel)

# Fonction pour mettre à jour le statut
function Update-Status {
    param($message, $progress)
    $statusLabel.Text = $message
    $progressBar.Value = $progress
    $form.Refresh()
}

# Fonction pour démarrer l'application
$startButton.Add_Click({
        $startButton.Enabled = $false
    
        # Vérifier Node.js
        Update-Status "Vérification de Node.js..." 10
        if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
            [System.Windows.Forms.MessageBox]::Show("Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org", "Erreur")
            $form.Close()
            return
        }

        # Vérifier les dossiers
        Update-Status "Vérification des dossiers..." 20
        if (-not (Test-Path $API_PATH) -or -not (Test-Path $FRONTEND_PATH)) {
            [System.Windows.Forms.MessageBox]::Show("Dossiers du projet non trouvés. Vérifiez l'installation.", "Erreur")
            $form.Close()
            return
        }

        # Arrêter les processus existants
        Update-Status "Nettoyage des ports..." 30
        Get-NetTCPConnection -LocalPort 3000, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }

        # Démarrer l'API
        Update-Status "Installation des dépendances de l'API..." 40
        Set-Location $API_PATH
        Start-Process npm -ArgumentList "install" -NoNewWindow -Wait

        Update-Status "Démarrage de l'API..." 60
        $apiProcess = Start-Process npm -ArgumentList "run start" -WindowStyle Hidden -PassThru

        # Démarrer le Frontend
        Update-Status "Installation des dépendances Frontend..." 70
        Set-Location $FRONTEND_PATH
        Start-Process npm -ArgumentList "install" -NoNewWindow -Wait

        Update-Status "Démarrage de l'interface..." 80
        $frontendProcess = Start-Process npm -ArgumentList "run dev" -WindowStyle Hidden -PassThru

        # Attendre et ouvrir le navigateur
        Update-Status "Démarrage des services..." 90
        Start-Sleep -Seconds 10
        Start-Process "http://localhost:5173"

        Update-Status "Application démarrée avec succès !" 100
        $urlsLabel.Text = "API: http://localhost:3000`nInterface: http://localhost:5173"
    
        # Minimiser la fenêtre
        $form.WindowState = "Minimized"
    })

# Afficher la fenêtre
$form.ShowDialog() 