# Nemo Instrument POC - Docker-First Implementation Plan

**Objective**: Create a compelling, production-ready demo with Docker-first development workflow  
**Constraint**: Must be easily cloneable and runnable by team/client with simple commands

---

## 🎯 Success Criteria

- ✅ **Docker-first**: Everything runs in containers from day one
- ✅ **One-command setup**: `npm run docker:up` starts entire stack
- ✅ **Real-time WebSocket**: Live instrument status updates
- ✅ **Professional UI**: Modern React 19 + TailwindCSS
- ✅ **Modular architecture**: Easy to add new services/features
- ✅ **Tauri ready**: Desktop deployment configured
- ✅ **Test coverage**: Core functionality tested (70%+ target)
- ✅ **Clean PRs**: Bite-sized, reviewable pull requests

---

## 📦 Project Structure (Docker-First)

```
nemo-instrument-poc/
├── services/                      # Microservices (Docker-first)
│   ├── frontend/                  # React + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── src-tauri/            # Tauri desktop wrapper
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── backend-mock/              # Mock instrument backend
│       ├── src/
│       │   ├── server.js
│       │   └── websocket.js
│       ├── Dockerfile
│       └── package.json
│
├── docker/                        # Docker orchestration
│   ├── docker-compose.yml         # Main compose file
│   ├── docker-compose.dev.yml    # Development overrides
│   ├── nginx.conf                # Nginx config for frontend
│   └── .env.example              # Environment template
│
├── docs/                          # Documentation
│   ├── initial-poc/              # Initial POC implementation docs
│   │   ├── IMPLEMENTATION_PLAN.md
│   │   ├── ARCHITECTURE_DECISIONS.md
│   │   └── DEMO_SCRIPT.md
│   ├── draft/                    # Original planning docs
│   ├── DOCKER_SETUP.md           # Docker setup guide
│   └── ARCHITECTURE.md           # Architecture decisions
│
├── scripts/                       # Utility scripts
│   ├── setup.sh                  # Initial setup
│   ├── dev.sh                    # Start dev environment
│   └── build.sh                  # Build all services
│
├── .github/                       # CI/CD workflows
├── docker-compose.yml             # Root compose (symlink)
├── package.json                   # Root package.json with scripts
└── README.md                      # Quick start guide
```

---

## 🚀 Implementation Phases & PRs

### **Phase 1: Project Foundation & Docker Infrastructure** (15 min)
**Branch**: `2026.01.27/docker-foundation`

**What we're building**:
- Root project structure with `services/` folder (Docker-first microservices)
- Docker Compose configuration
- Root `package.json` with npm workspaces and helper scripts
- Documentation structure

**Files to create**:
```
package.json                       # Root orchestration scripts
docker-compose.yml                 # Main Docker setup
docker/.env.example               # Environment variables
scripts/setup.sh                  # Initial setup script
docs/DOCKER_SETUP.md              # Docker documentation
README.md                         # Updated with Docker-first approach
.dockerignore                     # Docker ignore patterns
```

**Root package.json scripts**:
```json
{
  "scripts": {
    "start": "docker-compose up",
    "start:clean": "docker-compose up --build",
    "docker:up": "docker-compose up",
    "docker:up:build": "docker-compose up --build",
    "docker:down": "docker-compose down",
    "docker:clean": "docker-compose down -v",
    "docker:logs": "docker-compose logs -f",
    "docker:backend": "docker-compose up backend",
    "docker:frontend": "docker-compose up frontend",
    "dev": "docker-compose -f docker-compose.yml -f docker/docker-compose.dev.yml up",
    "build": "docker-compose build",
    "test": "npm run test --workspaces",
    "setup": "chmod +x scripts/setup.sh && ./scripts/setup.sh"
  },
  "workspaces": [
    "services/frontend",
    "services/backend-mock"
  ]
}
```

**Docker Compose structure**:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./apps/backend-mock
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
      - "3001:3001"
    environment:
      - NODE_ENV=development
    volumes:
      - ./apps/backend-mock:/app
      - /app/node_modules
    networks:
      - nemo-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      target: development
    ports:
      - "5173:5173"
    environment:
      - VITE_WS_URL=ws://localhost:8080
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - nemo-network

networks:
  nemo-network:
    driver: bridge
