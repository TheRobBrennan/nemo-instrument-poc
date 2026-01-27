import { InstrumentState, runPhases } from './constants.js';

export class InstrumentSimulator {
  constructor(ws) {
    this.ws = ws;
    this.currentPhase = 0;
    this.runId = null;
    this.simulationTimer = null;
  }

  startRun(configId) {
    this.runId = `run-${Date.now()}`;
    this.currentPhase = 0;

    // Send run started message
    this.sendMessage({
      type: 'RUN_STARTED',
      runId: this.runId
    });

    // Start simulation
    this.runNextPhase();

    return this.runId;
  }

  runNextPhase() {
    if (this.currentPhase >= runPhases.length) {
      // Run complete
      this.sendMessage({
        type: 'RUN_COMPLETED',
        runId: this.runId,
        results: {
          samplesProcessed: 24,
          timestamp: new Date().toISOString()
        }
      });

      this.sendStatusUpdate({
        state: InstrumentState.IDLE,
        timestamp: new Date().toISOString(),
        runId: this.runId
      });

      this.cleanup();
      return;
    }

    const phase = runPhases[this.currentPhase];

    // Send status update for current phase
    this.sendStatusUpdate({
      state: InstrumentState.RUNNING,
      timestamp: new Date().toISOString(),
      progress: phase.progress,
      currentStep: phase.name,
      runId: this.runId
    });

    // Schedule next phase
    this.simulationTimer = setTimeout(() => {
      this.currentPhase++;
      this.runNextPhase();
    }, phase.duration);
  }

  pauseRun() {
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = null;

      this.sendStatusUpdate({
        state: InstrumentState.PAUSED,
        timestamp: new Date().toISOString(),
        progress: runPhases[this.currentPhase]?.progress || 0,
        currentStep: runPhases[this.currentPhase]?.name || 'Paused',
        runId: this.runId
      });
    }
  }

  resumeRun() {
    if (!this.simulationTimer && this.currentPhase < runPhases.length) {
      this.runNextPhase();
    }
  }

  cancelRun() {
    this.cleanup();

    this.sendStatusUpdate({
      state: InstrumentState.IDLE,
      timestamp: new Date().toISOString()
    });
  }

  sendStatusUpdate(data) {
    this.sendMessage({
      type: 'STATUS_UPDATE',
      data
    });
  }

  sendMessage(message) {
    if (this.ws.readyState === 1) { // WebSocket.OPEN
      this.ws.send(JSON.stringify(message));
    }
  }

  cleanup() {
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = null;
    }
    this.runId = null;
    this.currentPhase = 0;
  }
}
