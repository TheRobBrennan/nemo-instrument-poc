import { useInstrumentStore } from '../store/instrumentStore';
import { InstrumentState, type InstrumentStatus } from '../types/instrument';

export function Dashboard() {
  const { status, isConnected } = useInstrumentStore();

  const getStateColor = (state: InstrumentStatus['state']) => {
    switch (state) {
      case InstrumentState.IDLE:
        return 'bg-gray-500';
      case InstrumentState.RUNNING:
        return 'bg-green-500';
      case InstrumentState.PAUSED:
        return 'bg-yellow-500';
      case InstrumentState.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Instrument Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current State
          </label>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStateColor(status.state)}`} />
            <span className="text-lg font-semibold text-gray-900">{status.state}</span>
          </div>
        </div>

        {status.currentStep && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Step
            </label>
            <p className="text-lg text-gray-900">{status.currentStep}</p>
          </div>
        )}

        {status.progress !== undefined && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress
            </label>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{status.progress}%</p>
          </div>
        )}

        {status.runId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Run ID
            </label>
            <p className="text-sm text-gray-900 font-mono">{status.runId}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Updated
          </label>
          <p className="text-sm text-gray-900">
            {new Date(status.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
