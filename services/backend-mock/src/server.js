import express from 'express';
import { WebSocketServer } from 'ws';
import { InstrumentState } from './constants.js';
import { InstrumentSimulator } from './simulator.js';

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const WS_PORT = process.env.WS_PORT || 8080;

// Express server for health checks
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`✅ HTTP server running on port ${HTTP_PORT}`);
  console.log(`   Health check: http://localhost:${HTTP_PORT}/health`);
});

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`✅ WebSocket server running on port ${WS_PORT}`);
console.log(`   Connect at: ws://localhost:${WS_PORT}`);

// Track simulators per connection
const simulators = new Map();

wss.on('connection', (ws) => {
  console.log('🔌 Client connected');

  // Create simulator for this connection
  const simulator = new InstrumentSimulator(ws);
  simulators.set(ws, simulator);

  // Send initial status
  ws.send(JSON.stringify({
    type: 'STATUS_UPDATE',
    data: {
      state: InstrumentState.IDLE,
      timestamp: new Date().toISOString()
    }
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message.type);

      switch (message.type) {
        case 'START_RUN':
          simulator.startRun(message.configId);
          break;

        case 'PAUSE_RUN':
          simulator.pauseRun();
          break;

        case 'RESUME_RUN':
          simulator.resumeRun();
          break;

        case 'CANCEL_RUN':
          simulator.cancelRun();
          break;

        case 'GET_STATUS':
          simulator.sendStatusUpdate({
            state: InstrumentState.IDLE,
            timestamp: new Date().toISOString()
          });
          break;

        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;

        default:
          console.log('⚠️  Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    const simulator = simulators.get(ws);
    if (simulator) {
      simulator.cleanup();
      simulators.delete(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, closing servers...');
  wss.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});
