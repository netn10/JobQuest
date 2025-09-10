@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Job Quest - Reset Everything
REM ========================================
REM This script resets the entire development environment:
REM - Stops all services
REM - Resets database
REM - Cleans up files
REM - Reinstalls dependencies

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🔄 JOB QUEST RESET 🔄                    ║
echo ║                                                              ║
echo ║  Resetting entire development environment...                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ========================================
REM Confirmation
REM ========================================
echo ⚠️  WARNING: This will reset your entire development environment!
echo    - All services will be stopped
echo    - Database will be reset and reseeded
echo    - Node modules will be reinstalled
echo    - Build cache will be cleared
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Reset cancelled.
    pause
    exit /b 0
)

REM ========================================
REM Stop All Services
REM ========================================
echo.
echo 🛑 Stopping all services...

REM Kill all Node.js processes
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Stopped Node.js processes
) else (
    echo ℹ️  No Node.js processes found
)

REM ========================================
REM Clean Up Files
REM ========================================
echo.
echo 🧹 Cleaning up files...

REM Remove node_modules
if exist "node_modules" (
    echo   Removing node_modules...
    rmdir /s /q "node_modules" >nul 2>&1
    echo   ✅ Removed node_modules
)

REM Remove .next build cache
if exist ".next" (
    echo   Removing .next cache...
    rmdir /s /q ".next" >nul 2>&1
    echo   ✅ Removed .next cache
)

REM Remove log files
if exist "dev.log" (
    del "dev.log" >nul 2>&1
    echo   ✅ Removed dev.log
)

REM Remove package-lock.json (optional - uncomment if needed)
REM if exist "package-lock.json" (
REM     del "package-lock.json" >nul 2>&1
REM     echo   ✅ Removed package-lock.json
REM )

echo ✅ File cleanup completed!

REM ========================================
REM Reinstall Dependencies
REM ========================================
echo.
echo 📦 Reinstalling dependencies...

call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies reinstalled!

REM ========================================
REM Reset Database
REM ========================================
echo.
echo 🗄️  Resetting database...

REM Generate Prisma client
echo   📦 Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Reset database
echo   🔄 Resetting database...
call npm run db:reset
if %errorlevel% neq 0 (
    echo ❌ Failed to reset database
    pause
    exit /b 1
)

REM Seed database
echo   🌱 Seeding database...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo ✅ Database reset completed!

REM ========================================
REM Final Status
REM ========================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ✅ RESET COMPLETED ✅                    ║
echo ║                                                              ║
echo ║  Development environment has been completely reset.         ║
echo ║  You can now run start-all.bat to start fresh.             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

pause

