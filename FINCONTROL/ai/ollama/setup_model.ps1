# Script to pull base model and build custom FinControl Modelfile
param(
    [string]$BaseModel = "qwen3:8b",
    [string]$TargetModel = "fincontrol-qwen"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "FinControl Ollama Setup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check Ollama Status
try {
    $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 3
    Write-Host "[OK] Ollama server is running." -ForegroundColor Green
} catch {
    Write-Host "[WARN] Ollama server not detected. Attempting to start 'ollama serve'..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# 2. Pull base model if needed
Write-Host "Ensuring base model ($BaseModel) is downloaded..." -ForegroundColor Cyan
ollama pull $BaseModel

# 3. Create custom model from Modelfile
$modelfilePath = Join-Path $PSScriptRoot "Modelfile"
if (Test-Path $modelfilePath) {
    Write-Host "Building custom model '$TargetModel' from $modelfilePath..." -ForegroundColor Cyan
    ollama create $TargetModel -f $modelfilePath
    Write-Host "[SUCCESS] Created model '$TargetModel' successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Modelfile not found at $modelfilePath" -ForegroundColor Red
}