```

**Acceptance Criteria**:
- ✅ Root `package.json` with workspace configuration
- ✅ Docker Compose files created
- ✅ Project structure documented
- ✅ Setup script executable
- ✅ README updated with Docker-first instructions

---

### **Phase 2: Backend Mock Server** (20 min)
**Branch**: `2026.01.27/backend-mock-server`

**What we're building**:
- Node.js WebSocket server
- Mock instrument simulation
- Health check endpoints
- Dockerized service

**Files to create**:
```
services/backend-mock/
├── src/
│   ├── server.js              # Main Express + WebSocket server
│   ├── websocket.js           # WebSocket handler
│   ├── simulator.js           # Instrument simulation logic
│   └── constants.js           # Run phases, states, etc.
├── Dockerfile                 # Multi-stage build
├── .dockerignore
├── package.json
└── README.md
```

**Key features**:
- Express server with health endpoint
- WebSocket server on port 8080
- Simulated run phases (7 phases as per PRD)
- Real-time status updates
- Error simulation capability

**Dockerfile** (Node 24 Alpine):
```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 8080 3001

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
```

**Acceptance Criteria**:
- ✅ WebSocket server accepts connections
- ✅ Simulates 7-phase run progression
- ✅ Health check endpoint responds
- ✅ Runs in Docker container
- ✅ Logs visible via `docker-compose logs backend`

---

### **Phase 3: Frontend React Application** (25 min)
**Branch**: `2026.01.27/frontend-react-app`

**What we're building**:
- React 19 + Vite 7 + TypeScript
- TailwindCSS styling
- Zustand state management
- Component library (Card, Button, StatusBadge)
- Dockerized development environment

**Files to create**:
```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.test.tsx
│   │   └── RunManagement/
│   │       ├── RunManagement.tsx
│   │       └── RunManagement.test.tsx
│   ├── stores/
│   │   ├── instrumentStore.ts
│   │   └── instrumentStore.test.ts
│   ├── types/
│   │   ├── instrument.ts
│   │   ├── websocket.ts
│   │   └── auth.ts
│   ├── utils/
│   │   └── mockData.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── Dockerfile                 # Multi-stage: dev + production
├── vite.config.ts
├── tailwind.config.js
├── vitest.config.ts
├── package.json
└── README.md
```

**Dockerfile** (Multi-stage):
```dockerfile
# Development stage
FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Key dependencies**:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^7.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^3.2.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@vitest/coverage-v8": "^3.2.0"
  }
}
```

**Acceptance Criteria**:
- ✅ React 19 + Vite 7 initialized
- ✅ TailwindCSS configured with custom colors
- ✅ Zustand store created with tests
- ✅ Common components built
- ✅ Dashboard component renders
- ✅ Runs in Docker on port 5173
- ✅ Hot reload works in container

---

### **Phase 4: WebSocket Integration & Real-Time Communication** (20 min)
**Branch**: `2026.01.27/websocket-integration`

**What we're building**:
- WebSocket service class
- React hook for WebSocket connection
- Real-time status updates
- Run management functionality
- End-to-end integration

**Files to create/modify**:
```
services/frontend/src/
├── services/
│   ├── websocket.ts           # WebSocket service class
│   └── websocket.test.ts      # WebSocket tests
├── hooks/
│   ├── useWebSocket.ts        # React hook
│   └── useWebSocket.test.ts   # Hook tests
└── components/
    └── RunManagement/
        └── RunManagement.tsx  # Updated with WebSocket
```

**WebSocket Service features**:
- Auto-reconnect logic (max 5 attempts)
- Message type handling
- Status update subscriptions
- Connection state management
- Error handling

**Integration flow**:
1. App mounts → `useWebSocket` hook connects
2. Backend sends initial status
3. User selects run config → clicks "Start Run"
4. Frontend sends `START_RUN` message
5. Backend simulates 7 phases
6. Frontend receives real-time updates
7. UI updates progress bar and status

**Acceptance Criteria**:
- ✅ WebSocket connects on app load
- ✅ Real-time status updates work
- ✅ Can start/pause runs
- ✅ Progress bar updates smoothly
- ✅ Auto-reconnect works
- ✅ Tests pass for WebSocket service
- ✅ Full stack works via Docker

---

### **Phase 5: Tauri Desktop Deployment** (10 min)
**Branch**: `2026.01.27/tauri-desktop`

**What we're building**:
- Tauri 2 configuration
- Desktop app wrapper
- Kiosk mode support
- Build scripts

**Files to create**:
```
services/frontend/
├── src-tauri/
│   ├── src/
│   │   └── main.rs            # Tauri main with kiosk flag
│   ├── tauri.conf.json        # Tauri configuration
│   ├── Cargo.toml             # Rust dependencies
│   └── build.rs               # Build script
└── package.json               # Add tauri scripts
```

**Tauri scripts in package.json**:
```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:kiosk": "tauri build -- --kiosk"
  }
}
```

**Kiosk mode in main.rs**:
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let kiosk_mode = args.iter().any(|arg| arg == "--kiosk");
    
    tauri::Builder::default()
        .setup(move |app| {
            if kiosk_mode {
                let window = app.get_window("main").unwrap();
                window.set_fullscreen(true)?;
                window.set_decorations(false)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Acceptance Criteria**:
- ✅ Tauri initialized
- ✅ `npm run tauri:dev` launches desktop app
- ✅ `npm run tauri:build` creates executable
- ✅ Kiosk mode flag works
- ✅ Documentation updated

---

### **Phase 6: Testing, Documentation & Polish** (10 min)
**Branch**: `2026.01.27/testing-docs-polish`

**What we're building**:
- Comprehensive test coverage
- Docker setup documentation
- Architecture documentation
- Demo script

**Files to create/update**:
```
docs/
├── initial-poc/
│   ├── ARCHITECTURE_DECISIONS.md
│   └── DEMO_SCRIPT.md
├── DOCKER_SETUP.md            # Detailed Docker guide
├── ARCHITECTURE.md            # Architecture decisions
└── TESTING.md                 # Testing strategy

