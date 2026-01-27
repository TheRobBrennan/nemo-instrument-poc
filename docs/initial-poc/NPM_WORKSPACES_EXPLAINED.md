# npm Workspaces - Explained

## What Are npm Workspaces?

npm workspaces (introduced in npm 7) enable you to manage multiple packages within a single repository (monorepo). Instead of having separate `node_modules` folders for each project, workspaces create a unified dependency tree at the root level.

## Why Use Workspaces for This Project?

### **1. Simplified Dependency Management**
```bash
# Without workspaces (old way):
cd services/frontend && npm install
cd ../backend-mock && npm install
# Result: 2 separate node_modules folders, duplicate packages

# With workspaces (new way):
npm install  # From root - installs ALL workspace dependencies
# Result: 1 shared node_modules at root, deduplicated packages
```

### **2. Cross-Workspace Commands**
```bash
# Run commands in specific workspace
npm run dev -w frontend              # Run dev script in frontend only
npm run test -w backend-mock         # Run tests in backend only

# Run commands in ALL workspaces
npm run test --workspaces            # Run tests everywhere
npm run build --workspaces           # Build all services

# Install package to specific workspace
npm install react -w frontend        # Add React to frontend only
npm install express -w backend-mock  # Add Express to backend only
```

### **3. Shared Development Tools**
Common dev dependencies (ESLint, Prettier, TypeScript) can be installed once at the root and used by all workspaces:

```json
// Root package.json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}

// services/frontend/package.json - no need to duplicate!
// services/backend-mock/package.json - no need to duplicate!
```

### **4. Local Package Linking**
If you create shared packages (like common types or utilities), workspaces automatically link them:

```
services/
├── frontend/
├── backend-mock/
└── shared-types/      # Shared TypeScript types

// In frontend/package.json:
{
  "dependencies": {
    "shared-types": "*"  // Automatically links to local workspace
  }
}
```

## How It Works

### **Root package.json**
```json
{
  "name": "nemo-instrument-poc",
  "private": true,
  "workspaces": [
    "services/frontend",
    "services/backend-mock"
  ],
  "scripts": {
    "start": "docker-compose up",
    "test": "npm run test --workspaces",
    "build": "npm run build --workspaces"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### **Workspace package.json** (services/frontend/package.json)
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### **Workspace package.json** (services/backend-mock/package.json)
```json
{
  "name": "backend-mock",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "ws": "^8.16.0"
  }
}
```

## Directory Structure

```
nemo-instrument-poc/
├── node_modules/              # Shared dependencies (root level)
│   ├── react/
│   ├── express/
│   ├── eslint/
│   └── ...
├── services/
│   ├── frontend/
│   │   ├── node_modules/      # Workspace-specific symlinks
│   │   ├── package.json
│   │   └── src/
│   └── backend-mock/
│       ├── node_modules/      # Workspace-specific symlinks
│       ├── package.json
│       └── src/
├── package.json               # Root with workspaces config
└── package-lock.json          # Unified lock file
```

## Common Commands

### **Installation**
```bash
# Install all workspace dependencies
npm install

# Install package to specific workspace
npm install lodash -w frontend
npm install axios -w backend-mock

# Install dev dependency at root (shared)
npm install -D eslint
```

### **Running Scripts**
```bash
# Run in specific workspace
npm run dev -w frontend
npm start -w backend-mock

# Run in all workspaces
npm run test --workspaces
npm run build --workspaces

# Run in all workspaces, continue on error
npm run test --workspaces --if-present
```

### **Listing Workspaces**
```bash
npm ls --workspaces
```

## Benefits for Docker Development

Workspaces work seamlessly with Docker:

### **Development Mode**
Each service's Dockerfile can mount its workspace folder:
```dockerfile
# services/frontend/Dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
```

### **Production Build**
Multi-stage builds can leverage workspace structure:
```dockerfile
# Build stage - uses root workspace
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY services/frontend/package*.json ./services/frontend/
RUN npm ci
COPY services/frontend ./services/frontend
RUN npm run build -w frontend

# Production stage
FROM nginx:alpine
COPY --from=builder /app/services/frontend/dist /usr/share/nginx/html
```

## Workspace vs. Separate Repos

| Aspect       | Workspaces (Monorepo)   | Separate Repos      |
|--------------|-------------------------|---------------------|
| Setup        | Single `npm install`    | Multiple installs   |
| Dependencies | Shared, deduplicated    | Duplicated          |
| Versioning   | Coordinated             | Independent         |
| CI/CD        | Single pipeline         | Multiple pipelines  |
| Code Sharing | Easy (local packages)   | Requires npm publish|
| Complexity   | Medium                  | Low                 |
| Best For     | Related services        | Independent projects|

## For This Project

**Why workspaces make sense:**
1. **Frontend + Backend** are tightly coupled (WebSocket communication)
2. **Shared types** can be easily created if needed
3. **Single `npm install`** for team members
4. **Coordinated testing** across services
5. **Docker-friendly** - each service still builds independently
6. **Monorepo benefits** without complex tooling (Nx, Turborepo, etc.)

## Quick Reference

```bash
# From root directory:
npm install                    # Install all dependencies
npm run dev -w frontend        # Start frontend dev server
npm run start -w backend-mock  # Start backend server
npm test --workspaces          # Run all tests
npm run build --workspaces     # Build all services

# Docker commands (unaffected by workspaces):
npm run start                  # docker-compose up
npm run start:clean            # docker-compose up --build
```

## Additional Resources

- [npm workspaces documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [npm workspace commands](https://docs.npmjs.com/cli/v10/commands/npm-workspace)
- [Monorepo best practices](https://monorepo.tools/)
