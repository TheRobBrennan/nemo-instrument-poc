#!/bin/bash
set -e

echo "🚀 Nemo Instrument POC - Setup Script"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f docker/.env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp docker/.env.example docker/.env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi
echo ""

# Check if npm workspaces are set up
if [ -f package.json ]; then
    echo "✅ Root package.json found"
else
    echo "❌ Root package.json not found"
    exit 1
fi
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the application: npm start"
echo "  2. Or build and start: npm run start:clean"
echo "  3. View logs: npm run docker:logs"
echo ""
echo "Note: Docker Compose file is located at docker/docker-compose.yml"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend Health: http://localhost:3001/health"
echo "  - WebSocket: ws://localhost:8080"
echo ""
