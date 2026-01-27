# Docker Setup Guide

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Installation

#### macOS
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### Windows
```powershell
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation (in PowerShell)
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/TheRobBrennan/nemo-instrument-poc
cd nemo-instrument-poc
```

### 2. Run Setup Script
```bash
npm run setup
```

This script will:
- Check Docker installation
- Create `.env` file from template
- Verify project structure

### 3. Start Services
```bash
# Start all services
npm start

# Or rebuild and start
npm run start:clean
```

### 4. Verify Services

**Frontend**: <http://localhost:5173>
```bash
curl http://localhost:5173
```

**Backend Health**: <http://localhost:3001/health>
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}
```

**WebSocket**: ws://localhost:8080
```bash
# Test with wscat (install: npm install -g wscat)
wscat -c ws://localhost:8080
```

---

## Docker Commands

### Basic Operations

```bash
# Start services
npm start                    # Start in attached mode
npm run docker:up           # Same as above

# Start with rebuild
npm run start:clean         # Rebuild and start
npm run docker:up:build     # Same as above

# Stop services
npm run docker:down         # Stop containers
npm run docker:clean        # Stop and remove volumes

# View logs
npm run docker:logs         # Follow all logs
docker-compose -f docker/docker-compose.yml logs backend # Backend only
docker-compose -f docker/docker-compose.yml logs frontend # Frontend only
```

### Service-Specific

```bash
# Start individual services
npm run docker:backend      # Backend only
npm run docker:frontend     # Frontend only

# Rebuild specific service
docker-compose -f docker/docker-compose.yml build backend
docker-compose -f docker/docker-compose.yml build frontend

# Restart specific service
docker-compose -f docker/docker-compose.yml restart backend
docker-compose -f docker/docker-compose.yml restart frontend
```

### Development Workflow

```bash
# Watch logs while developing
npm run docker:logs

# In another terminal, make code changes
# Services will auto-reload (hot reload enabled)

# Rebuild if dependencies change
npm run start:clean
```

---

## Environment Variables

Environment variables are managed in `docker/.env`:

```bash
# Copy example file
cp docker/.env.example docker/.env

# Edit as needed
vim docker/.env
```

**Available Variables:**

| Variable        | Default                | Description                    |
|-----------------|------------------------|--------------------------------|
| `NODE_ENV`      | `development`          | Node environment               |
| `VITE_WS_URL`   | `ws://localhost:8080`  | WebSocket URL for frontend     |
| `VITE_API_URL`  | `http://localhost:3001`| Backend API URL                |
| `WS_PORT`       | `8080`                 | WebSocket server port          |
| `HTTP_PORT`     | `3001`                 | HTTP server port               |

---

## Troubleshooting

### Services Won't Start

**Check Docker is running:**
```bash
docker ps
```

**Check for port conflicts:**
```bash
# macOS/Linux
lsof -i :5173
lsof -i :8080
lsof -i :3001

# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :8080
netstat -ano | findstr :3001
```

**View detailed logs:**
```bash
docker-compose -f docker/docker-compose.yml logs backend
docker-compose -f docker/docker-compose.yml logs frontend
```

### Hot Reload Not Working

**Ensure volumes are mounted:**
```bash
docker-compose -f docker/docker-compose.yml config
# Check that volumes are listed for services
```

**Restart services:**
```bash
npm run docker:down
npm run start:clean
```

### Permission Issues (Linux)

**Fix file permissions:**
```bash
sudo chown -R $USER:$USER .
```

**Add user to docker group:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Clean Slate

**Remove all containers, volumes, and images:**
```bash
# Stop everything
npm run docker:clean

# Remove all project containers
docker-compose -f docker/docker-compose.yml down -v --rmi all

# Rebuild from scratch
npm run start:clean
```

---

## Production Deployment

### Build Production Images

```bash
# Build production images
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml build

# Start production services
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose -f docker/docker-compose.yml ps

# View health check logs
docker inspect nemo-backend | grep -A 10 Health
docker inspect nemo-frontend | grep -A 10 Health
```

---

## Docker Compose File Structure

```yaml
version: '3.8'

services:
  backend:
    # Node.js WebSocket server
    # Ports: 8080 (WebSocket), 3001 (HTTP)
    # Health check: http://localhost:3001/health
    
  frontend:
    # React + Vite development server
    # Port: 5173
    # Depends on backend health check
    
networks:
  nemo-network:
    # Bridge network for service communication
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [npm Workspaces Guide](./initial-poc/NPM_WORKSPACES_EXPLAINED.md)
- [Implementation Plan](./initial-poc/IMPLEMENTATION_PLAN.md)
