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
    <div className="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Run Controls</h2>

      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
        <button
          onClick={handleStartRun}
          disabled={!isConnected || !isIdle}
          className="w-full px-6 py-4 sm:py-3 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Start Run
        </button>

        <button
          onClick={handlePauseRun}
          disabled={!isConnected || !isRunning}
          className="w-full px-6 py-4 sm:py-3 bg-yellow-600 text-white text-base font-semibold rounded-lg hover:bg-yellow-700 active:bg-yellow-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Pause Run
        </button>

        <button
          onClick={handleResumeRun}
          disabled={!isConnected || !isPaused}
          className="w-full px-6 py-4 sm:py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Resume Run
        </button>

        <button
          onClick={handleCancelRun}
          disabled={!isConnected || isIdle}
          className="w-full px-6 py-4 sm:py-3 bg-red-600 text-white text-base font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
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
