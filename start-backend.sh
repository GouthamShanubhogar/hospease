#!/bin/bash

# HospEase Backend Startup Script
# This script ensures the backend server starts and stays running

BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"
PID_FILE="$(dirname "$0")/backend.pid"
LOG_FILE="$(dirname "$0")/backend.log"

# Function to start server
start_server() {
    cd "$BACKEND_DIR"
    echo "Starting HospEase backend server..."
    echo "Current directory: $(pwd)"
    echo "Log file: $LOG_FILE"
    
    # Kill any existing server on port 5001
    lsof -ti:5001 2>/dev/null | xargs kill -9 2>/dev/null || true
    
    # Start server in background
    nohup node server.js > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    echo $SERVER_PID > "$PID_FILE"
    echo "Server started with PID: $SERVER_PID"
    
    # Wait for server to start
    sleep 3
    
    # Test if server is responding
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ Backend server is running successfully on port 5001"
        echo "📖 View logs: tail -f $LOG_FILE"
    else
        echo "❌ Server failed to start properly. Check logs:"
        tail -10 "$LOG_FILE"
        exit 1
    fi
}

# Function to stop server
stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "Stopping server (PID: $PID)..."
            kill "$PID"
            rm -f "$PID_FILE"
            echo "✅ Server stopped"
        else
            echo "Server not running (PID: $PID)"
            rm -f "$PID_FILE"
        fi
    else
        echo "No PID file found. Attempting to kill any node process on port 5001..."
        lsof -ti:5001 2>/dev/null | xargs kill -9 2>/dev/null || echo "No process found on port 5001"
    fi
}

# Main execution
case "${1:-start}" in
    "start")
        stop_server
        start_server
        ;;
    "stop")
        stop_server
        ;;
    "restart")
        stop_server
        sleep 2
        start_server
        ;;
    "status")
        if curl -s http://localhost:5001/health > /dev/null; then
            echo "✅ Backend server is running"
            if [ -f "$PID_FILE" ]; then
                echo "PID: $(cat $PID_FILE)"
            fi
        else
            echo "❌ Backend server is not responding"
        fi
        ;;
    "logs")
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "No log file found at: $LOG_FILE"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac