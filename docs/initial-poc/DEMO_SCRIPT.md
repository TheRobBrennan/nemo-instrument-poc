# Nemo Instrument POC - Demo Script

**Duration**: 28 minutes  
**Audience**: Technical stakeholders  
**Objective**: Demonstrate production-ready POC with Docker-first development and automated testing

---

## 🎯 Demo Objectives

1. Show ease of setup (Docker-first approach)
2. Demonstrate real-time WebSocket communication
3. Highlight desktop deployment capability
4. Showcase code quality and architecture

---

## 📋 Pre-Demo Checklist

- [ ] Backend running: `npm run docker:backend`
- [ ] Desktop app built: `npm run desktop:show` (verify .app exists)
- [ ] Browser tab ready: <http://localhost:5173>
- [ ] Terminal ready with project root open
- [ ] GitHub PR #16 open in browser (Phase 5)

---

## 🎬 Demo Flow

### Part 1: Quick Start - Docker-First Development (3 min)

**Action:**
```bash
# Show how easy it is to get started
npm start
```

**Talking Points:**
- "Everything runs in Docker from day one"
- "Team members just clone and run `npm start`"
- "No dependency conflicts, works on any machine"
- "Backend WebSocket server + Frontend React app"

**Show:**
- Docker containers starting
- Backend health check: <http://localhost:3001/health>
- Frontend loading: <http://localhost:5173>

---

### Part 2: Web Application Demo (5 min)

**Action:**
1. Open <http://localhost:5173>
2. Point out connection status (green ✅ Connected)
3. Click "Start Run" button
4. Watch real-time progress updates

**Talking Points:**
- "Real-time WebSocket communication - no polling"
- "7-phase instrument simulation (~68 seconds)"
- "Progress bar animates through: 10% → 25% → 40% → 60% → 85% → 95% → 100%"
- "Current step updates in real-time"
- "Professional UI with TailwindCSS v4 and GenUI branding"

**Show:**
- Connection indicator
- Start Run button
- Real-time progress bar animation
- Phase transitions (INITIALIZING → LOADING → RUNNING → etc.)
- Pause/Resume/Cancel controls

---

### Part 3: Desktop Application (5 min)

**Action:**
1. Open desktop app from Finder
2. Show it connects to same backend
3. Click "Start Run" in desktop app
4. Show real-time updates

**Talking Points:**
- "Native macOS/Windows/Linux desktop app using Tauri 2"
- "Same React codebase, deployed as native application"
- "10MB app size vs 100MB+ with Electron"
- "Auto-reconnect with exponential backoff"
- "Can run offline with local backend"

**Show:**
- Desktop app window (1280x800, GenUI branding)
- Connection status
- Real-time updates working
- Stop backend → show reconnection attempts
- Restart backend → auto-reconnects

---

### Part 4: Architecture & Code Quality (5 min)

**Action:**
```bash
# Show project structure
tree -L 2 services/

# Show key files
cat services/frontend/src/services/websocket.ts  # Auto-reconnect logic
cat services/frontend/src/store/instrumentStore.ts  # State management
```

**Talking Points:**
- "Monorepo with npm workspaces"
- "React 19, Vite 7, TypeScript, TailwindCSS v4"
- "Node.js 24 LTS backend"
- "Zustand for state management"
- "WebSocket service with unlimited retry + exponential backoff"

**Show:**
- Project structure
- WebSocket auto-reconnect code
- Zustand store
- Type definitions

---

### Part 5: Automated Testing (3 min)

**Action:**
```bash
# Run tests
npm test

# Show coverage
npm run test:coverage

# Show test file
cat services/frontend/src/store/__tests__/instrumentStore.test.ts
```

**Talking Points:**
- "Vitest for fast, modern testing"
- "100% coverage on Zustand store (9 tests passing)"
- "Tests run in < 1 second"
- "Interactive test UI available"
- "Coverage reports: text, JSON, HTML"

