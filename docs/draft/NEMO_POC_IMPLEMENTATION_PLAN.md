# Nemo Instrument UI POC - Implementation Plan for Windsurf

## Overview

This document provides step-by-step instructions for building the Nemo Instrument UI proof-of-concept. Each task is designed to be executed sequentially, with clear acceptance criteria.

---

## Prerequisites

### Local Machine Setup

```bash
# Required installations
node --version    # Should be >= 24.0.0 (Node.js 24.x LTS "Krypton" recommended)
npm --version     # Should be >= 11.0.0 (bundled with Node 24)
docker --version  # For containerization
git --version     # For version control

# Install Rust for Tauri (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Recommended Node.js Installation:**

```bash
# Using nvm (recommended for managing Node versions)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
nvm install 24
nvm use 24

# Verify versions
node --version  # Should show v24.x.x
npm --version   # Should show 11.x.x (bundled with Node 24)
```

**Note**: npm 11 comes bundled with Node.js 24, so installing Node 24 automatically gives you npm 11 with improved performance, security, and modern package compatibility.

### Repository Setup

```bash
# Use your template as base
git clone https://github.com/SplooshAI/sploosh-ai-github-template nemo-instrument-poc
cd nemo-instrument-poc

# Create new repo
# Manually create on GitHub: https://github.com/TheRobBrennan/nemo-instrument-poc
git remote set-url origin https://github.com/TheRobBrennan/nemo-instrument-poc.git
git push -u origin main
```

---

## Phase 1: Project Scaffolding (1-2 hours)

### Task 1.1: Initialize React + Vite + TypeScript Project

```bash
# Create Vite project with React + TypeScript
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install

# Verify versions (should be React 19.x and Vite 7.x)
npm list react vite

# Install additional dependencies
npm install \
  zustand \
  @tanstack/react-query \
  clsx \
  tailwind-merge

# Install dev dependencies
npm install -D \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/coverage-v8 \
  jsdom \
  tailwindcss \
  postcss \
  autoprefixer \
  @types/node
```

**Note**: `npm create vite@latest` will install React 19.x and Vite 7.x by default as of January 2026.

**React 19 Benefits for this POC**:

- Actions API will simplify our WebSocket command handling
- No need for `forwardRef` - cleaner component code
- Better error messages during development
- Native async transitions for smooth UI updates

**Acceptance Criteria:**

- ✅ `npm run dev` starts development server
- ✅ `npm run build` completes without errors
- ✅ TypeScript types are working
- ✅ React version is 19.x (check with `npm list react`)
- ✅ Vite version is 7.x (check with `npm list vite`)

### Task 1.2: Configure TailwindCSS

```bash
npx tailwindcss init -p
```

**File: `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nautilus: {
          primary: '#0066CC',
          secondary: '#00A896',
          accent: '#FF6B35',
          dark: '#1A1A2E',
          light: '#F8F9FA'
        }
      }
    },
  },
  plugins: [],
}
```

**File: `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-nautilus-light text-nautilus-dark;
  }
}
```

**Acceptance Criteria:**

- ✅ TailwindCSS classes work in components
- ✅ Custom colors accessible

### Task 1.3: Configure Vitest

**File: `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**Note**: This configuration is compatible with React 19, Vite 7, and Vitest 3.2+. React Testing Library works seamlessly with React 19's new features like the Actions API and improved ref handling.

**File: `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**File: `package.json` - Update scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

**Acceptance Criteria:**

- ✅ `npm test` runs test suite
- ✅ `npm run test:coverage` generates coverage report

### Task 1.4: Project Structure Setup

```bash
# Create directory structure
mkdir -p src/{components,services,stores,types,hooks,utils,test}
mkdir -p src/components/{Dashboard,RunManagement,StatusDisplay,ModeSwitch,common}
mkdir -p backend-mock
mkdir -p docs
mkdir -p docker
```

**Acceptance Criteria:**

- ✅ Directory structure matches PRD

---

## Phase 2: Type Definitions & Mock Data (30 min)

### Task 2.1: Create TypeScript Types

**File: `src/types/instrument.ts`**

```typescript
export type InstrumentState = 
  | 'IDLE'
  | 'INITIALIZING'
  | 'LOADING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETING'
  | 'ERROR'
  | 'MAINTENANCE';

