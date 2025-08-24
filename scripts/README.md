# Development Scripts

This directory contains scripts to run both the backend (database) and frontend (Next.js development server) together.

## Available Scripts

### 1. PowerShell Script (Windows - Recommended)
```powershell
.\scripts\dev.ps1
```

### 2. Batch Script (Windows Command Prompt)
```cmd
scripts\dev.bat
```

### 3. Shell Script (Linux/macOS)
```bash
./scripts/dev.sh
```

### 4. NPM Scripts (Cross-platform)
```bash
# Development with database setup
npm run dev:full

# Production with database setup
npm run start:full

# Individual database commands
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database (force)
```

## What These Scripts Do

1. **Check Prerequisites**: Verify Node.js and npm are installed
2. **Stop Existing Processes**: Kill any running Node.js processes
3. **Setup Database**: 
   - Generate Prisma client
   - Push database schema to SQLite
4. **Start Development Server**: Run Next.js with Turbopack

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Git (for version control)

## Environment Setup

Make sure you have a `.env` file in the root directory with:

```env
DATABASE_URL="file:./dev.db"
# Add other environment variables as needed
```

## Troubleshooting

### Permission Issues (Linux/macOS)
If you get permission errors on the shell script:
```bash
chmod +x scripts/dev.sh
```

### PowerShell Execution Policy (Windows)
If PowerShell blocks script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Issues
If you encounter database problems:
```bash
npm run db:reset
```

### Port Already in Use
The scripts automatically kill existing Node.js processes, but if you still have issues:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

## Development Workflow

1. Run the development script: `.\scripts\dev.ps1` (Windows) or `./scripts/dev.sh` (Linux/macOS)
2. The application will be available at `http://localhost:3000`
3. Database will be automatically set up and ready to use
4. Prisma Studio can be accessed at `http://localhost:5555` (run `npm run db:studio` separately)

## Features

- ✅ Automatic process management
- ✅ Database setup and migration
- ✅ Cross-platform compatibility
- ✅ Error handling and validation
- ✅ Colored output for better UX
- ✅ Prerequisites checking
