# JobQuest Environment Setup Script
# This script helps you set up the required environment variables

Write-Host "JobQuest Environment Setup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check if .env file exists
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "`.env file already exists. Backing up to .env.backup" -ForegroundColor Yellow
    Copy-Item $envFile ".env.backup"
}

# Create .env file with default values
$envContent = @"
# Database
DATABASE_URL="file:./dev.db"

# OpenAI API Key (required for AI features)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=""

# NextAuth.js Configuration (for future use)
NEXTAUTH_SECRET="$(New-Guid)"
NEXTAUTH_URL="http://localhost:3000"
"@

$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "Created .env file with default configuration." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit the .env file and add your OpenAI API key" -ForegroundColor White
Write-Host "2. Get your OpenAI API key from: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "Note: The LinkedIn job analyzer will work without OpenAI API key," -ForegroundColor Yellow
Write-Host "      but AI enhancement features will be disabled." -ForegroundColor Yellow
