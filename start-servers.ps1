# HospEase Development Server Manager
# This script ensures the backend server is always running when you need it

# Function to check if backend is running
function Check-BackendStatus {
    $process = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    return $process -ne $null
}

# Function to start backend server
function Start-Backend {
    Write-Host "Starting HospEase backend server..." -ForegroundColor Green
    $backendPath = Join-Path $PSScriptRoot "backend"
    
    if (Test-Path $backendPath) {
        Push-Location $backendPath
        try {
            Start-Process "node" -ArgumentList "server.js" -WindowStyle Hidden
            Start-Sleep 3
            
            if (Check-BackendStatus) {
                Write-Host "✅ Backend server started successfully on port 5001" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to start backend server" -ForegroundColor Red
                return $false
            }
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "❌ Backend directory not found at: $backendPath" -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to start frontend server
function Start-Frontend {
    Write-Host "Starting HospEase frontend server..." -ForegroundColor Green
    $frontendPath = Join-Path $PSScriptRoot "frontend"
    
    if (Test-Path $frontendPath) {
        Push-Location $frontendPath
        try {
            Start-Process "npm" -ArgumentList "start" -WindowStyle Normal
            Write-Host "✅ Frontend server starting on port 3000" -ForegroundColor Green
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "❌ Frontend directory not found at: $frontendPath" -ForegroundColor Red
    }
}

# Main execution
Write-Host "🏥 HospEase Server Manager" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if backend is already running
if (Check-BackendStatus) {
    Write-Host "✅ Backend server is already running on port 5001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend server is not running. Starting..." -ForegroundColor Yellow
    Start-Backend
}

# Ask user if they want to start frontend too
$startFrontend = Read-Host "Do you want to start the frontend server? (y/n)"
if ($startFrontend -eq "y" -or $startFrontend -eq "Y") {
    Start-Frontend
}

Write-Host "`n🎉 Setup complete! Your HospEase development environment is ready." -ForegroundColor Green
Write-Host "   Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan