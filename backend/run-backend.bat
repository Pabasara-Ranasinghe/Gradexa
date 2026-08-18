@echo off

echo ==============================
echo Stopping existing backend...
echo ==============================

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8082 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ==============================
echo Starting Gradexa backend...
echo ==============================
echo.

call mvnw.cmd spring-boot:run

pause