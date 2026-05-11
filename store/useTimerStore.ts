import { create } from 'zustand';

import { FocusMode } from '@/types/session';
import { FOCUS_DURATION_SECONDS } from '@/utils/constants';

type TimerType = 'pomodoro' | 'regular';

type TimerState = {
  mode: FocusMode;
  secondsLeft: number;
  focusDurationSeconds: number;
  shortBreakDurationSeconds: number;
  longBreakDurationSeconds: number;
  completedPomodoros: number;
  isRunning: boolean;
  selectedTaskId: string | null;
  selectedTimerType: TimerType | null;
  selectedTimerName: string | null;
  setMode: (mode: FocusMode, secondsLeft: number) => void;
  setSecondsLeft: (secondsLeft: number) => void;
  setFocusDurationSeconds: (seconds: number) => void;
  setShortBreakDurationSeconds: (seconds: number) => void;
  setLongBreakDurationSeconds: (seconds: number) => void;
  setFocusDurationMinutes: (minutes: number) => void;
  setShortBreakDurationMinutes: (minutes: number) => void;
  setLongBreakDurationMinutes: (minutes: number) => void;
  incrementCompletedPomodoros: () => void;
  setIsRunning: (isRunning: boolean) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  setSelectedTimerType: (timerType: TimerType | null) => void;
  setSelectedTimerName: (timerName: string | null) => void;
  reset: () => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  mode: 'focus',
  secondsLeft: FOCUS_DURATION_SECONDS,
  focusDurationSeconds: FOCUS_DURATION_SECONDS,
  shortBreakDurationSeconds: 5 * 60,
  longBreakDurationSeconds: 15 * 60,
  completedPomodoros: 0,
  isRunning: false,
  selectedTaskId: null,
  selectedTimerType: null,
  selectedTimerName: null,
  setMode: (mode, secondsLeft) => set({ mode, secondsLeft }),
  setSecondsLeft: (secondsLeft) => set({ secondsLeft }),
  setFocusDurationSeconds: (focusDurationSeconds) =>
    set((state) => ({
      focusDurationSeconds,
      secondsLeft:
        state.mode === 'focus' && !state.isRunning ? focusDurationSeconds : state.secondsLeft,
    })),
  setShortBreakDurationSeconds: (shortBreakDurationSeconds) =>
    set((state) => ({
      shortBreakDurationSeconds,
      secondsLeft:
        state.mode === 'shortBreak' && !state.isRunning ? shortBreakDurationSeconds : state.secondsLeft,
    })),
  setLongBreakDurationSeconds: (longBreakDurationSeconds) =>
    set((state) => ({
      longBreakDurationSeconds,
      secondsLeft:
        state.mode === 'longBreak' && !state.isRunning ? longBreakDurationSeconds : state.secondsLeft,
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
  setShortBreakDurationMinutes: (minutes) =>
    set((state) => {
      const shortBreakDurationSeconds = Math.round(minutes * 60);
      return {
        shortBreakDurationSeconds,
        secondsLeft:
          state.mode === 'shortBreak' && !state.isRunning ? shortBreakDurationSeconds : state.secondsLeft,
      };
    }),
  setLongBreakDurationMinutes: (minutes) =>
    set((state) => {
      const longBreakDurationSeconds = Math.round(minutes * 60);
      return {
        longBreakDurationSeconds,
        secondsLeft:
          state.mode === 'longBreak' && !state.isRunning ? longBreakDurationSeconds : state.secondsLeft,
      };
    }),
  incrementCompletedPomodoros: () => set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),
  setIsRunning: (isRunning) => set({ isRunning }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  setSelectedTimerType: (selectedTimerType) => set({ selectedTimerType }),
  setSelectedTimerName: (selectedTimerName) => set({ selectedTimerName }),
  reset: () =>
    set((state) => ({
      mode: 'focus',
      secondsLeft: state.focusDurationSeconds,
      isRunning: false,
      completedPomodoros: 0,
    })),
}));