export interface StatusUpdate {
  state: InstrumentState;
  timestamp: Date;
  progress?: number;
  currentStep?: string;
  errorCode?: string;
  errorMessage?: string;
  runId?: string;
}

export interface RunConfiguration {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  flowcellType: string;
  reagentKit: string;
  sampleCount: number;
}

export interface RunPhase {
  name: string;
  duration: number;
  progress: number;
}
```

**File: `src/types/websocket.ts`**

```typescript
import { StatusUpdate } from './instrument';

export type ClientMessage = 
  | { type: 'START_RUN', configId: string }
  | { type: 'PAUSE_RUN' }
  | { type: 'RESUME_RUN' }
  | { type: 'CANCEL_RUN' }
  | { type: 'GET_STATUS' }
  | { type: 'PING' };

export type ServerMessage = 
  | { type: 'STATUS_UPDATE', data: StatusUpdate }
  | { type: 'RUN_STARTED', runId: string }
  | { type: 'RUN_COMPLETED', runId: string, results?: any }
  | { type: 'ERROR', code: string, message: string }
  | { type: 'PONG' };

export interface WebSocketConfig {
  url: string;
  reconnectDelay: number;
  maxReconnectAttempts: number;
}
```

**File: `src/types/auth.ts`**

```typescript
export type UserRole = 'scientist' | 'admin' | 'engineer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export type AppMode = 'run' | 'admin' | 'engineering';
```

**Acceptance Criteria:**

- ✅ All types export correctly
- ✅ No TypeScript errors

### Task 2.2: Create Mock Data

**File: `src/utils/mockData.ts`**

```typescript
import { RunConfiguration, RunPhase } from '@/types/instrument';

export const mockRunConfigurations: RunConfiguration[] = [
  {
    id: 'cfg-001',
    name: 'Protein Analysis - Batch A',
    description: 'Standard protein identification workflow',
    createdAt: new Date('2026-01-20'),
    flowcellType: 'FC-100',
    reagentKit: 'RK-2024-Q1',
    sampleCount: 24
  },
  {
    id: 'cfg-002',
    name: 'PTM Discovery',
    description: 'Post-translational modification discovery',
    createdAt: new Date('2026-01-22'),
    flowcellType: 'FC-200',
    reagentKit: 'RK-2024-Q1',
    sampleCount: 48
  },
  {
    id: 'cfg-003',
    name: 'Biomarker Validation',
    description: 'Clinical biomarker validation study',
    createdAt: new Date('2026-01-25'),
    flowcellType: 'FC-100',
    reagentKit: 'RK-2024-Q2',
    sampleCount: 12
  }
];

export const runPhases: RunPhase[] = [
  { name: 'Initializing System', duration: 5000, progress: 10 },
  { name: 'Loading Flowcell', duration: 8000, progress: 25 },
  { name: 'Priming Reagents', duration: 10000, progress: 40 },
  { name: 'Loading Samples', duration: 12000, progress: 60 },
  { name: 'Running Analysis', duration: 20000, progress: 85 },
  { name: 'Collecting Data', duration: 8000, progress: 95 },
  { name: 'Completing Run', duration: 5000, progress: 100 }
];

