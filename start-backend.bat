@echo off
setlocal

REM HospEase Backend Startup Script
REM This script ensures the backend server starts and stays running

set BACKEND_DIR=%~dp0backend
set PID_FILE=%~dp0backend.pid
set LOG_FILE=%~dp0backend.log

cd /d "%BACKEND_DIR%"
echo Starting HospEase backend server...
echo Current directory: %cd%
echo Log file: %LOG_FILE%

REM Kill any existing node process on port 5001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
    echo Stopping existing server process %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Start server in background
echo Starting server...
start /B node server.js > "%LOG_FILE%" 2>&1

REM Wait for server to start
timeout /T 3 /NOBREAK >nul

REM Test if server is responding
curl -s http://localhost:5001/health >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✅ Backend server is running successfully on port 5001
    echo 📖 View logs: type "%LOG_FILE%"
) else (
    echo ❌ Server failed to start properly. Check logs:
    type "%LOG_FILE%"
    pause
    exit /b 1
)

echo.
echo Backend server is running. Close this window to stop the server.
echo Or press Ctrl+C to stop.
pause