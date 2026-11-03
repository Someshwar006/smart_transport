@echo off
title LogiConnect Launcher
echo ============================================================
echo   Starting LogiConnect Freight Network
echo ============================================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "LogiConnect Backend" cmd /k "cd /d \"%~dp0server\" && node server.js"

echo [2/2] Starting Frontend App (Port 5173)...
start "LogiConnect Frontend" cmd /k "cd /d \"%~dp0client\" && node dev.js"

echo.
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

start http://localhost:5173
echo.
echo [DONE] LogiConnect is open in your browser at http://localhost:5173
echo ============================================================

