@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Job Quest - Development Launcher
REM ========================================
REM Interactive menu for all development scripts

:menu
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎮 JOB QUEST LAUNCHER 🎮                 ║
echo ║                                                              ║
echo ║  Choose an option:                                           ║
echo ║                                                              ║
echo ║  1. 🚀 Start Everything (Full Stack)                        ║
echo ║  2. 🛑 Stop All Services                                    ║
echo ║  3. 🔄 Reset Everything                                      ║
echo ║  4. 🗄️  Database Only (Setup + Seed)                        ║
echo ║  5. 🌐 Development Server Only                               ║
echo ║  6. 📊 Open Database Studio                                  ║
echo ║  7. 📝 View Logs                                             ║
echo ║  8. ❓ Help / Documentation                                  ║
echo ║  9. 🚪 Exit                                                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto stop_all
if "%choice%"=="3" goto reset_all
if "%choice%"=="4" goto database_only
if "%choice%"=="5" goto dev_server_only
if "%choice%"=="6" goto db_studio
if "%choice%"=="7" goto view_logs
if "%choice%"=="8" goto help
if "%choice%"=="9" goto exit
goto invalid_choice

:start_all
echo.
echo 🚀 Starting complete development stack...
call start-all.bat
goto menu

:stop_all
echo.
echo 🛑 Stopping all services...
call stop-all.bat
goto menu

:reset_all
echo.
echo 🔄 Resetting everything...
call reset-all.bat
goto menu

:database_only
echo.
echo 🗄️ Setting up database only...
call npm run db:generate
call npm run db:push
call npm run db:seed
echo ✅ Database setup completed!
pause
goto menu

:dev_server_only
echo.
echo 🌐 Starting development server only...
call npm run dev
goto menu

:db_studio
echo.
echo 📊 Opening Prisma Studio...
start cmd /k "npm run db:studio"
goto menu

:view_logs
echo.
echo 📝 Viewing logs...
if exist "dev.log" (
    type "dev.log"
) else (
    echo No log file found. Start the development server first.
)
pause
goto menu

:help
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        📚 HELP & DOCS 📚                    ║
echo ║                                                              ║
echo ║  Quick Start:                                                ║
echo ║    • Option 1: Start Everything - Full development stack     ║
echo ║    • Option 2: Stop All - Clean shutdown                     ║
echo ║    • Option 3: Reset Everything - Fresh start                ║
echo ║                                                              ║
echo ║  Individual Services:                                        ║
echo ║    • Option 4: Database setup only                           ║
echo ║    • Option 5: Development server only                       ║
echo ║    • Option 6: Database Studio (GUI)                         ║
echo ║                                                              ║
echo ║  Troubleshooting:                                            ║
echo ║    • Port issues: Use Option 2 to stop all services          ║
echo ║    • Database issues: Use Option 3 to reset everything       ║
echo ║    • View logs: Use Option 7 to see what's happening         ║
echo ║                                                              ║
echo ║  Application URLs:                                           ║
echo ║    • Frontend: http://localhost:3000                         ║
echo ║    • Database Studio: http://localhost:5555                  ║
echo ║                                                              ║
echo ║  Documentation: scripts/README.md                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
goto menu

:invalid_choice
echo.
echo ❌ Invalid choice. Please enter a number between 1-9.
pause
goto menu

:exit
echo.
echo 👋 Thanks for using Job Quest!
echo.
exit /b 0

