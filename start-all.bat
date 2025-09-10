@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Job Quest - Complete Development Stack
REM ========================================
REM This script starts the entire Job Quest application stack:
REM - Database setup and seeding
REM - Next.js development server (frontend + backend)
REM - Browser extension development
REM - All supporting services

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🚀 JOB QUEST LAUNCHER 🚀                  ║
echo ║                                                              ║
echo ║  Starting complete development environment...                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ========================================
REM Configuration
REM ========================================
set "PROJECT_NAME=Job Quest"
set "NEXT_PORT=3000"
set "DB_FILE=prisma\dev.db"
set "LOG_FILE=dev.log"

REM ========================================
REM Pre-flight Checks
REM ========================================
echo 🔍 Running pre-flight checks...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

if not exist "prisma\schema.prisma" (
    echo ❌ Prisma schema not found. Please ensure you're in the correct directory.
    pause
    exit /b 1
)

echo ✅ Pre-flight checks passed!

REM ========================================
REM Cleanup Previous Sessions
REM ========================================
echo.
echo 🧹 Cleaning up previous sessions...

REM Kill existing Node.js processes
echo   Stopping existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Killed existing Node.js processes
) else (
    echo   ℹ️  No existing Node.js processes found
)

REM Kill any processes using port 3000
echo   Checking port %NEXT_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%NEXT_PORT%') do (
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo   ✅ Freed up port %NEXT_PORT%
    )
)

REM Clean up log files
if exist "%LOG_FILE%" del "%LOG_FILE%" >nul 2>&1

echo ✅ Cleanup completed!

REM ========================================
REM Install Dependencies
REM ========================================
echo.
echo 📦 Installing dependencies...

if not exist "node_modules" (
    echo   Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo   ✅ Dependencies installed
) else (
    echo   ✅ Dependencies already installed
)

REM ========================================
REM Database Setup
REM ========================================
echo.
echo 🗄️  Setting up database...

REM Generate Prisma client
echo   📦 Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Push database schema
echo   📊 Pushing database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
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

echo ✅ Database setup completed!

REM ========================================
REM Environment Setup
REM ========================================
echo.
echo ⚙️  Setting up environment...

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo   Creating .env.local file...
    (
        echo # Job Quest Environment Variables
        echo # Database
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # NextAuth
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
        echo.
        echo # OpenAI (optional)
        echo OPENAI_API_KEY=""
        echo.
        echo # Development
        echo NODE_ENV="development"
    ) > .env.local
    echo   ✅ Created .env.local file
) else (
    echo   ✅ Environment file already exists
)

REM ========================================
REM Start Development Server
REM ========================================
echo.
echo 🌐 Starting development server...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎯 APPLICATION READY! 🎯                 ║
echo ║                                                              ║
echo ║  Frontend: http://localhost:%NEXT_PORT%                      ║
echo ║  Database: %DB_FILE%                                         ║
echo ║  Logs: %LOG_FILE%                                            ║
echo ║                                                              ║
echo ║  Press Ctrl+C to stop all services                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Start the development server with logging
call npm run dev > "%LOG_FILE%" 2>&1

REM ========================================
REM Cleanup on Exit
REM ========================================
echo.
echo 🛑 Shutting down services...

REM Kill any remaining Node.js processes
taskkill /f /im node.exe >nul 2>&1

echo ✅ All services stopped.
echo.
echo 👋 Thanks for using %PROJECT_NAME%!
pause

