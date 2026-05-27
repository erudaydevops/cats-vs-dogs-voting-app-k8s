# =====================================================
#  start.ps1  -  WorkTrack Pro Launcher
#  Just run:  .\start.ps1
#  This script opens the app in your browser
# =====================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    WorkTrack Pro - Local Launcher" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Check pods are running ---
Write-Host "[1/3] Checking pod status..." -ForegroundColor Yellow
$pods = kubectl get pods -n worktrack --no-headers 2>&1
Write-Host $pods

$notReady = $pods | Where-Object { $_ -notmatch "Running" }
if ($notReady) {
    Write-Host ""
    Write-Host "Some pods are not running yet. Waiting 15 seconds..." -ForegroundColor Yellow
    Start-Sleep 15
    kubectl get pods -n worktrack
}

Write-Host ""

# --- Step 2: Start port-forwarding in background ---
Write-Host "[2/3] Starting port-forwarding..." -ForegroundColor Yellow

# Kill any old port-forward processes first
Get-Process -Name "kubectl" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*port-forward*" } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

$job1 = Start-Job -ScriptBlock { kubectl port-forward -n worktrack service/frontend-service 3000:80 }
$job2 = Start-Job -ScriptBlock { kubectl port-forward -n worktrack service/backend-service 5000:5000 }

Write-Host "  Frontend App -> port 3000"  -ForegroundColor Green
Write-Host "  Backend API  -> port 5000"  -ForegroundColor Green
Write-Host ""

# Wait for port-forwards to be ready
Write-Host "[3/3] Waiting for connections to be ready (5 seconds)..." -ForegroundColor Yellow
Start-Sleep 5

# --- Step 3: Open in browser ---
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  READY! Opening in your browser now..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  App URL ->  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  Press ENTER to stop and exit" -ForegroundColor Red
Write-Host ""

Start-Process "http://localhost:3000"

# Keep running until user presses Enter
Read-Host | Out-Null

# Cleanup
Write-Host ""
Write-Host "Stopping port-forwards..." -ForegroundColor Yellow
Stop-Job  $job1, $job2 -ErrorAction SilentlyContinue
Remove-Job $job1, $job2 -ErrorAction SilentlyContinue
Write-Host "Done. Goodbye!" -ForegroundColor Cyan