export const getRandomErrorCode = (): { code: string; message: string } => {
  const errors = [
    { code: 'ERR_001', message: 'Flowcell temperature out of range' },
    { code: 'ERR_002', message: 'Reagent level critically low' },
    { code: 'ERR_003', message: 'Sample injection failed' },
    { code: 'ERR_004', message: 'Optical alignment error' }
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};
```

**Acceptance Criteria:**

- ✅ Mock data imports correctly
- ✅ Types match definitions

---

## Phase 3: State Management (30 min)

**About Zustand**: If you're new to Zustand, don't worry! It's intentionally simple - think of it as useState but global. The entire API you need to know:

- `create()` - Creates a store
- `set()` - Updates state
- `get()` - Reads state (rarely needed)
- `useStore()` - React hook to access state

That's it! No actions, reducers, or dispatchers. The POC uses basic patterns that will be easy to follow.

### Task 3.1: Create Zustand Store

**File: `src/stores/instrumentStore.ts`**

```typescript
import { create } from 'zustand';
import { InstrumentState, StatusUpdate } from '@/types/instrument';
import { AppMode, User } from '@/types/auth';

interface InstrumentStore {
  // State
  status: StatusUpdate | null;
  isConnected: boolean;
  currentMode: AppMode;
  currentUser: User | null;
  
  // Actions
  setStatus: (status: StatusUpdate) => void;
  setConnected: (connected: boolean) => void;
  setMode: (mode: AppMode) => void;
  setUser: (user: User | null) => void;
  reset: () => void;
}

const initialState = {
  status: {
    state: 'IDLE' as InstrumentState,
    timestamp: new Date(),
  },
  isConnected: false,
  currentMode: 'run' as AppMode,
  currentUser: null,
};

export const useInstrumentStore = create<InstrumentStore>((set) => ({
  ...initialState,
  
  setStatus: (status) => set({ status }),
  setConnected: (connected) => set({ isConnected: connected }),
  setMode: (mode) => set({ currentMode: mode }),
  setUser: (user) => set({ currentUser: user }),
  reset: () => set(initialState),
}));
```

**File: `src/stores/instrumentStore.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useInstrumentStore } from './instrumentStore';
import { InstrumentState } from '@/types/instrument';

describe('InstrumentStore', () => {
  beforeEach(() => {
    useInstrumentStore.getState().reset();
  });

  it('should initialize with IDLE state', () => {
    const { status } = useInstrumentStore.getState();
    expect(status?.state).toBe('IDLE');
  });

  it('should update status', () => {
    const newStatus = {
      state: 'RUNNING' as InstrumentState,
      timestamp: new Date(),
      progress: 50,
      currentStep: 'Loading Samples'
    };
    
    useInstrumentStore.getState().setStatus(newStatus);
    const { status } = useInstrumentStore.getState();
    
    expect(status?.state).toBe('RUNNING');
    expect(status?.progress).toBe(50);
  });

  it('should update connection state', () => {
    useInstrumentStore.getState().setConnected(true);
    expect(useInstrumentStore.getState().isConnected).toBe(true);
  });

  it('should reset to initial state', () => {
    useInstrumentStore.getState().setConnected(true);
    useInstrumentStore.getState().setMode('admin');
    useInstrumentStore.getState().reset();
    
    const state = useInstrumentStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.currentMode).toBe('run');
  });
});
```

**Acceptance Criteria:**

- ✅ Store tests pass
- ✅ State updates work correctly

**Zustand Quick Reference:**

```typescript
// In components - it's just like useState!
const status = useInstrumentStore(state => state.status);  // Subscribe to status only
const isConnected = useInstrumentStore(state => state.isConnected);  // Subscribe to connection

// Or get multiple values
const { status, isConnected } = useInstrumentStore();

// Update state - call the action
useInstrumentStore.getState().setStatus(newStatus);

