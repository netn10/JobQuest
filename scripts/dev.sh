#!/bin/bash

# Job Quest Development Script
# This script sets up the database and runs the development server

echo "🚀 Starting Job Quest Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to kill existing processes
kill_existing_processes() {
    echo "🔄 Stopping existing processes..."
    
    # Kill any existing Node.js processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    
    echo "✅ Stopped existing processes"
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Generate Prisma client
    echo "📦 Generating Prisma client..."
    if ! npm run db:generate; then
        echo "❌ Failed to generate Prisma client"
        exit 1
    fi
    
    # Push database schema
    echo "📊 Pushing database schema..."
    if ! npm run db:push; then
        echo "❌ Failed to push database schema"
        exit 1
    fi
    
    echo "✅ Database setup completed!"
}

# Function to start development server
start_development_server() {
    echo "🌐 Starting development server..."
    npm run dev
}

# Main execution
main() {
    # Kill existing processes
    kill_existing_processes
    
    # Setup database
    setup_database
    
    # Start development server
    start_development_server
}

# Run main function
main
