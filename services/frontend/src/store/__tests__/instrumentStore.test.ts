import { describe, it, expect, beforeEach } from 'vitest';
import { useInstrumentStore } from '../instrumentStore';
import { InstrumentState } from '../../types/instrument';

describe('instrumentStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useInstrumentStore.setState({
      status: {
        state: InstrumentState.IDLE,
        timestamp: new Date().toISOString(),
      },
      isConnected: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useInstrumentStore.getState();
      
      expect(state.status.state).toBe(InstrumentState.IDLE);
      expect(state.status.timestamp).toBeDefined();
      expect(state.isConnected).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('setStatus', () => {
    it('should update status', () => {
      const { setStatus } = useInstrumentStore.getState();
      
      const newStatus = {
        state: InstrumentState.RUNNING,
        timestamp: new Date().toISOString(),
      };
      
      setStatus(newStatus);
      
      expect(useInstrumentStore.getState().status.state).toBe(InstrumentState.RUNNING);
    });

    it('should handle all valid status states', () => {
      const { setStatus } = useInstrumentStore.getState();
      const states = [
        InstrumentState.IDLE,
        InstrumentState.INITIALIZING,
        InstrumentState.LOADING,
        InstrumentState.RUNNING,
        InstrumentState.PAUSED,
        InstrumentState.COMPLETING,
        InstrumentState.ERROR,
        InstrumentState.MAINTENANCE,
      ];

      states.forEach((state) => {
        setStatus({
          state,
          timestamp: new Date().toISOString(),
        });
        expect(useInstrumentStore.getState().status.state).toBe(state);
      });
    });

    it('should include optional fields in status', () => {
      const { setStatus } = useInstrumentStore.getState();
      
      setStatus({
        state: InstrumentState.RUNNING,
        timestamp: new Date().toISOString(),
        progress: 50,
        currentStep: 'Processing data...',
        runId: 'test-run-123',
      });
      
      const state = useInstrumentStore.getState();
      expect(state.status.progress).toBe(50);
      expect(state.status.currentStep).toBe('Processing data...');
      expect(state.status.runId).toBe('test-run-123');
    });
  });

  describe('setConnected', () => {
    it('should update connection status', () => {
      const { setConnected } = useInstrumentStore.getState();
      
      setConnected(true);
      expect(useInstrumentStore.getState().isConnected).toBe(true);
      
      setConnected(false);
      expect(useInstrumentStore.getState().isConnected).toBe(false);
    });
  });

  describe('setError', () => {
    it('should update error state', () => {
      const { setError } = useInstrumentStore.getState();
      
      setError('Connection failed');
      expect(useInstrumentStore.getState().error).toBe('Connection failed');
      
      setError(null);
      expect(useInstrumentStore.getState().error).toBe(null);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete run workflow', () => {
      const { setStatus, setConnected } = useInstrumentStore.getState();
      
      // Connect
      setConnected(true);
      expect(useInstrumentStore.getState().isConnected).toBe(true);
      
      // Start run - Initializing
      setStatus({
        state: InstrumentState.INITIALIZING,
        timestamp: new Date().toISOString(),
        progress: 10,
        currentStep: 'Initializing instrument...',
      });
      
      let state = useInstrumentStore.getState();
      expect(state.status.state).toBe(InstrumentState.INITIALIZING);
      expect(state.status.progress).toBe(10);
      
      // Loading
      setStatus({
        state: InstrumentState.LOADING,
        timestamp: new Date().toISOString(),
        progress: 25,
        currentStep: 'Loading sample...',
      });
      
      state = useInstrumentStore.getState();
      expect(state.status.state).toBe(InstrumentState.LOADING);
      expect(state.status.progress).toBe(25);
      
      // Running
      setStatus({
        state: InstrumentState.RUNNING,
        timestamp: new Date().toISOString(),
        progress: 60,
        currentStep: 'Running analysis...',
      });
      
      state = useInstrumentStore.getState();
      expect(state.status.state).toBe(InstrumentState.RUNNING);
      expect(state.status.progress).toBe(60);
      
      // Completing
      setStatus({
        state: InstrumentState.COMPLETING,
        timestamp: new Date().toISOString(),
        progress: 100,
        currentStep: 'Analysis complete',
      });
      
      state = useInstrumentStore.getState();
      expect(state.status.state).toBe(InstrumentState.COMPLETING);
      expect(state.status.progress).toBe(100);
    });

    it('should handle connection state changes during run', () => {
      const { setConnected, setStatus } = useInstrumentStore.getState();
      
      // Connect and start run
      setConnected(true);
      setStatus({
        state: InstrumentState.RUNNING,
        timestamp: new Date().toISOString(),
        progress: 50,
      });
      
      expect(useInstrumentStore.getState().isConnected).toBe(true);
      expect(useInstrumentStore.getState().status.state).toBe(InstrumentState.RUNNING);
      
      // Disconnect
      setConnected(false);
      expect(useInstrumentStore.getState().isConnected).toBe(false);
      expect(useInstrumentStore.getState().status.state).toBe(InstrumentState.RUNNING); // Status unchanged
    });

    it('should handle error scenarios', () => {
      const { setStatus, setError, setConnected } = useInstrumentStore.getState();
      
      // Start connected
      setConnected(true);
      
      // Set error status
      setStatus({
        state: InstrumentState.ERROR,
        timestamp: new Date().toISOString(),
      });
      setError('Instrument malfunction');
      
      const state = useInstrumentStore.getState();
      expect(state.status.state).toBe(InstrumentState.ERROR);
      expect(state.error).toBe('Instrument malfunction');
      
      // Clear error
      setError(null);
      setStatus({
        state: InstrumentState.IDLE,
        timestamp: new Date().toISOString(),
      });
      
      const clearedState = useInstrumentStore.getState();
      expect(clearedState.status.state).toBe(InstrumentState.IDLE);
      expect(clearedState.error).toBe(null);
    });
  });
});
