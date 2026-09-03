# Start FinControl Development Environment
# Launches Ollama, FastAPI Backend, and Next.js Frontend

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Starting FINCONTROL Development Stack" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$scriptRoot = $PSScriptRoot
$fincontrolRoot = Split-Path -Parent $scriptRoot
$backendDir = Join-Path $fincontrolRoot "backend"
$frontendDir = Join-Path $fincontrolRoot "frontend"

# 1. Start Ollama
Write-Host "[1/3] Ensuring Ollama daemon is running..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 2
    Write-Host "  Ollama server is active." -ForegroundColor Green
} catch {
    Write-Host "  Launching Ollama serve..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
}

# 2. Start Backend
Write-Host "[2/3] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
$backendVenvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
if (Test-Path $backendVenvPython) {
    Start-Process -FilePath $backendVenvPython -ArgumentList "-m uvicorn app.main:app --reload --port 8000" -WorkingDirectory $backendDir
    Write-Host "  Backend process started." -ForegroundColor Green
} else {
    Write-Host "  [WARN] Backend .venv not found at $backendVenvPython" -ForegroundColor Red
}

# 3. Start Frontend
Write-Host "[3/3] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Yellow
if (Test-Path $frontendDir) {
    Start-Process "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $frontendDir
    Write-Host "  Frontend process started." -ForegroundColor Green
}

Write-Host "`n[READY] FINCONTROL stack is launching!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8000/docs"
Write-Host "  Ollama:   http://localhost:11434`n"
