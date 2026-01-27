export const InstrumentState = {
  IDLE: 'IDLE',
  INITIALIZING: 'INITIALIZING',
  LOADING: 'LOADING',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETING: 'COMPLETING',
  ERROR: 'ERROR',
  MAINTENANCE: 'MAINTENANCE'
} as const;

export type InstrumentState = typeof InstrumentState[keyof typeof InstrumentState];

export interface InstrumentStatus {
  state: InstrumentState;
  timestamp: string;
  progress?: number;
  currentStep?: string;
  runId?: string;
}

export interface WebSocketMessage {
  type: 'STATUS_UPDATE' | 'RUN_STARTED' | 'RUN_COMPLETED' | 'PONG';
  data?: InstrumentStatus;
  runId?: string;
  results?: {
    samplesProcessed: number;
    timestamp: string;
  };
}
