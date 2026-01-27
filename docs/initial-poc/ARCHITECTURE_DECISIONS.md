# Architecture Decision Records (ADRs)

## Overview

This document captures key architectural decisions made during the Nemo Instrument POC development.

---

## ADR-001: Docker-First Development Approach

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need to ensure consistent development environment across team and easy onboarding for new developers.

### Decision
Adopt Docker-first approach where all services run in containers from day one.

### Consequences

**Positive:**
- Consistent environment across all machines
- No "works on my machine" issues
- Easy onboarding (clone + `npm start`)
- Production parity
- Isolated dependencies

**Negative:**
- Requires Docker installed
- Slightly slower startup than native
- Learning curve for Docker newcomers

**Mitigation:**
- Comprehensive Docker documentation
- Setup script checks for Docker
- Clear error messages

---

## ADR-002: Monorepo with npm Workspaces

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need to manage multiple services (frontend, backend) with shared tooling and dependencies.

### Decision
Use npm workspaces for monorepo management instead of Lerna or Nx.

### Rationale
- Native npm support (no additional tools)
- Simple and lightweight
- Good enough for 2-3 services
- Easy to understand

### Consequences

**Positive:**
- Single `package-lock.json`
- Shared dependencies
- Simple workspace commands
- No additional tooling

**Negative:**
- Less features than Nx/Turborepo
- Manual dependency management

---

## ADR-003: WebSocket for Real-Time Communication

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need real-time instrument status updates with low latency.

### Decision
Use WebSocket protocol instead of HTTP polling or Server-Sent Events (SSE).

### Rationale
- Bidirectional communication
- Lower latency than polling
- Industry standard for real-time apps
- Better than SSE for two-way communication

### Consequences

**Positive:**
- True real-time updates
- Efficient (no polling overhead)
- Can send commands to instrument
- Scalable with proper infrastructure

**Negative:**
- More complex than HTTP
- Requires connection management
- Need reconnection logic

**Mitigation:**
- Implemented auto-reconnect with exponential backoff
- Unlimited retry attempts
- Clear connection status indicator

---

## ADR-004: React 19 + Vite 7 for Frontend

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need modern, performant frontend framework with good developer experience.

### Decision
Use React 19 with Vite 7 instead of Create React App or Next.js.

### Rationale
- React 19: Latest features, better performance
- Vite 7: Fastest build tool, excellent DX
- TypeScript: Type safety
- No framework lock-in (unlike Next.js)

### Consequences

**Positive:**
- Instant HMR (Hot Module Replacement)
- Fast builds (~1-2 seconds)
- Modern React features
- Great developer experience

**Negative:**
- React 19 is cutting edge (potential bugs)
- Smaller ecosystem than React 18

---

## ADR-005: Zustand for State Management

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need simple state management for instrument status and connection state.

### Decision
Use Zustand instead of Redux, Context API, or Jotai.

### Rationale
- Minimal boilerplate
- TypeScript-first
- No providers needed
- Perfect for small-medium apps
- Easy to test

### Consequences

**Positive:**
- Very simple API
- Less code than Redux
- Better than Context for performance
- Easy to understand

**Negative:**
- Less ecosystem than Redux
- No time-travel debugging (without devtools)

---

## ADR-006: Tauri 2 for Desktop Deployment

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need cross-platform desktop application deployment.

### Decision
Use Tauri 2 instead of Electron.

### Rationale
- 10x smaller bundle size (~10MB vs ~100MB)
- Better performance (native webview)
- Rust backend (security + performance)
- Native OS integration
- Same React codebase

### Consequences

**Positive:**
- Tiny bundle size
- Better performance
- Native feel
- Rust security benefits
- Lower memory usage

**Negative:**
- Requires Rust toolchain
- Smaller ecosystem than Electron
- Platform-specific builds

**Mitigation:**
- Docker builds for Linux (no Rust needed)
- Automated Rust setup script
- Comprehensive documentation

---

## ADR-007: TailwindCSS v4 for Styling

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need modern, maintainable CSS approach.

### Decision
Use TailwindCSS v4 instead of CSS Modules or styled-components.

### Rationale
- Utility-first approach
- No CSS file management
- Consistent design system
- Excellent DX with IntelliSense
- v4 performance improvements

### Consequences

**Positive:**
- Fast development
- Consistent styling
- Small bundle size (unused CSS purged)
- No naming conflicts

**Negative:**
- HTML can look cluttered
- Learning curve for utility classes

---

## ADR-008: Node.js 24 LTS for Backend

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need stable, performant backend runtime.

### Decision
Use Node.js 24 LTS instead of older versions or Deno/Bun.

### Rationale
- Latest LTS (long-term support)
- Best performance
- Stable and production-ready
- Great ecosystem

### Consequences

**Positive:**
- Latest features
- Best performance
- Long-term support
- Mature ecosystem

**Negative:**
- Requires Node 24 (newer than some systems)

**Mitigation:**
- Docker handles Node version
- Setup script checks version

---

## ADR-009: Auto-Reconnect WebSocket Strategy

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Desktop app needs to handle backend restarts gracefully.

### Decision
Implement unlimited retry with exponential backoff (1s → 30s max).

### Rationale
- Desktop apps should never give up
- Exponential backoff prevents server overload
- 30s max prevents excessive waiting
- Resets to 1s on successful connection

### Consequences

**Positive:**
- Robust connection handling
- Automatic recovery
- No manual intervention needed
- Good user experience

**Negative:**
- Keeps trying forever (could be wasteful)

**Mitigation:**
- Max 30s delay prevents excessive retries
- Clear console logging for debugging

---

## ADR-010: Phase-Based Implementation

**Status**: Accepted  
**Date**: 2026-01-27  
**Deciders**: Development Team

### Context
Need to deliver working demo in limited time with clear progress.

### Decision
Break implementation into 6 phases with separate PRs.

### Rationale
- Clear milestones
- Reviewable PRs
- Can demo at any phase
- Easy to track progress
- Reduces merge conflicts

### Consequences

**Positive:**
- Clear progress tracking
- Small, reviewable PRs
- Can stop at any phase
- Good documentation

**Negative:**
- More overhead (6 PRs vs 1)
- Need to maintain branch discipline

---

## Summary of Key Decisions

| Decision | Technology | Rationale |
|----------|-----------|-----------|
| Development | Docker-first | Consistency, easy onboarding |
| Monorepo | npm workspaces | Simple, native npm support |
| Real-time | WebSocket | Low latency, bidirectional |
| Frontend | React 19 + Vite 7 | Modern, fast, great DX |
| State | Zustand | Simple, minimal boilerplate |
| Desktop | Tauri 2 | Small size, performance |
| Styling | TailwindCSS v4 | Utility-first, consistent |
| Backend | Node.js 24 LTS | Latest LTS, performant |
| Reconnect | Exponential backoff | Robust, automatic recovery |
| Process | 6 phases | Clear milestones, reviewable |
