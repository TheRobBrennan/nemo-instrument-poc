# Nemo Instrument UI - Proof of Concept PRD

## Executive Summary

**Objective**: Demonstrate technical capability to build the Nemo Instrument Commercial UI through a focused proof-of-concept that showcases:
1. Modern React/TypeScript architecture
2. Real-time WebSocket communication
3. Tauri desktop deployment
4. Ubuntu kiosk mode operation
5. Professional testing practices

**Timeline**: Initial demo in ~4 hours, with follow-up refinement

**Success Criteria**: Client gains absolute confidence in our ability to deliver the full SOW

---

## Background

### Business Context
- **Client**: Nautilus Biotechnology
- **Product**: Nemo proteomics instrument
- **Mission**: Democratize access to proteomic analysis for drug discovery and diagnostics
- **User Base**: Research scientists in academia and industry

### Project Scope (Full SOW)
The complete project requires:
- **Run Mode**: Cloud config retrieval, experiment management, real-time status, error handling
- **Admin Mode**: Network configuration with authentication
- **Engineering Mode**: Ability to switch UIs without losing state
- **Deployment**: Ubuntu Linux kiosk mode
- **Communication**: WebSocket integration with instrument backend

---

## POC Scope

### What We'll Demonstrate

#### 1. **Core Architecture** ✅
- React 18+ with TypeScript
- Vite build system (faster than CRA, production-ready)
- Tauri v2 integration
- Professional project structure following SOW requirements

#### 2. **Real-Time Communication** ✅
- WebSocket server (mock instrument backend)
- Client WebSocket connection with auto-reconnect
- Bidirectional data flow
- Real-time status updates
- Mock instrument data simulation

#### 3. **Key UI Components** ✅
- **Dashboard View**: Current instrument status
- **Run Management**: Initiate mock experiment run
- **Real-Time Status Display**: Live updates via WebSocket
- **Mode Switching UI**: Demo authentication and mode transition (visual only for POC)
- Professional UI/UX following modern design patterns

#### 4. **Deployment Demonstrations** ✅
- **Web Mode**: Running in development browser
- **Tauri Desktop**: Packaged application
- **Ubuntu VM Kiosk**: Full deployment scenario with documented setup

#### 5. **Testing & Quality** ✅
- Unit tests for core business logic (Vitest)
- Component tests (React Testing Library)
- WebSocket connection tests
- Test coverage reporting
- CI/CD ready structure

### What We Won't Include in POC
- Actual cloud API integration (will mock)
- Complete flowcell/reagent loading workflow (show simplified version)
- Full admin networking configuration (show UI pattern only)
- Production authentication (demo pattern only)
- Complete error recovery workflows

---

## Technical Architecture

### Frontend Stack
```typescript
{
  "runtime": "Node.js 24.x LTS (Krypton) - Latest LTS, supported until April 2028",
  "packageManager": "npm 11.x - Bundled with Node 24, improved performance & security",
  "framework": "React 19 - Latest stable (19.2 released Oct 2025)",
  "language": "TypeScript 5+",
  "build": "Vite 7 - Latest stable release with improved performance",
  "desktop": "Tauri 2",
  "styling": "TailwindCSS",
  "state": "Zustand - Simple state management (learning opportunity for POC)",
  "websocket": "native WebSocket API",
  "testing": {
    "unit": "Vitest",
    "components": "React Testing Library",
    "e2e": "Playwright (optional for POC)"
  }
}
```

**Note on Zustand**: While this may be new territory, Zustand offers a significantly simpler API than Redux with minimal boilerplate. The POC provides an excellent learning opportunity while keeping the codebase clean. If preferred, we can easily swap to Redux Toolkit or React Context after the demo.

### Backend (Mock for POC)
```typescript
{
  "runtime": "Node.js",
  "framework": "Express + ws library",
  "purpose": "Simulate instrument backend",
  "features": [
    "WebSocket server",
    "Mock experiment states",
    "Simulated status updates",
    "Error condition simulation"
  ]
}
```

### Docker Configuration
```yaml
services:
  - nemo-ui-web: Frontend web server
  - nemo-backend-mock: Mock instrument backend
  - nginx: Optional reverse proxy for production-like setup
```

### Project Structure
```
nemo-instrument-ui/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Dashboard/
│   │   ├── RunManagement/
│   │   ├── StatusDisplay/
│   │   └── ModeSwitch/
│   ├── services/            # Business logic
│   │   ├── websocket.ts     # WebSocket client
│   │   ├── instrumentAPI.ts # Mock cloud API
│   │   └── auth.ts          # Auth patterns
│   ├── stores/              # State management (Zustand)
│   ├── types/               # TypeScript definitions
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
├── src-tauri/               # Tauri backend (Rust)
├── backend-mock/            # Mock instrument backend
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── components/
│   └── integration/
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── docs/
│   ├── SETUP.md            # Ubuntu VM setup guide
│   ├── KIOSK.md            # Kiosk mode configuration
│   └── ARCHITECTURE.md     # Technical decisions
└── scripts/
    ├── setup-vm.sh         # Automated VM setup
    └── deploy-kiosk.sh     # Kiosk deployment
```