// That's it! No provider needed, no dispatch, no reducers.
```

---

## Phase 4: WebSocket Service (1 hour)

### Task 4.1: Create WebSocket Service

**File: `src/services/websocket.ts`**

```typescript
import { ClientMessage, ServerMessage, WebSocketConfig } from '@/types/websocket';
import { StatusUpdate } from '@/types/instrument';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private messageHandlers: ((message: ServerMessage) => void)[] = [];
  private statusHandlers: ((status: StatusUpdate) => void)[] = [];

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080',
      reconnectDelay: config.reconnectDelay || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.config.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(data: string): void {
    try {
      const message: ServerMessage = JSON.parse(data);
      
      // Notify all message handlers
      this.messageHandlers.forEach(handler => handler(message));
      
      // Handle status updates specially
      if (message.type === 'STATUS_UPDATE') {
        this.statusHandlers.forEach(handler => handler(message.data));
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  onMessage(handler: (message: ServerMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onStatusUpdate(handler: (status: StatusUpdate) => void): () => void {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
```

**File: `src/services/websocket.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketService } from './websocket';

// Mock WebSocket
class MockWebSocket {
  readyState = 1; // OPEN
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;

  send = vi.fn();
  close = vi.fn();

  triggerOpen() {
    if (this.onopen) this.onopen();
  }

  triggerMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    mockWs = new MockWebSocket();
    global.WebSocket = vi.fn(() => mockWs as any);
    service = new WebSocketService({ url: 'ws://test' });
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should connect successfully', async () => {
    const connectPromise = service.connect();
    mockWs.triggerOpen();
    await expect(connectPromise).resolves.toBeUndefined();
  });

  it('should send messages when connected', async () => {
    await service.connect();
    mockWs.triggerOpen();
    
    service.send({ type: 'GET_STATUS' });
    
    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'GET_STATUS' })
    );
  });

  it('should handle incoming messages', async () => {
    await service.connect();
    mockWs.triggerOpen();
    
    const handler = vi.fn();
    service.onMessage(handler);
    
    mockWs.triggerMessage({ type: 'PONG' });
    
    expect(handler).toHaveBeenCalledWith({ type: 'PONG' });
  });

  it('should handle status updates', async () => {
    await service.connect();
    mockWs.triggerOpen();
    
    const statusHandler = vi.fn();
    service.onStatusUpdate(statusHandler);
    
    const status = { state: 'RUNNING', timestamp: new Date() };
    mockWs.triggerMessage({ type: 'STATUS_UPDATE', data: status });
    
    expect(statusHandler).toHaveBeenCalled();
  });
});
```

**Acceptance Criteria:**

- ✅ WebSocket tests pass
- ✅ Connection/reconnection logic works
- ✅ Message handlers work correctly

---

## Phase 5: Mock Backend Server (45 min)

### Task 5.1: Create Mock Backend

**File: `backend-mock/package.json`**

```json
{
  "name": "nemo-backend-mock",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "ws": "^8.16.0",
    "express": "^4.18.2"
  }
}
```

**File: `backend-mock/server.js`**

```javascript
import { WebSocketServer } from 'ws';
import express from 'express';

const HTTP_PORT = 3001;
const WS_PORT = 8080;

// Express server for health checks
const app = express();
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

// Simulation state
const simulations = new Map();

// Run phases simulation
const runPhases = [
  { name: 'Initializing System', duration: 5000, progress: 10 },
  { name: 'Loading Flowcell', duration: 8000, progress: 25 },
  { name: 'Priming Reagents', duration: 10000, progress: 40 },
  { name: 'Loading Samples', duration: 12000, progress: 60 },
  { name: 'Running Analysis', duration: 20000, progress: 85 },
  { name: 'Collecting Data', duration: 8000, progress: 95 },
  { name: 'Completing Run', duration: 5000, progress: 100 }
];

