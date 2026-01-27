# Backend Mock Server

Mock WebSocket backend for Nemo Instrument POC.

## Features

- WebSocket server for real-time communication
- HTTP health check endpoint
- Simulated 7-phase instrument run
- Mock instrument states (IDLE, RUNNING, ERROR, etc.)

## Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload
npm run dev
```

## Docker

```bash
# Build image
docker build -t nemo-backend .

# Run container
docker run -p 8080:8080 -p 3001:3001 nemo-backend
```

## Endpoints

- **WebSocket**: `ws://localhost:8080`
- **Health Check**: `http://localhost:3001/health`

## WebSocket Messages

### Client → Server

```json
{ "type": "START_RUN", "configId": "cfg-001" }
{ "type": "PAUSE_RUN" }
{ "type": "RESUME_RUN" }
{ "type": "CANCEL_RUN" }
{ "type": "GET_STATUS" }
{ "type": "PING" }
```

### Server → Client

```json
{ "type": "STATUS_UPDATE", "data": { "state": "RUNNING", "progress": 50 } }
{ "type": "RUN_STARTED", "runId": "run-123" }
{ "type": "RUN_COMPLETED", "runId": "run-123", "results": {} }
{ "type": "PONG" }
```

## Run Phases

1. Initializing System (5s, 10%)
2. Loading Flowcell (8s, 25%)
3. Priming Reagents (10s, 40%)
4. Loading Samples (12s, 60%)
5. Running Analysis (20s, 85%)
6. Collecting Data (8s, 95%)
7. Completing Run (5s, 100%)

Total simulation time: ~68 seconds
