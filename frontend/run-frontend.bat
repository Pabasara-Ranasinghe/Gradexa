@echo off

echo ==============================
echo Stopping existing frontend...
echo ==============================

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ==============================
echo Starting Medora frontend...
echo ==============================
echo.

call npm run dev

pause