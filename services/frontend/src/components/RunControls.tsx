import { wsService } from '../services/websocket';
import { useInstrumentStore } from '../store/instrumentStore';
import { InstrumentState } from '../types/instrument';

export function RunControls() {
  const { status, isConnected } = useInstrumentStore();

  const handleStartRun = () => {
    wsService.send({
      type: 'START_RUN',
      configId: `cfg-${Date.now()}`
    });
  };

  const handlePauseRun = () => {
    wsService.send({ type: 'PAUSE_RUN' });
  };

  const handleResumeRun = () => {
    wsService.send({ type: 'RESUME_RUN' });
  };

  const handleCancelRun = () => {
    wsService.send({ type: 'CANCEL_RUN' });
  };

  const isRunning = status.state === InstrumentState.RUNNING;
  const isPaused = status.state === InstrumentState.PAUSED;
  const isIdle = status.state === InstrumentState.IDLE;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Run Controls</h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleStartRun}
          disabled={!isConnected || !isIdle}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Start Run
        </button>

        <button
          onClick={handlePauseRun}
          disabled={!isConnected || !isRunning}
          className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Pause Run
        </button>

        <button
          onClick={handleResumeRun}
          disabled={!isConnected || !isPaused}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Resume Run
        </button>

        <button
          onClick={handleCancelRun}
          disabled={!isConnected || isIdle}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Cancel Run
        </button>
      </div>

      {!isConnected && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ⚠️ Not connected to instrument. Please check the backend server.
          </p>
        </div>
      )}
    </div>
  );
}
