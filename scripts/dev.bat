@echo off
REM Job Quest Development Script
REM This script sets up the database and runs the development server

echo 🚀 Starting Job Quest Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
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

REM Kill existing Node.js processes
echo 🔄 Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Killed existing Node.js processes
) else (
    echo ℹ️ No existing Node.js processes found
)

REM Setup database
echo 🗄️ Setting up database...

echo 📦 Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo 📊 Pushing database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
    pause
    exit /b 1
)

echo ✅ Database setup completed!

REM Start development server
echo 🌐 Starting development server...
call npm run dev

pause