services/frontend/src/test/
├── setup.ts                   # Vitest setup
└── utils.tsx                  # Test utilities

README.md                      # Updated quick start
```

**Test coverage targets**:
- Zustand store: 100%
- WebSocket service: 80%+
- Components: 70%+
- Overall: 70%+

**Documentation sections**:
1. **DOCKER_SETUP.md**: Clone → `npm run docker:up` → Access app
2. **ARCHITECTURE.md**: Tech stack, design decisions, trade-offs
3. **DEMO_SCRIPT.md**: Step-by-step demo walkthrough
4. **TESTING.md**: How to run tests, coverage reports

**Root README.md**:
```markdown
# Nemo Instrument POC

## Quick Start (Docker)

```bash
# Clone repository
git clone https://github.com/TheRobBrennan/nemo-instrument-poc
cd nemo-instrument-poc

# Start entire stack
npm run docker:up

# Access application
# Frontend: http://localhost:5173
# Backend Health: http://localhost:3001/health
```

## Development

```bash
# Start with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Desktop App (Tauri)

```bash
cd apps/frontend
npm run tauri:dev
```

See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) for detailed setup.
```

**Acceptance Criteria**:
- ✅ Test coverage >70%
- ✅ All documentation complete
- ✅ README has clear quick start
- ✅ Demo script ready
- ✅ All Docker commands work

---

## 🎬 Demo Flow (Client Presentation)

### Part 1: Docker-First Development (5 min)
```bash
# Show how easy it is to get started
git clone https://github.com/TheRobBrennan/nemo-instrument-poc
cd nemo-instrument-poc
npm run docker:up
```

**Talking points**:
- "Everything runs in Docker from day one"
- "Team members just clone and run one command"
- "No dependency conflicts, works everywhere"

### Part 2: Live Application Demo (10 min)
1. Open `http://localhost:5173`
2. Show connection status (green indicator)
3. Select run configuration
4. Click "Start Run"
5. Watch real-time progress updates
6. Show different instrument states
7. Demonstrate error handling (if time)

**Talking points**:
- "Real-time WebSocket communication"
- "Modern React 19 with professional UI"
- "Simulates actual instrument workflow"

### Part 3: Architecture & Code Quality (5 min)
1. Show project structure
2. Open key files (WebSocket service, Zustand store)
3. Run test suite: `npm test`
4. Show coverage report

**Talking points**:
- "Modular, maintainable architecture"
- "Test-driven development"
- "Production-ready code quality"

### Part 4: Deployment Options (5 min)
1. Show Docker Compose setup
2. Demonstrate Tauri desktop app
3. Explain kiosk mode for Ubuntu

**Talking points**:
- "Flexible deployment: web, desktop, kiosk"
- "Same codebase, multiple targets"
- "Production-ready containerization"

### Part 5: Q&A and Next Steps (5 min)

---

## 📊 Estimated Time Budget

| Phase                          | Estimated Time |
|--------------------------------|----------------|
| Phase 1: Docker Foundation     | 15 min         |
| Phase 2: Backend Mock          | 20 min         |
| Phase 3: Frontend App          | 25 min         |
| Phase 4: WebSocket Integration | 20 min         |
| Phase 5: Tauri Desktop         | 10 min         |
| Phase 6: Testing & Docs        | 10 min         |
| **Total**                      | **~100 min**   |

---

## 🔧 Technology Stack

### Frontend
- **React 19**: Latest stable, Actions API, improved DX
- **Vite 7**: 10-100x faster than CRA, modern build tool
- **TypeScript 5**: Type safety, better DX
- **TailwindCSS 3**: Utility-first styling
- **Zustand 5**: Lightweight state management
- **Vitest 3**: Fast, modern testing

### Backend
- **Node.js 24 LTS**: Latest LTS (Krypton)
- **npm 11**: Bundled with Node 24
- **Express 4**: Web server
- **ws 8**: WebSocket library

### Desktop
- **Tauri 2**: Lightweight alternative to Electron
- **Rust**: Native performance

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration
- **nginx**: Production web server

---

## 🎯 Key Differentiators

1. **Docker-First**: Not an afterthought, built-in from day one
2. **Monorepo with Workspaces**: Clean separation, shared tooling
3. **One-Command Setup**: `npm run docker:up` and you're running
4. **Modular Architecture**: Easy to add new services
5. **Production-Ready**: Multi-stage builds, health checks, proper networking
6. **Test Coverage**: Built with testing from the start
7. **Multiple Deployment Targets**: Web, desktop, kiosk from same codebase

---

## 📝 Notes

- **No commits until approved**: All work stays on branches
- **Bite-sized PRs**: Each PR is reviewable and focused
- **Docker-first**: Every service runs in container
- **Tests as we go**: TDD approach for core functionality
- **Documentation**: Clear, comprehensive, client-ready

---

## ✅ Pre-Demo Checklist

- [ ] All PRs merged to main
- [ ] `npm run docker:up` works from fresh clone
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Demo script prepared
- [ ] Backup plan (screenshots/video) ready
