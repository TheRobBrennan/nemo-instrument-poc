import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { RunControls } from './components/RunControls';
import { wsService } from './services/websocket';
import { useInstrumentStore } from './store/instrumentStore';

function App() {
  const { setStatus, setConnected, setError } = useInstrumentStore();

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    
    // Set up connection status callback
    const checkConnection = setInterval(() => {
      setConnected(wsService.isConnected());
    }, 1000);

    wsService.connect(wsUrl);

    wsService.onMessage((message) => {
      console.log('Received message:', message);
      if (message.type === 'STATUS_UPDATE' && message.data) {
        setStatus(message.data);
      } else if (message.type === 'RUN_STARTED') {
        console.log('Run started:', message.runId);
      } else if (message.type === 'RUN_COMPLETED') {
        console.log('Run completed:', message.results);
      }
    });

    return () => {
      clearInterval(checkConnection);
      wsService.disconnect();
      setConnected(false);
    };
  }, [setStatus, setConnected, setError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6 xl:max-w-7xl xl:mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nemo Instrument Control
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Real-time proteomics instrument monitoring and control
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-4 sm:py-8 xl:max-w-7xl xl:mx-auto">
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          <Dashboard />
          <RunControls />
        </div>
      </main>
    </div>
  );
}

export default App;