---

## User Stories for POC

### Story 1: Real-Time Instrument Status
**As a** scientist  
**I want to** see the current status of the Nemo instrument  
**So that** I know if it's ready for my experiment

**Demo**: Dashboard showing mock instrument states (IDLE, RUNNING, ERROR, READY)

### Story 2: Initiate Experiment Run
**As a** scientist  
**I want to** start an experiment run  
**So that** I can begin my proteomic analysis

**Demo**: Click "Start Run" → WebSocket sends command → Backend responds → UI updates in real-time

### Story 3: Monitor Run Progress
**As a** scientist  
**I want to** see live updates during an experiment  
**So that** I can track progress and identify issues

**Demo**: Simulated run with progress updates every 2 seconds, showing different phases

### Story 4: Mode Switching
**As an** admin  
**I want to** switch to admin mode  
**So that** I can configure network settings

**Demo**: Authentication UI → Mode switch animation → Different UI context

---

## Mock Data & Simulation

### Instrument States
```typescript
type InstrumentState = 
  | 'IDLE'           // Ready for new run
  | 'INITIALIZING'   // Starting up
  | 'LOADING'        // Loading samples/reagents
  | 'RUNNING'        // Experiment in progress
  | 'PAUSED'         // Temporarily stopped
  | 'COMPLETING'     // Finishing run
  | 'ERROR'          // Fault condition
  | 'MAINTENANCE';   // Service mode

interface StatusUpdate {
  state: InstrumentState;
  timestamp: Date;
  progress?: number;      // 0-100 for RUNNING state
  currentStep?: string;   // e.g., "Washing flowcell"
  errorCode?: string;     // When state is ERROR
  errorMessage?: string;
}
```

### WebSocket Messages
```typescript
// Client → Backend
type ClientMessage = 
  | { type: 'START_RUN', configId: string }
  | { type: 'PAUSE_RUN' }
  | { type: 'RESUME_RUN' }
  | { type: 'CANCEL_RUN' }
  | { type: 'GET_STATUS' };

// Backend → Client
type ServerMessage = 
  | { type: 'STATUS_UPDATE', data: StatusUpdate }
  | { type: 'RUN_STARTED', runId: string }
  | { type: 'RUN_COMPLETED', runId: string, results: any }
  | { type: 'ERROR', code: string, message: string };
```

### Simulated Run Phases
```typescript
const runPhases = [
  { name: 'Initializing', duration: 5000, progress: 10 },
  { name: 'Loading Flowcell', duration: 8000, progress: 25 },
  { name: 'Priming Reagents', duration: 10000, progress: 40 },
  { name: 'Sample Loading', duration: 12000, progress: 60 },
  { name: 'Analysis Running', duration: 20000, progress: 85 },
  { name: 'Data Collection', duration: 8000, progress: 95 },
  { name: 'Completing', duration: 5000, progress: 100 }
];
```

---

## Testing Strategy

### Unit Tests (Target: 70%+ coverage)
```typescript
// Example tests
describe('WebSocket Service', () => {
  it('should connect to backend', async () => {});
  it('should auto-reconnect on disconnect', async () => {});
  it('should handle status updates', () => {});
  it('should parse incoming messages correctly', () => {});
});

describe('Instrument State Management', () => {
  it('should transition from IDLE to RUNNING', () => {});
  it('should handle error states', () => {});
  it('should validate run configurations', () => {});
});
```

### Component Tests
```typescript
describe('Dashboard Component', () => {
  it('should render current instrument status', () => {});
  it('should show error message when in ERROR state', () => {});
  it('should update UI when status changes', () => {});
});

describe('RunManagement Component', () => {
  it('should disable start button when instrument busy', () => {});
  it('should show progress during run', () => {});
});
```

### Integration Tests
```typescript
describe('WebSocket Integration', () => {
  it('should receive real-time updates from mock backend', async () => {});
  it('should handle backend disconnection gracefully', async () => {});
});
```

---

## Ubuntu VM Kiosk Setup

### Prerequisites
- Ubuntu 24.04 LTS (fresh install)
- Minimum 4GB RAM, 20GB disk
- Network connectivity

