import { create } from 'zustand';
import type { PoopRecord } from '../db/types';

interface TimerState {
  isRunning: boolean;
  currentRecord: PoopRecord | null;
  startTime: Date | null;

  startTimer: (record: PoopRecord) => void;
  stopTimer: () => void;
  setCurrentRecord: (record: PoopRecord | null) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  currentRecord: null,
  startTime: null,

  startTimer: (record) =>
    set({
      isRunning: true,
      currentRecord: record,
      startTime: new Date(record.start_time),
    }),

  stopTimer: () =>
    set({
      isRunning: false,
      currentRecord: null,
      startTime: null,
    }),

  setCurrentRecord: (record) =>
    set({
      currentRecord: record,
    }),
}));