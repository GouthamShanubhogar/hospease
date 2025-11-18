#!/bin/bash

# HospEase Development Server Manager
# This script ensures both backend and frontend servers are running

echo "🏥 HospEase Server Manager"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if backend is running
check_backend() {
    if netstat -an 2>/dev/null | grep -q ":5001.*LISTEN"; then
        return 0  # Backend is running
    else
        return 1  # Backend is not running
    fi
}

# Function to start backend
start_backend() {
    echo -e "${GREEN}Starting HospEase backend server...${NC}"
    
    if [ -d "backend" ]; then
        cd backend
        # Kill any existing node processes on port 5001
        lsof -ti:5001 | xargs kill -9 2>/dev/null || true
        
        # Start the server in background
        nohup node server.js > ../backend.log 2>&1 &
        BACKEND_PID=$!
        
        # Wait a bit for server to start
        sleep 3
        
        # Check if it started successfully
        if check_backend; then
            echo -e "${GREEN}✅ Backend server started successfully on port 5001${NC}"
            echo "Backend PID: $BACKEND_PID"
            return 0
        else
            echo -e "${RED}❌ Failed to start backend server${NC}"
            echo "Check backend.log for details"
            return 1
        fi
    else
        echo -e "${RED}❌ Backend directory not found${NC}"
        return 1
    fi
}

# Function to check if frontend is running
check_frontend() {
    if netstat -an 2>/dev/null | grep -q ":3000.*LISTEN"; then
        return 0  # Frontend is running
    else
        return 1  # Frontend is not running
    fi
}

# Main execution
cd "$(dirname "$0")"

# Check backend status
if check_backend; then
    echo -e "${GREEN}✅ Backend server is already running on port 5001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server is not running. Starting...${NC}"
    if ! start_backend; then
        exit 1
    fi
fi

# Check frontend status
if check_frontend; then
    echo -e "${GREEN}✅ Frontend server is already running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server is not running.${NC}"
    echo "To start frontend, run: cd frontend && npm start"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Your HospEase development environment is ready.${NC}"
echo -e "   ${CYAN}Backend: http://localhost:5001${NC}"
echo -e "   ${CYAN}Frontend: http://localhost:3000${NC}"
echo ""
echo "To view backend logs: tail -f backend.log"