**Show:**
- Test execution and results
- Coverage report
- Test file structure
- Test utilities

**Demo Output:**
```
✓ instrumentStore (9 tests) 3ms
  ✓ initial state (1)
  ✓ setStatus (3)
  ✓ setConnected (1)
  ✓ setError (1)
  ✓ integration scenarios (3)

Test Files  1 passed (1)
     Tests  9 passed (9)
  Duration  879ms
```

---

### Part 6: Developer Experience (4 min)

**Action:**
```bash
# Show available commands
npm run

# Show setup script
npm run setup
```

**Talking Points:**
- "Automated setup script checks dependencies"
- "Rust version management for desktop builds"
- "Platform-specific build options"
- "Docker for Linux builds (no Rust required)"
- "Comprehensive documentation"
- "Automated testing with Vitest"

**Show:**
- Root package.json scripts
- Setup script checking Rust
- Documentation structure
- Phase summaries
- Test commands

---

### Part 7: Deployment Options (3 min)

**Action:**
```bash
# Show build scripts
cat package.json | grep tauri
```

**Talking Points:**
- "Web deployment: Standard Docker containers"
- "Desktop deployment: Native apps for all platforms"
- "macOS: `npm run tauri:build:macos` (requires Rust)"
- "Linux: `npm run tauri:build:linux` (Docker, no Rust)"
- "CI/CD ready with GitHub Actions"

**Show:**
- Build scripts
- Built .app in Finder
- Dockerfile.tauri for Linux builds

---

## 🎯 Key Takeaways

1. **Docker-First**: Production-ready from day one
2. **Real-Time**: WebSocket communication with auto-reconnect
3. **Cross-Platform**: Web + Desktop (macOS/Windows/Linux)
4. **Modern Stack**: React 19, Vite 7, Tauri 2, Node 24 LTS
5. **Automated Testing**: Vitest with 100% store coverage, < 1s execution
6. **Developer Experience**: One-command setup, comprehensive docs

---

## 🔧 Troubleshooting

### Backend not connecting
```bash
npm run docker:backend
# Wait for "WebSocket server listening on port 8080"
```

### Desktop app not connecting
1. Quit desktop app completely (Cmd+Q)
2. Ensure backend is running
3. Reopen desktop app

### Port conflicts
```bash
npm run docker:clean  # Stop and remove containers
npm start             # Restart fresh
```

---

## 📊 Demo Metrics

- **Setup time**: < 2 minutes (clone + `npm start`)
- **Build time**: ~2.5 minutes (first desktop build)
- **Run simulation**: ~68 seconds (7 phases)
- **Test execution**: < 1 second (9 tests)
- **Lines of code**: 8,000+ added
- **Phases completed**: 6 (Foundation, Backend, Frontend, Desktop, Documentation, Testing)
- **PRs merged**: 6
- **Test coverage**: 100% (Zustand store)
- **Version**: 0.5.0

---

## 🎤 Q&A Preparation

**Q: How hard is it to add new instrument types?**  
A: Very easy - just add new state constants and update the simulator phases.

**Q: Can this scale to multiple instruments?**  
A: Yes - backend is stateless, can run multiple instances behind load balancer.

**Q: What about security?**  
A: WebSocket can use WSS (TLS), authentication can be added via JWT tokens.

**Q: How do you handle disconnections?**  
A: Auto-reconnect with exponential backoff (1s → 30s max), unlimited retries.

**Q: Why Tauri over Electron?**  
A: 10x smaller bundle size, better performance, native OS integration, Rust security.

**Q: Can we deploy this today?**  
A: Yes - Docker images ready, desktop apps built, just need deployment target.

**Q: What about testing?**  
A: Comprehensive automated testing with Vitest - 100% store coverage, 9 tests passing in < 1 second. Interactive UI for debugging. Ready for CI/CD.

**Q: How do you ensure code quality?**  
A: Automated testing on every PR, 100% coverage on critical paths (stores), TypeScript for type safety, ESLint for code style.
