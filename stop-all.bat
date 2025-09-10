@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Job Quest - Stop All Services
REM ========================================
REM This script stops all Job Quest related processes and services

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🛑 JOB QUEST STOPPER 🛑                  ║
echo ║                                                              ║
echo ║  Stopping all development services...                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ========================================
REM Stop Node.js Processes
REM ========================================
echo 🔄 Stopping Node.js processes...

REM Kill all Node.js processes
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Stopped Node.js processes
) else (
    echo ℹ️  No Node.js processes found
)

REM ========================================
REM Free Up Ports
REM ========================================
echo 🔄 Freeing up ports...

REM Kill processes using port 3000 (Next.js default)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Freed up port 3000
    )
)

REM Kill processes using port 3001 (alternative Next.js port)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Freed up port 3001
    )
)

REM ========================================
REM Clean Up Files
REM ========================================
echo 🔄 Cleaning up temporary files...

REM Remove log files
if exist "dev.log" (
    del "dev.log" >nul 2>&1
    echo ✅ Removed dev.log
)

REM Remove .next build cache (optional - uncomment if needed)
REM if exist ".next" (
REM     rmdir /s /q ".next" >nul 2>&1
REM     echo ✅ Removed .next cache
REM )

echo ✅ Cleanup completed!

REM ========================================
REM Final Status
REM ========================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ✅ ALL SERVICES STOPPED ✅               ║
echo ║                                                              ║
echo ║  All Job Quest services have been stopped.                  ║
echo ║  Ports have been freed up.                                  ║
echo ║  Temporary files have been cleaned.                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

pause

