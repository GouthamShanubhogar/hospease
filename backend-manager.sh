#!/bin/bash

# HospEase Backend Monitor Script
# This script monitors the backend server and restarts it if it goes down

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/backend" && pwd)"
LOG_FILE="$(dirname "${BASH_SOURCE[0]}")/backend-monitor.log"
PID_FILE="$(dirname "${BASH_SOURCE[0]}")/backend.pid"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if backend is running
check_backend() {
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        return 0  # Backend is running
    else
        return 1  # Backend is not running
    fi
}

# Function to start backend
start_backend() {
    log "Starting HospEase backend server..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        log "ERROR: Backend directory not found at $BACKEND_DIR"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Kill any existing node processes on port 5001
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    
    # Start the server
    nohup node server.js >> "$LOG_FILE" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_FILE"
    
    # Wait for server to start
    sleep 5
    
    if check_backend; then
        log "✅ Backend server started successfully (PID: $BACKEND_PID)"
        return 0
    else
        log "❌ Failed to start backend server"
        return 1
    fi
}

# Function to stop backend
stop_backend() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "Stopping backend server (PID: $PID)..."
            kill "$PID"
            rm -f "$PID_FILE"
            log "✅ Backend server stopped"
        else
            log "Backend server (PID: $PID) is not running"
            rm -f "$PID_FILE"
        fi
    else
        log "No PID file found, attempting to stop any node process on port 5001..."
        lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    fi
}

# Function to restart backend
restart_backend() {
    log "Restarting backend server..."
    stop_backend
    sleep 2
    start_backend
}

# Function to monitor backend
monitor_backend() {
    log "Starting backend monitoring..."
    
    while true; do
        if check_backend; then
            echo -e "${GREEN}✅ Backend is running${NC}"
        else
            echo -e "${RED}❌ Backend is down! Attempting to restart...${NC}"
            log "Backend server is down, attempting restart..."
            
            if start_backend; then
                log "Backend restarted successfully"
            else
                log "Failed to restart backend server"
                echo -e "${RED}Failed to restart backend. Check logs for details.${NC}"
                exit 1
            fi
        fi
        
        sleep 30  # Check every 30 seconds
    done
}

# Main script logic
case "${1:-}" in
    "start")
        start_backend
        ;;
    "stop")
        stop_backend
        ;;
    "restart")
        restart_backend
        ;;
    "status")
        if check_backend; then
            echo -e "${GREEN}✅ Backend is running${NC}"
            exit 0
        else
            echo -e "${RED}❌ Backend is not running${NC}"
            exit 1
        fi
        ;;
    "monitor")
        monitor_backend
        ;;
    *)
        echo "HospEase Backend Manager"
        echo "Usage: $0 {start|stop|restart|status|monitor}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the backend server"
        echo "  stop    - Stop the backend server"
        echo "  restart - Restart the backend server"
        echo "  status  - Check if backend is running"
        echo "  monitor - Monitor backend and auto-restart if needed"
        exit 1
        ;;
esac