function simulateRun(ws, runId) {
  let currentPhase = 0;
  
  const runPhase = () => {
    if (currentPhase >= runPhases.length) {
      // Run complete
      ws.send(JSON.stringify({
        type: 'RUN_COMPLETED',
        runId,
        results: { samplesProcessed: 24, timestamp: new Date() }
      }));
      
      ws.send(JSON.stringify({
        type: 'STATUS_UPDATE',
        data: {
          state: 'IDLE',
          timestamp: new Date(),
          runId
        }
      }));
      
      simulations.delete(runId);
      return;
    }
    
    const phase = runPhases[currentPhase];
    
    ws.send(JSON.stringify({
      type: 'STATUS_UPDATE',
      data: {
        state: 'RUNNING',
        timestamp: new Date(),
        progress: phase.progress,
        currentStep: phase.name,
        runId
      }
    }));
    
    currentPhase++;
    setTimeout(runPhase, phase.duration);
  };
  
  // Start simulation
  runPhase();
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial status
  ws.send(JSON.stringify({
    type: 'STATUS_UPDATE',
    data: {
      state: 'IDLE',
      timestamp: new Date()
    }
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message);
      
      switch (message.type) {
        case 'START_RUN':
          const runId = `run-${Date.now()}`;
          ws.send(JSON.stringify({
            type: 'RUN_STARTED',
            runId
          }));
          
          // Start simulation
          simulateRun(ws, runId);
          simulations.set(runId, { configId: message.configId });
          break;
          
        case 'GET_STATUS':
          ws.send(JSON.stringify({
            type: 'STATUS_UPDATE',
            data: {
              state: 'IDLE',
              timestamp: new Date()
            }
          }));
          break;
          
        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server running on port ${WS_PORT}`);
```

**Acceptance Criteria:**

- ✅ Backend starts without errors
- ✅ Accepts WebSocket connections
- ✅ Simulates run phases correctly

---

## Phase 6: React Components (2 hours)

### Task 6.1: Create Common Components

**File: `src/components/common/Card.tsx`**

```typescript
import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title }) => {
  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-md p-6',
      className
    )}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-nautilus-dark">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
```

**File: `src/components/common/Button.tsx`**

```typescript
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-nautilus-primary hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-nautilus-dark',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={clsx(
        'font-semibold rounded-lg transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

**File: `src/components/common/StatusBadge.tsx`**

```typescript
import React from 'react';
import { InstrumentState } from '@/types/instrument';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  state: InstrumentState;
}

const statusConfig: Record<InstrumentState, { label: string; className: string }> = {
  IDLE: { label: 'Idle', className: 'bg-gray-200 text-gray-800' },
  INITIALIZING: { label: 'Initializing', className: 'bg-blue-200 text-blue-800' },
  LOADING: { label: 'Loading', className: 'bg-yellow-200 text-yellow-800' },
  RUNNING: { label: 'Running', className: 'bg-green-200 text-green-800' },
  PAUSED: { label: 'Paused', className: 'bg-orange-200 text-orange-800' },
  COMPLETING: { label: 'Completing', className: 'bg-blue-200 text-blue-800' },
  ERROR: { label: 'Error', className: 'bg-red-200 text-red-800' },
  MAINTENANCE: { label: 'Maintenance', className: 'bg-purple-200 text-purple-800' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state }) => {
  const config = statusConfig[state];
  
  return (
    <span className={clsx(
      'px-3 py-1 rounded-full text-sm font-semibold',
      config.className
    )}>
      {config.label}
    </span>
  );
};
```

**Acceptance Criteria:**

- ✅ Components render correctly
- ✅ Props work as expected
- ✅ Styling looks good

### Task 6.2: Create Dashboard Component

**File: `src/components/Dashboard/Dashboard.tsx`**

```typescript
import React from 'react';
import { useInstrumentStore } from '@/stores/instrumentStore';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/StatusBadge';

export const Dashboard: React.FC = () => {
  const { status, isConnected } = useInstrumentStore();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-nautilus-dark">
        Nemo Instrument Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Connection Status">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-lg">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </Card>

        <Card title="Instrument Status">
          {status && <StatusBadge state={status.state} />}
        </Card>

        <Card title="Current Run">
          <p className="text-gray-600">
            {status?.runId || 'No active run'}
          </p>
        </Card>
      </div>

      {status?.state === 'RUNNING' && (
        <Card title="Run Progress">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{status.currentStep}</span>
              <span>{status.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-nautilus-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {status?.state === 'ERROR' && (
        <Card title="Error Information" className="border-2 border-red-500">
          <div className="space-y-2">
            <p className="text-red-600 font-semibold">
              Error Code: {status.errorCode}
            </p>
            <p className="text-gray-700">
              {status.errorMessage}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
```

**File: `src/components/Dashboard/Dashboard.test.tsx`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useInstrumentStore } from '@/stores/instrumentStore';

describe('Dashboard', () => {
  beforeEach(() => {
    useInstrumentStore.getState().reset();
  });

  it('should render dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Nemo Instrument Dashboard')).toBeInTheDocument();
  });

  it('should show disconnected state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should show connected state when connected', () => {
    useInstrumentStore.getState().setConnected(true);
    render(<Dashboard />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should display progress bar when running', () => {
    useInstrumentStore.getState().setStatus({
      state: 'RUNNING',
      timestamp: new Date(),
      progress: 50,
      currentStep: 'Loading Samples'
    });
    
    render(<Dashboard />);
    expect(screen.getByText('Loading Samples')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**

- ✅ Dashboard renders correctly
- ✅ Shows connection status
- ✅ Shows instrument status
- ✅ Progress bar works
- ✅ Tests pass

### Task 6.3: Create RunManagement Component

**File: `src/components/RunManagement/RunManagement.tsx`**

```typescript
import React, { useState } from 'react';
import { useInstrumentStore } from '@/stores/instrumentStore';
import { websocketService } from '@/services/websocket';
import { mockRunConfigurations } from '@/utils/mockData';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const RunManagement: React.FC = () => {
  const { status } = useInstrumentStore();
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  
  const canStartRun = status?.state === 'IDLE' && selectedConfig;
  const isRunning = status?.state === 'RUNNING';

  const handleStartRun = () => {
    if (selectedConfig) {
      websocketService.send({
        type: 'START_RUN',
        configId: selectedConfig
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-nautilus-dark">
        Run Management
      </h2>

      <Card title="Select Configuration">
        <div className="space-y-4">
          {mockRunConfigurations.map((config) => (
            <label
              key={config.id}
              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="config"
                value={config.id}
                checked={selectedConfig === config.id}
                onChange={(e) => setSelectedConfig(e.target.value)}
                disabled={isRunning}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-nautilus-dark">
                  {config.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {config.description}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>Flowcell: {config.flowcellType}</span>
                  <span>Samples: {config.sampleCount}</span>
                  <span>Created: {config.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleStartRun}
          disabled={!canStartRun}
          variant="primary"
          size="lg"
        >
          Start Run
        </Button>
        
        {isRunning && (
          <Button
            onClick={() => websocketService.send({ type: 'PAUSE_RUN' })}
            variant="secondary"
            size="lg"
          >
            Pause Run
          </Button>
        )}
      </div>
    </div>
  );
};
```

**Acceptance Criteria:**

- ✅ Can select configuration
- ✅ Start run button works
- ✅ Disabled states work correctly

---

## Phase 7: Integration & Main App (30 min)

### Task 7.1: Create Custom Hook for WebSocket

**File: `src/hooks/useWebSocket.ts`**

```typescript
import { useEffect } from 'react';
import { websocketService } from '@/services/websocket';
import { useInstrumentStore } from '@/stores/instrumentStore';

export const useWebSocket = () => {
  const { setStatus, setConnected } = useInstrumentStore();

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect()
      .then(() => {
        setConnected(true);
        console.log('WebSocket connected successfully');
      })
      .catch((error) => {
        console.error('WebSocket connection failed:', error);
        setConnected(false);
      });

    // Subscribe to status updates
    const unsubscribe = websocketService.onStatusUpdate((status) => {
      setStatus(status);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      websocketService.disconnect();
      setConnected(false);
    };
  }, [setStatus, setConnected]);

  return {
    send: websocketService.send.bind(websocketService),
    isConnected: websocketService.isConnected()
  };
};
```

**File: `src/App.tsx`**

```typescript
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { RunManagement } from '@/components/RunManagement/RunManagement';
import { useWebSocket } from '@/hooks/useWebSocket';

function App() {
  useWebSocket();

  return (
    <div className="min-h-screen bg-nautilus-light">
      <header className="bg-nautilus-primary text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Nautilus Nemo Instrument</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Dashboard />
        <RunManagement />
      </main>
      
      <footer className="bg-gray-800 text-white py-4 mt-16">
        <div className="container mx-auto px-4 text-center text-sm">
          © 2026 Nautilus Biotechnology • Proof of Concept
        </div>
      </footer>
    </div>
  );
}

export default App;
```

**Acceptance Criteria:**

- ✅ App renders correctly
- ✅ WebSocket connects on mount
- ✅ Components work together

---

## Phase 8: Tauri Integration (45 min)

**Note on Tauri + Vite 7**: Tauri 2 is fully compatible with Vite 7. The Tauri team recommends Vite for all SPA frameworks (React, Vue, Svelte, etc.). Vite 7's improved performance will make `tauri dev` even faster!

### Task 8.1: Install Tauri

```bash
npm install @tauri-apps/api
npm install -D @tauri-apps/cli
```

**File: `package.json` - Add scripts:**

```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Task 8.2: Initialize Tauri

```bash
npm run tauri init
```

Answer prompts:

- App name: `nemo-instrument`
- Window title: `Nemo Instrument UI`
- Web assets: `../dist`
- Dev server: `http://localhost:5173`
- Dev command: `npm run dev`
- Build command: `npm run build`

**File: `src-tauri/tauri.conf.json` - Configure kiosk:**

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "nemo-instrument",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "window": {
        "all": false,
        "fullscreen": true
      }
    },
    "windows": [
      {
        "title": "Nemo Instrument",
        "width": 1920,
        "height": 1080,
        "resizable": false,
        "fullscreen": false,
        "decorations": true
      }
    ]
  }
}
```

**Add CLI argument for kiosk mode in `src-tauri/src/main.rs`:**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let mut builder = tauri::Builder::default();
    
    // Check for --kiosk argument
    let args: Vec<String> = std::env::args().collect();
    let kiosk_mode = args.iter().any(|arg| arg == "--kiosk");
    
    builder
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

**Acceptance Criteria:**

- ✅ `npm run tauri:dev` launches desktop app
- ✅ `npm run tauri build` creates executable
- ✅ `--kiosk` flag works

---

## Phase 9: Docker Configuration (30 min)

### Task 9.1: Create Dockerfiles

**File: `docker/Dockerfile.web`**

```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**File: `docker/nginx.conf`**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**File: `docker/Dockerfile.backend`**

```dockerfile
FROM node:24-alpine

WORKDIR /app
COPY backend-mock/package*.json ./
RUN npm ci
COPY backend-mock/ .

EXPOSE 8080 3001
CMD ["npm", "start"]
```

**File: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "8080:8080"
      - "3001:3001"
    networks:
      - nemo-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - nemo-network
    environment:
      - VITE_WS_URL=ws://localhost:8080

networks:
  nemo-network:
    driver: bridge
```

**Acceptance Criteria:**

- ✅ `docker-compose up` starts both services
- ✅ Web UI accessible at `http://localhost:3000`
- ✅ WebSocket connects to backend

---

## Phase 10: Documentation & Ubuntu Setup (1 hour)

### Task 10.1: Create Setup Documentation

**File: `docs/UBUNTU_SETUP.md`**

```markdown
# Ubuntu VM Setup Guide

## Prerequisites
- Ubuntu 24.04 LTS (fresh install)
- Minimum 4GB RAM
- 20GB disk space
- Network connectivity

## Quick Setup

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/TheRobBrennan/nemo-instrument-poc/main/scripts/setup-vm.sh
chmod +x setup-vm.sh
sudo ./setup-vm.sh
```

## Manual Setup

### 1. Create User

```bash
sudo adduser nemo
sudo usermod -aG sudo,docker nemo
```

### 2. Install Dependencies

```bash
sudo apt update
sudo apt install -y docker.io docker-compose git firefox unclutter
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Clone Repository

```bash
cd /home/nemo
git clone https://github.com/TheRobBrennan/nemo-instrument-poc
cd nemo-instrument-poc
```

### 4. Deploy Application

```bash
docker-compose up -d
```

### 5. Configure Kiosk Mode

```bash
# Create systemd service
sudo mkdir -p /home/nemo/.config/systemd/user/
sudo tee /home/nemo/.config/systemd/user/kiosk.service << EOF
[Unit]
Description=Nemo Instrument Kiosk
After=graphical.target

[Service]
Environment=DISPLAY=:0
ExecStartPre=/usr/bin/sleep 5
ExecStart=/usr/bin/firefox --kiosk http://localhost:3000
Restart=always

[Install]
WantedBy=default.target
EOF

# Enable service
sudo systemctl --user enable kiosk.service
sudo loginctl enable-linger nemo
```

### 6. Auto-login (Optional)

```bash
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d/
sudo tee /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin nemo --noclear %I $TERM
EOF
```

## Verification

1. Reboot: `sudo reboot`
2. System should auto-login as `nemo`
3. Firefox should launch in kiosk mode
4. Application should be visible at fullscreen

## Troubleshooting

### Docker not running

```bash
sudo systemctl status docker
sudo systemctl restart docker
```

### Application not accessible

```bash
docker-compose logs
curl http://localhost:3000
```

### Kiosk not starting

```bash
systemctl --user status kiosk.service
journalctl --user -u kiosk.service
```

```

**File: `scripts/setup-vm.sh`**
```bash
#!/bin/bash
set -e

echo "=== Nemo Instrument POC - Ubuntu Setup ==="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "Please run as regular user with sudo privileges"
  exit 1
fi

# Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "Installing dependencies..."
sudo apt install -y \
  docker.io \
  docker-compose \
  git \
  firefox \
  unclutter \
  curl \
  wget

# Enable Docker
echo "Configuring Docker..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Clone repository
echo "Cloning repository..."
cd ~
if [ -d "nemo-instrument-poc" ]; then
  echo "Repository already exists, pulling latest..."
  cd nemo-instrument-poc
  git pull
else
  git clone https://github.com/TheRobBrennan/nemo-instrument-poc
  cd nemo-instrument-poc
fi

# Start services
echo "Starting Docker services..."
docker-compose up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 10

# Verify
echo "Verifying installation..."
curl -f http://localhost:3000 > /dev/null && echo "✅ Web UI is running"
curl -f http://localhost:3001/health > /dev/null && echo "✅ Backend is running"

echo ""
echo "=== Setup Complete! ==="
echo "Access the application at: http://localhost:3000"
echo ""
echo "To enable kiosk mode, run: sudo ./scripts/setup-kiosk.sh"
```

**Acceptance Criteria:**

- ✅ Documentation is clear
- ✅ Setup script works
- ✅ Can reproduce setup on fresh VM

---

## Phase 11: Final Integration & Testing (30 min)

### Task 11.1: Run Full Test Suite

```bash
# Unit and component tests
npm test

# Coverage report
npm run test:coverage

# Build verification
npm run build

# Tauri build (if time permits)
npm run tauri build
```

### Task 11.2: End-to-End Verification

1. Start backend: `cd backend-mock && npm start`
2. Start frontend: `npm run dev`
3. Verify:
   - WebSocket connects
   - Can start run
   - Progress updates in real-time
   - UI responsive

### Task 11.3: Docker Verification

```bash
docker-compose up --build
# Visit http://localhost:3000
# Verify full functionality
```

**Acceptance Criteria:**

- ✅ All tests pass
- ✅ Coverage >70%
- ✅ Application works in dev mode
- ✅ Application works in Docker
- ✅ Tauri build succeeds (optional)

---

## Demo Checklist

Before the client meeting:

### Technical Preparation

- [ ] All code committed to GitHub
- [ ] Tests passing
- [ ] Docker containers built
- [ ] Ubuntu VM configured (if using)
- [ ] Backup video recorded (optional)

### Demo Environment

- [ ] Backend running (`cd backend-mock && npm start`)
- [ ] Frontend running (`npm run dev`)
- [ ] Docker compose ready (`docker-compose up`)
- [ ] VM accessible (SSH or direct)

### Presentation Materials

- [ ] PRD printed/ready
- [ ] Architecture diagram
- [ ] Code samples highlighted
- [ ] Test coverage report open

### Key Talking Points

- [ ] Technology choices align with SOW
- [ ] Real-time communication demonstrated
- [ ] Professional code quality
- [ ] Testing philosophy
- [ ] Deployment flexibility (web/desktop/kiosk)
- [ ] Clear path to production

---

## Post-Demo Actions

### Immediate Follow-up

- [ ] Send thank-you email
- [ ] Share GitHub repository link
- [ ] Provide demo recording (if available)
- [ ] Answer any technical questions

### Based on Feedback

- [ ] Incorporate requested changes
- [ ] Refine architecture
- [ ] Update timeline estimates
- [ ] Prepare detailed proposal

---

## Notes for Windsurf

This implementation plan is designed to be executed sequentially. Each phase builds on the previous one. If you encounter issues:

1. **Check dependencies**: Ensure all npm packages are installed
2. **Verify versions**: Node >= 18, npm >= 9
3. **Test incrementally**: Run tests after each major component
4. **Commit frequently**: Commit after each phase completion

The plan prioritizes:

- **Working software** over perfect code
- **Real functionality** over mock UIs
- **Demonstrable value** over comprehensive features
- **Test coverage** from the start

Good luck with the demo! 🚀
