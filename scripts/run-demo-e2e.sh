#!/bin/bash

# Script to run the Initial POC Demo E2E Test
# This ensures Docker containers are running before executing the demo test

set -e

echo "🎬 Initial POC Demo E2E Test"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if containers are running
BACKEND_RUNNING=$(docker ps --filter "name=backend" --format "{{.Names}}" 2>/dev/null || echo "")
FRONTEND_RUNNING=$(docker ps --filter "name=frontend" --format "{{.Names}}" 2>/dev/null || echo "")

if [ -z "$BACKEND_RUNNING" ] || [ -z "$FRONTEND_RUNNING" ]; then
    echo "⚠️  Docker containers are not running"
    echo "   Starting containers with 'npm run dev'..."
    echo ""
    
    # Start containers in background
    npm run dev > /dev/null 2>&1 &
    DOCKER_PID=$!
    
    echo "⏳ Waiting for containers to be ready..."
    sleep 10
    
    # Wait for backend to be ready
    echo "   Checking backend health..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            echo "   ✅ Backend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "   ❌ Backend failed to start"
            kill $DOCKER_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
    done
    
    # Wait for frontend to be ready
    echo "   Checking frontend health..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo "   ✅ Frontend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "   ❌ Frontend failed to start"
            kill $DOCKER_PID 2>/dev/null || true
            exit 1
        fi
        sleep 1
    done
    
    echo ""
    echo "✅ All containers are running and ready"
else
    echo "✅ Docker containers are already running"
    echo "   Backend: $BACKEND_RUNNING"
    echo "   Frontend: $FRONTEND_RUNNING"
fi

echo ""
echo "🚀 Starting demo E2E test..."
echo ""

# Run the demo test
npm run test:e2e:demo

echo ""
echo "✅ Demo E2E test completed!"
echo ""
echo "💡 Tip: To stop containers, run 'npm run stop'"
