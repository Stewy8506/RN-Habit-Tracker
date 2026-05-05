import { create } from 'zustand';

import { FocusMode } from '@/types/session';
import { FOCUS_DURATION_SECONDS } from '@/utils/constants';

type TimerState = {
  mode: FocusMode;
  secondsLeft: number;
  isRunning: boolean;
  selectedTaskId: string | null;
  setMode: (mode: FocusMode, secondsLeft: number) => void;
  setSecondsLeft: (secondsLeft: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  reset: () => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  mode: 'focus',
  secondsLeft: FOCUS_DURATION_SECONDS,
  isRunning: false,
  selectedTaskId: null,
  setMode: (mode, secondsLeft) => set({ mode, secondsLeft }),
  setSecondsLeft: (secondsLeft) => set({ secondsLeft }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  reset: () => set({ mode: 'focus', secondsLeft: FOCUS_DURATION_SECONDS, isRunning: false }),
}));
