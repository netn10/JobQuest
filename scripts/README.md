# Job Quest Development Scripts

This directory contains various scripts to help with development and deployment of the Job Quest application.

> **🎯 Quick Start**: Just run `start-all.bat` from the project root to start everything!

## Quick Start Scripts

### 🚀 `start-all.bat` (Windows)
**The main script you want!** This single command starts everything:
- Database setup and seeding
- Next.js development server (frontend + backend)
- All supporting services
- Automatic dependency installation
- Environment setup

```bash
# Just double-click or run:
start-all.bat
```

### 🛑 `stop-all.bat` (Windows)
Stops all running services and cleans up processes:
- Kills all Node.js processes
- Frees up ports (3000, 3001)
- Cleans temporary files

```bash
stop-all.bat
```

### 🔄 `reset-all.bat` (Windows)
Complete environment reset:
- Stops all services
- Resets database
- Reinstalls dependencies
- Cleans all caches

```bash
reset-all.bat
```

## Existing Scripts

### `dev.bat` / `dev.ps1` / `dev.sh`
Basic development scripts that:
- Set up database
- Start development server
- Available for Windows (.bat/.ps1) and Unix (.sh)

### `setup-env.ps1`
PowerShell script for environment setup.

## Usage Examples

### Starting Development
```bash
# Windows - Complete stack (recommended)
start-all.bat

# Windows - Basic development
dev.bat

# PowerShell
.\dev.ps1

# Unix/Linux/Mac
./dev.sh
```

### Stopping Development
```bash
# Windows
stop-all.bat

# Or use Ctrl+C in the terminal
```

### Resetting Environment
```bash
# Windows - Complete reset
reset-all.bat
```

## What Each Script Does

### start-all.bat (Complete Stack)
1. ✅ Pre-flight checks (Node.js, npm, project structure)
2. 🧹 Cleanup previous sessions
3. 📦 Install dependencies (if needed)
4. 🗄️ Database setup (generate, push, seed)
5. ⚙️ Environment configuration
6. 🌐 Start development server
7. 📝 Logging to dev.log

### stop-all.bat (Clean Shutdown)
1. 🛑 Stop all Node.js processes
2. 🔌 Free up ports (3000, 3001)
3. 🧹 Clean temporary files
4. ✅ Confirmation

### reset-all.bat (Complete Reset)
1. ⚠️ Confirmation prompt
2. 🛑 Stop all services
3. 🧹 Remove node_modules, .next, logs
4. 📦 Reinstall dependencies
5. 🗄️ Reset and reseed database
6. ✅ Ready for fresh start

## Troubleshooting

### Port Already in Use
```bash
# Use stop-all.bat to free up ports
stop-all.bat

# Or manually kill processes on port 3000
netstat -aon | findstr :3000
taskkill /f /pid <PID>
```

### Database Issues
```bash
# Reset everything
reset-all.bat

# Or just reset database
npm run db:reset
npm run db:seed
```

### Dependencies Issues
```bash
# Clean reinstall
reset-all.bat

# Or manual cleanup
rmdir /s /q node_modules
del package-lock.json
npm install
```

## Environment Variables

The scripts automatically create `.env.local` with:
- `DATABASE_URL="file:./dev.db"`
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXTAUTH_SECRET="your-secret-key-change-this-in-production"`
- `OPENAI_API_KEY=""` (optional)

## Logs

- Development server logs: `dev.log`
- Database operations: Console output
- Error messages: Console output with ❌ indicators

## Browser Extension

The project includes browser extension files in the `public/` directory:
- `manifest.json` - Extension configuration
- `focus-blocker.js` - Background service worker
- `content-script.js` - Content script
- `popup.html` / `popup.js` - Extension popup

These are automatically served by the Next.js development server.