### Automated Setup Script
```bash
#!/bin/bash
# scripts/setup-vm.sh

# 1. Create nemo user
sudo adduser nemo
sudo usermod -aG sudo nemo

# 2. Install dependencies
sudo apt update
sudo apt install -y \
  firefox \
  unclutter \
  docker.io \
  docker-compose \
  git

# 3. Configure kiosk mode
sudo systemctl set-default multi-user.target
sudo mkdir -p /home/nemo/.config/systemd/user/

# 4. Create kiosk service
cat > /home/nemo/.config/systemd/user/kiosk.service << EOF
[Unit]
Description=Nemo Instrument Kiosk
After=graphical.target

[Service]
Environment=DISPLAY=:0
ExecStart=/usr/bin/firefox --kiosk http://localhost:3000
Restart=always

[Install]
WantedBy=default.target
EOF

# 5. Enable service
systemctl --user enable kiosk.service
```

### Deployment Options

#### Option A: Docker Deployment
```bash
# Clone repo
git clone https://github.com/TheRobBrennan/nemo-instrument-poc
cd nemo-instrument-poc

# Deploy with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

#### Option B: Tauri Native App
```bash
# Build Tauri app
npm run tauri build

# Install .deb package
sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb

# Run in kiosk
nemo-instrument --kiosk
```

---

## Demo Flow (4-Hour Meeting)

### Part 1: Architecture Overview (5 min)
- Show project structure
- Explain technology choices
- Highlight alignment with SOW

### Part 2: Web Development Demo (15 min)
- Run `npm run dev`
- Show hot-reload during development
- Demonstrate key UI components
- Show real-time WebSocket communication

### Part 3: Testing Demo (10 min)
- Run test suite: `npm test`
- Show coverage report: `npm run coverage`
- Explain testing philosophy

### Part 4: Docker Deployment (10 min)
- Build containers: `docker-compose build`
- Deploy: `docker-compose up`
- Show containerized application

### Part 5: Ubuntu VM Kiosk (15 min)
- SSH into pre-configured VM
- Show kiosk mode running
- Demonstrate full-screen, locked-down environment
- Explain deployment process

### Part 6: Tauri Desktop App (10 min)
- Show built application
- Demonstrate desktop features
- Compare with web version

### Part 7: Q&A and Next Steps (15 min)

---

## Success Metrics

### Technical Demos
- ✅ WebSocket connection works bidirectionally
- ✅ Real-time updates visible in UI (<100ms latency)
- ✅ Application runs in all three modes (dev, docker, kiosk)
- ✅ Tests pass with >70% coverage
- ✅ Professional UI/UX

### Client Confidence Indicators
- ✅ Client can see themselves in the demo
- ✅ Technical approach aligns with their infrastructure
- ✅ Code quality meets or exceeds expectations
- ✅ Clear path from POC → full implementation
- ✅ Questions answered confidently

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation | Backup Plan |
|------|-----------|-------------|
| WebSocket connectivity issues | Test thoroughly, add reconnection logic | Demonstrate with fallback polling |
| Tauri build fails | Test build beforehand | Show web version only |
| Ubuntu VM issues | Pre-configure and test VM | Use local Ubuntu via Docker |
| Time constraints | Prioritize core features | Have video backup of full demo |

### Demo Risks
| Risk | Mitigation | Backup Plan |
|------|-----------|-------------|
| Network issues | Local deployment | Pre-recorded video |
| Live coding fails | Have working version ready | Switch to prepared demo |
| Questions go deep | Know architecture inside-out | "Let me research and follow up" |

---

## Post-Demo Next Steps

### Immediate (Week 1)
1. Incorporate client feedback
2. Refine architecture based on discussion
3. Create detailed implementation roadmap
4. Establish communication channels

### Short-term (Weeks 2-4)
1. Set up production repo
2. Implement CI/CD pipeline
3. Create development workflow documentation
4. Begin Sprint 0 (infrastructure setup)

### Long-term (Months 2-6)
1. Deliver milestones per SOW
2. Regular sprint demos
3. Iterate based on user testing
4. Prepare for production deployment

---

## Budget Estimates (For Reference)

### POC Development
- Setup & Architecture: 8 hours
- Core UI Components: 16 hours
- WebSocket Integration: 8 hours
- Testing Infrastructure: 8 hours
- Docker/Kiosk Setup: 8 hours
- Documentation: 4 hours
**Total**: ~52 hours (1.5 weeks)

### Full Project (Rough Estimate)
Based on SOW complexity:
- **Phase 1** (Run Mode Core): 6-8 weeks
- **Phase 2** (Admin Mode): 2-3 weeks
- **Phase 3** (Engineering Mode Integration): 2-3 weeks
- **Phase 4** (Testing & Polish): 2-3 weeks
**Total**: ~12-17 weeks (3-4 months)

---

## Appendix

### Technology Justifications

#### React 19 (Stable since December 2024)
- **Latest stable version** - React 19.2 released October 2025
- **Major improvements over React 18**:
  - **Actions API** - Simplified async state updates, form handling, and mutations
  - **No more forwardRef** - ref is now a regular prop on function components
  - **Document metadata** - Native `<title>` and `<meta>` support (no more React Helmet!)
  - **Better error handling** - Improved hydration errors and error boundaries
  - **Asset preloading** - Automatic resource optimization
  - **useActionState hook** - Built-in pending states and error handling
  - **use() hook** - Read resources like Promises and Context during render
- **Server Components stable** (if we need them later)
- **Performance improvements** - Faster rendering and smaller bundles
- **Fully compatible** with Vite 7, TypeScript 5, and our entire stack

**For this POC**: React 19 is production-ready and gives us access to modern patterns that will make the code cleaner. The Actions API in particular will be great for our WebSocket-based run management.

**Migration note**: React 18 → 19 is straightforward for new projects. The React team provides codemods for breaking changes.

#### npm 11 (Bundled with Node.js 24)
- **Automatic with Node 24** - No separate installation needed
- **Performance improvements** - Faster installs with smarter caching
- **Better dependency resolution** - Especially for large projects
- **Enhanced security features** - Improved package integrity checks
- **Modern package compatibility** - Optimized for ES modules and latest JavaScript
- **Breaking changes to be aware of**:
  - `--ignore-scripts` now applies to ALL lifecycle scripts (including `prepare`)
  - Publishing pre-release versions requires explicit `--tag` specification
  - No more fallback to old audit endpoint

**For this POC**: npm 11 comes free with Node 24, giving you the latest tooling automatically.

#### Why Vite 7 over Create-React-App?
- **10-100x faster dev server** - Near-instant HMR even on large projects
- **Latest stable release** (June 2025) - Modern features and optimizations
- **Better tree-shaking** for smaller production bundles
- **Native ESM support** - Leverages modern browser capabilities
- **Active maintenance** - CRA was officially deprecated by React team
- **Industry standard** for new React projects in 2025/2026
- **Excellent Tauri compatibility** - Recommended by Tauri docs
- **Node.js 24 support** - Optimized for latest LTS

**Key Vite 7 improvements over Vite 5:**
- New default `build.target: 'baseline-widely-available'` for better browser compatibility
- Dropped Node.js 18 support (aligns with our Node 24 requirement)
- Performance improvements in dev server and builds
- Better integration with Vitest 3.2+ for testing

**Vite 7 + Tauri 2**: Perfect combination for modern desktop apps with web technologies.

#### Why Zustand over Redux?
- **90% smaller bundle size** (~1KB vs ~11KB for Redux Toolkit)
- **Simpler API, less boilerplate** - No actions, reducers, or providers needed
- **Built-in TypeScript support** - Excellent type inference out of the box
- **Better performance** - No unnecessary re-renders, fine-grained subscriptions
- **Easier to test** - Just plain functions, no middleware complexity
- **Easier to learn** - For someone new to global state, Zustand takes ~30 minutes vs. Redux's steeper learning curve

**Zustand vs Redux Comparison:**
```typescript
// Redux Toolkit - More boilerplate
const slice = createSlice({
  name: 'instrument',
  initialState,
  reducers: {
    setStatus: (state, action) => { state.status = action.payload },
    setConnected: (state, action) => { state.isConnected = action.payload }
  }
});

