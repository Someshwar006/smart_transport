Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting LogiConnect Freight Network" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; node server.js"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; node dev.js"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "[DONE] LogiConnect is open at http://localhost:5173" -ForegroundColor Green

