# Job Quest Development Script
# This script sets up the database and runs the development server

Write-Host "Starting Job Quest Development Environment..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if Node.js is installed
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Function to kill existing processes
function Stop-ExistingProcesses {
    Write-Host "Stopping existing processes..." -ForegroundColor Yellow
    
    # Kill any existing Next.js processes
    $nextProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
    if ($nextProcesses) {
        foreach ($process in $nextProcesses) {
            try {
                $process.Kill()
                Write-Host "Killed existing Node.js process (PID: $($process.Id))" -ForegroundColor Green
            }
            catch {
                Write-Host "Could not kill process $($process.Id): $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
}

# Function to setup database
function Setup-Database {
    Write-Host "Setting up database..." -ForegroundColor Blue
    
    try {
        # Generate Prisma client
        Write-Host "Generating Prisma client..." -ForegroundColor Cyan
        npm run db:generate
        
        # Push database schema
        Write-Host "Pushing database schema..." -ForegroundColor Cyan
        npm run db:push
        
        Write-Host "Database setup completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "Database setup failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to start development server
function Start-DevelopmentServer {
    Write-Host "Starting development server..." -ForegroundColor Blue
    
    try {
        # Start the development server
        npm run dev
    }
    catch {
        Write-Host "Failed to start development server: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Main execution
try {
    # Stop existing processes
    Stop-ExistingProcesses
    
    # Setup database
    Setup-Database
    
    # Start development server
    Start-DevelopmentServer
}
catch {
    Write-Host "An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
