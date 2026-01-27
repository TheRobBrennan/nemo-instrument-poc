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
    <div className="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Instrument Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
        <div className="py-3 sm:py-0">
          <label className="block text-xs sm:text-sm font-medium text-gray-500 sm:text-gray-700 mb-2 uppercase tracking-wide">
            Current State
          </label>
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full ${getStateColor(status.state)}`} />
            <span className="text-lg sm:text-lg font-bold text-gray-900">{status.state}</span>
          </div>
        </div>

        {status.currentStep && (
          <div className="py-3 sm:py-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-500 sm:text-gray-700 mb-2 uppercase tracking-wide">
              Current Step
            </label>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{status.currentStep}</p>
          </div>
        )}

        {status.progress !== undefined && (
          <div className="py-3 sm:py-0 sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-500 sm:text-gray-700 mb-2.5 uppercase tracking-wide">
              Progress
            </label>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-700 mt-2">{status.progress}%</p>
          </div>
        )}

        {status.runId && (
          <div className="py-3 sm:py-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-500 sm:text-gray-700 mb-2 uppercase tracking-wide">
              Run ID
            </label>
            <p className="text-xs sm:text-sm text-gray-900 font-mono break-all">{status.runId}</p>
          </div>
        )}

        <div className="py-3 sm:py-0">
          <label className="block text-xs sm:text-sm font-medium text-gray-500 sm:text-gray-700 mb-2 uppercase tracking-wide">
            Last Updated
          </label>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(status.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