// Need to configure store
const store = configureStore({ reducer: { instrument: slice.reducer } });

// Need Provider wrapper
<Provider store={store}><App /></Provider>

// In components
const dispatch = useDispatch();
dispatch(setStatus(newStatus));

// Zustand - Minimal boilerplate
const useStore = create((set) => ({
  status: null,
  isConnected: false,
  setStatus: (status) => set({ status }),
  setConnected: (connected) => set({ isConnected: connected })
}));

// No provider needed - just use it
const { status, setStatus } = useStore();
setStatus(newStatus);
```

**For the POC:** Zustand keeps the code focused on business logic rather than state management ceremony. If you prefer Redux after the demo, the migration path is straightforward - the state shape and actions are nearly identical.

**Learning Resources:**
- [Zustand Documentation](https://github.com/pmndrs/zustand) - 5-minute read covers 90% of what you need
- The POC's store implementation is a complete, production-ready example

#### Why Tauri over Electron?
- 50-80% smaller bundle size
- Better security (Rust backend)
- Lower memory usage
- Native system integration
- Active development and community

#### Why Vitest over Jest?
- Native Vite integration
- 2-10x faster test execution
- ESM support out of the box
- Better TypeScript support
- Compatible with Jest API

### Reference Links
- [Tauri v2 Docs](https://v2.tauri.app)
- [React 19 Documentation](https://react.dev)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Vite 7 Guide](https://vite.dev/guide/)
- [Vite 7 Release Notes](https://vite.dev/blog/announcing-vite7)
- [Vite 7 Migration Guide](https://vite.dev/guide/migration)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Node.js 24 LTS Release Notes](https://nodejs.org/en/blog/release/v24.11.0)
