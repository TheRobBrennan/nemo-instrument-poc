// Instrument states
export const InstrumentState = {
  IDLE: 'IDLE',
  INITIALIZING: 'INITIALIZING',
  LOADING: 'LOADING',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETING: 'COMPLETING',
  ERROR: 'ERROR',
  MAINTENANCE: 'MAINTENANCE'
};

// Run phases simulation
export const runPhases = [
  { name: 'Initializing System', duration: 5000, progress: 10 },
  { name: 'Loading Flowcell', duration: 8000, progress: 25 },
  { name: 'Priming Reagents', duration: 10000, progress: 40 },
  { name: 'Loading Samples', duration: 12000, progress: 60 },
  { name: 'Running Analysis', duration: 20000, progress: 85 },
  { name: 'Collecting Data', duration: 8000, progress: 95 },
  { name: 'Completing Run', duration: 5000, progress: 100 }
];

// Error codes
export const errorCodes = [
  { code: 'ERR_001', message: 'Flowcell temperature out of range' },
  { code: 'ERR_002', message: 'Reagent level critically low' },
  { code: 'ERR_003', message: 'Sample injection failed' },
  { code: 'ERR_004', message: 'Optical alignment error' }
];
