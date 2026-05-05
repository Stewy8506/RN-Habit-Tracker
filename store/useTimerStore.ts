import { create } from 'zustand';

import { FocusMode } from '@/types/session';
import { FOCUS_DURATION_SECONDS } from '@/utils/constants';

type TimerState = {
  mode: FocusMode;
  secondsLeft: number;
  focusDurationSeconds: number;
  breakDurationSeconds: number;
  isRunning: boolean;
  selectedTaskId: string | null;
  setMode: (mode: FocusMode, secondsLeft: number) => void;
  setSecondsLeft: (secondsLeft: number) => void;
  setFocusDurationSeconds: (seconds: number) => void;
  setBreakDurationSeconds: (seconds: number) => void;
  setFocusDurationMinutes: (minutes: number) => void;
  setBreakDurationMinutes: (minutes: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  reset: () => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  mode: 'focus',
  secondsLeft: FOCUS_DURATION_SECONDS,
  focusDurationSeconds: FOCUS_DURATION_SECONDS,
  breakDurationSeconds: 5 * 60,
  isRunning: false,
  selectedTaskId: null,
  setMode: (mode, secondsLeft) => set({ mode, secondsLeft }),
  setSecondsLeft: (secondsLeft) => set({ secondsLeft }),
  setFocusDurationSeconds: (focusDurationSeconds) =>
    set((state) => ({
      focusDurationSeconds,
      secondsLeft:
        state.mode === 'focus' && !state.isRunning ? focusDurationSeconds : state.secondsLeft,
    })),
  setBreakDurationSeconds: (breakDurationSeconds) =>
    set((state) => ({
      breakDurationSeconds,
      secondsLeft:
        state.mode === 'break' && !state.isRunning ? breakDurationSeconds : state.secondsLeft,
    })),
  setFocusDurationMinutes: (minutes) =>
    set((state) => {
      const focusDurationSeconds = Math.round(minutes * 60);
      return {
        focusDurationSeconds,
        secondsLeft:
          state.mode === 'focus' && !state.isRunning ? focusDurationSeconds : state.secondsLeft,
      };
    }),
  setBreakDurationMinutes: (minutes) =>
    set((state) => {
      const breakDurationSeconds = Math.round(minutes * 60);
      return {
        breakDurationSeconds,
        secondsLeft:
          state.mode === 'break' && !state.isRunning ? breakDurationSeconds : state.secondsLeft,
      };
    }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  reset: () =>
    set((state) => ({
      mode: 'focus',
      secondsLeft: state.focusDurationSeconds,
      isRunning: false,
    })),
}));
