# Nemo Instrument POC

A proof of concept for the Nemo proteomics instrument UI with Docker-first development workflow.

## Features

- **Docker-First Development**: Everything runs in containers from day one
- **Real-Time WebSocket Communication**: Live instrument status updates
- **Modern Tech Stack**: React 19, Vite 7, Node.js 24 LTS, Tauri 2
- **Monorepo Architecture**: npm workspaces for frontend and backend services
- **Automated Versioning**: Semantic versioning with GPG signing
- **Local Testing**: GitHub Actions testing with `act`

## Quick Start

### Docker Mode (Web)

```bash
# Clone repository
git clone https://github.com/TheRobBrennan/nemo-instrument-poc
cd nemo-instrument-poc

# Run setup script (checks dependencies, offers Rust installation)
npm run setup

# Start entire stack
npm start

# Or build and start fresh
npm run start:clean
```

**Access Points:**
- Frontend: <http://localhost:5173>
- Backend Health: <http://localhost:3001/health>
- WebSocket: <ws://localhost:8080>

### Desktop Mode (Tauri)

**Prerequisites**: Requires Rust installed OR use Docker build

**Option 1: Local (requires Rust)**
```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Start backend
npm run docker:backend

# Launch desktop app
npm run desktop
```

**Option 2: Platform-Specific Builds**
```bash
# macOS build (requires Rust on macOS)
npm run tauri:build:macos

# Linux build (Docker - no Rust required)
npm run tauri:build:linux
```

## Development Commands

```bash
# Docker commands
npm start              # Start all services
npm run start:clean    # Rebuild and start
npm run docker:down    # Stop all services
npm run docker:clean   # Stop and remove volumes
npm run docker:logs    # View logs

# Service-specific
npm run docker:frontend  # Start frontend only
npm run docker:backend   # Start backend only

# Testing
npm test               # Run all tests
```

## Project Structure

```
nemo-instrument-poc/
├── services/
│   ├── frontend/          # React + Vite + TypeScript
│   └── backend-mock/      # Node.js WebSocket server
├── docker/                # Docker configuration
├── docs/                  # Documentation
│   ├── initial-poc/       # POC implementation docs
│   └── draft/             # Original planning docs
└── scripts/               # Utility scripts
```

## Legacy Quick Start (Non-Docker)

If you plan on using the generate-gpg-key.sh script to generate a GPG key, temporarily replace the placeholder passphrase with a secure passphrase of your choice:

```sh
# TODO: Replace this with a secure passphrase of your choice
PASSPHRASE="d3f3nd!t@ll"
```

## Testing GitHub Actions Locally

We recommend using [act](https://github.com/nektos/act) to test GitHub Actions workflows locally before pushing changes if you are developing on a Mac.

The application does not have to be running in Docker to test the workflows, but Docker Desktop must be running for the act tests to run and spin up the necessary containers.

Prerequisites for macOS

- Homebrew
- Docker Desktop (must be running)

```sh
# Install act using Homebrew
brew install act

# Verify installation
act --version # Should show 0.2.74 or higher

```

### Running Tests

The following test scripts are available:

1. `npm run test`
   - Primary test command
   - Runs all workflow tests via test:workflows
   - Recommended for general testing

2. `npm run test:workflows`
   - Runs all workflow tests in sequence
   - Tests PR title validation and version bumping
   - Provides detailed feedback

3. `npm run test:workflows:semantic`
   - Tests PR title validation only (using minor version example)
   - Validates against conventional commit format

4. `npm run test:workflows:semantic:major`
   - Tests PR title validation with breaking change
   - Validates major version bump detection

5. `npm run test:workflows:semantic:minor`
   - Tests PR title validation with new feature
   - Validates minor version bump detection

6. `npm run test:workflows:semantic:patch`
   - Tests PR title validation with bug fix
   - Validates patch version bump detection

7. `npm run test:workflows:semantic:invalid`
   - Tests PR title validation with invalid format
   - Verifies rejection of non-compliant PR titles

8. `npm run test:workflows:version`
   - Tests version bump workflow
   - Note: Git operations will fail locally (expected)

9. `npm run test:workflows:merge`
   - Tests main branch merge workflow
   - Simulates PR merge and version bump process
   - Note: Git operations will fail locally (expected)

#### Expected Test Results

1. Semantic PR Check Tests:
   - All tests should pass except "invalid" test
   - Invalid PR format test should fail with clear error

2. Version Bump Tests:
   - Will show git authentication errors (expected)
   - These workflows can only be fully tested in GitHub Actions

3. Merge Tests:
   - Will show authentication errors locally (expected)
   - Tests workflow syntax and merge logic
   - Full functionality requires GitHub Actions environment

## Development Guidelines

- **Version Control**: We use semantic versioning with automated version bumps
- **Commit Signing**: All commits must be GPG signed
- **Pull Requests**: PR titles must follow conventional commit format

For detailed guidelines, see:

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Testing Documentation](./.github/docs/TESTING.md)
- [Repository Setup](./.github/docs/SETUP.md) (for maintainers)
