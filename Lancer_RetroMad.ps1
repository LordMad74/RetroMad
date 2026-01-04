# RetroMad Portal - Lanceur Universel & Auto-Reparateur
# Ce script verifie l'integrite de l'installation, installe les dependances manquantes et lance l'application.
# Il utilise des chemins relatifs pour etre portable.

# Force UTF-8 just in case, but we will remove accents for safety
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue" 
$ScriptRoot = $PSScriptRoot

Clear-Host
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RETROMAD PORTAL - LAUNCHER V2.0        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Detection du Mode de Lancement ---
$ExePath = Join-Path $ScriptRoot "retromad-portal.exe"
if (-not (Test-Path $ExePath)) {
    # If not in root, check in Engine folder (for dev/source builds)
    $EnginePath = Join-Path $ScriptRoot "Engine"
    $ExePath = Join-Path $EnginePath "retromad-portal.exe"
}

if (Test-Path $ExePath) {
    Write-Host "[OK] Executable detecte. Lancement autonome..." -ForegroundColor Green
    Start-Process $ExePath
    Exit
}

# --- 2. Verification de l'environnement (Mode Source/Dev) ---
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        Write-Host "[OK] Node.js detecte : $nodeVersion" -ForegroundColor Green
    }
    else {
        throw "L'executable est absent et Node.js n'est pas installe."
    }
}
catch {
    Write-Host "[ERREUR] Executable absent ET Node.js introuvable." -ForegroundColor Red
    Write-Host "Veuillez soit lancer 'retromad-portal.exe', soit installer Node.js." -ForegroundColor Yellow
    Pause
    Exit
}

# --- 2. Definition des Chemins ---
$EnginePath = Join-Path $ScriptRoot "Engine"
$ModulesPath = Join-Path $EnginePath "node_modules"
$RomsPath = Join-Path $ScriptRoot "Content\Roms"
$SkyscraperPath = Join-Path $EnginePath "Skyscraper\Skyscraper.exe"

$MissingCritical = $false

function Test-CheckPath {
    param($Path, $Label)
    if (Test-Path $Path) {
        Write-Host "[OK] $Label trouve" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "[MANQUANT] $Label introuvable ($Path)" -ForegroundColor Yellow
        return $false
    }
}

# --- 3. Verification des Fichiers ---
Write-Host "`n--- Verification des Fichiers ---" -ForegroundColor Gray

if (-not (Test-CheckPath $EnginePath "Moteur (Engine)")) { $MissingCritical = $true }

# Creation automatique des dossiers si manquants
$DirsToCreate = @(
    (Join-Path $ScriptRoot "Content"),
    $RomsPath,
    (Join-Path $ScriptRoot "Content\Emulators"),
    (Join-Path $ScriptRoot "Content\Saves"),
    (Join-Path $ScriptRoot "Content\Media")
)

foreach ($dir in $DirsToCreate) {
    if (-not (Test-Path $dir)) {
        Write-Host "[AUTO-FIX] Creation de $dir..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
}
Write-Host "[OK] Structure des dossiers prete." -ForegroundColor Green

# Verification Skyscraper (Optionnel)
Test-CheckPath $SkyscraperPath "Skyscraper (Outil)" | Out-Null

if ($MissingCritical) {
    Write-Host "`n[ERREUR FATALE] Des fichiers systeme critiques manquent." -ForegroundColor Red
    Pause
    Exit
}

# --- 4. Verification des Dependances (Mode Source uniquement) ---
if (-not (Test-Path $ModulesPath)) {
    Write-Host "`n--- Installation des Dependances ---" -ForegroundColor Gray
    Write-Host "[INFO] node_modules manquants. Installation automatique..." -ForegroundColor Cyan
    
    Set-Location $EnginePath
    try {
        npm install
        Write-Host "[SUCCES] Installation terminee !" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERREUR] Echec de l'installation des dependances." -ForegroundColor Red
        Write-Host "Verifiez votre connexion internet."
        Pause
        Exit
    }
}
else {
    Write-Host "[OK] Dependances deja installees." -ForegroundColor Green
}

# --- 5. Lancement Mode Source ---
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " TOUT EST PRET ! Lancement (Source)...   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 1

Set-Location $EnginePath

# Lancement en mode Production
$env:NODE_ENV = "production"
npm run electron:prod
