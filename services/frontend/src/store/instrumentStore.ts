import { create } from 'zustand';
import { InstrumentState, type InstrumentStatus } from '../types/instrument';

interface InstrumentStore {
  status: InstrumentStatus;
  isConnected: boolean;
  error: string | null;
  setStatus: (status: InstrumentStatus) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInstrumentStore = create<InstrumentStore>((set) => ({
  status: {
    state: InstrumentState.IDLE,
    timestamp: new Date().toISOString(),
  },
  isConnected: false,
  error: null,
  setStatus: (status) => set({ status }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),
}));
