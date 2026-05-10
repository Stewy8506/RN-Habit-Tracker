import { useCallback, useEffect } from 'react';

import { disableDnd, enableDnd } from '@/services/dndService';
import { saveCompletedFocusSession } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { FocusMode } from '@/types/session';
export function useTimer() {
  const userId = useSettingsStore((state) => state.userId);
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval);
  const mode = useTimerStore((state) => state.mode);
  const secondsLeft = useTimerStore((state) => state.secondsLeft);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const shortBreakDurationSeconds = useTimerStore((state) => state.shortBreakDurationSeconds);
  const longBreakDurationSeconds = useTimerStore((state) => state.longBreakDurationSeconds);
  const completedPomodoros = useTimerStore((state) => state.completedPomodoros);
  const isRunning = useTimerStore((state) => state.isRunning);
  const selectedTaskId = useTimerStore((state) => state.selectedTaskId);
  const setMode = useTimerStore((state) => state.setMode);
  const setSecondsLeft = useTimerStore((state) => state.setSecondsLeft);
  const setIsRunning = useTimerStore((state) => state.setIsRunning);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const incrementCompletedPomodoros = useTimerStore((state) => state.incrementCompletedPomodoros);
  const resetStore = useTimerStore((state) => state.reset);

  const completeInterval = useCallback(async () => {
    const completedMode = mode;
    let nextMode: FocusMode;
    let nextDuration: number;

    if (completedMode === 'focus') {
      // After focus, determine break type based on long break interval
      const nextPomodoroCount = completedPomodoros + 1;
      nextMode = nextPomodoroCount % longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      nextDuration = nextMode === 'longBreak' ? longBreakDurationSeconds : shortBreakDurationSeconds;
      incrementCompletedPomodoros();
    } else {
      // After any break, go back to focus
      nextMode = 'focus';
      nextDuration = focusDurationSeconds;
    }

    setIsRunning(false);

    if (completedMode === 'focus') {
      await disableDnd();
      if (userId) {
        await saveCompletedFocusSession(userId, selectedTaskId, focusDurationSeconds);
      }
    }

    // Set the next mode and start automatically
    setMode(nextMode, nextDuration);
    
    // Auto-start the next timer
    setTimeout(() => {
      if (nextMode === 'focus') {
        void enableDnd();
      }
      setIsRunning(true);
    }, 1000); // Small delay for UI feedback
  }, [
    completedPomodoros,
    focusDurationSeconds,
    longBreakDurationSeconds,
    longBreakInterval,
    mode,
    selectedTaskId,
    setIsRunning,
    setMode,
    shortBreakDurationSeconds,
    userId,
    incrementCompletedPomodoros,
  ]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      const currentSeconds = useTimerStore.getState().secondsLeft;
      if (currentSeconds <= 1) {
        clearInterval(intervalId);
        void completeInterval();
        return;
      }

      useTimerStore.getState().setSecondsLeft(currentSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [completeInterval, isRunning]);

  const start = async () => {
    if (mode === 'focus') {
      await enableDnd();
    }
    setIsRunning(true);
  };

  const pause = async () => {
    setIsRunning(false);
    await disableDnd();
  };

  const reset = async () => {
    resetStore();
    await disableDnd();
  };

  const skip = async () => {
    const currentMode = useTimerStore.getState().mode;
    let nextMode: FocusMode;
    let nextDuration: number;
    const running = useTimerStore.getState().isRunning;

    if (currentMode === 'focus') {
      // After focus, determine break type based on long break interval
      const nextPomodoroCount = useTimerStore.getState().completedPomodoros + 1;
      nextMode = nextPomodoroCount % longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      nextDuration = nextMode === 'longBreak' ? longBreakDurationSeconds : shortBreakDurationSeconds;
      useTimerStore.getState().incrementCompletedPomodoros();
    } else {
      // After any break, go back to focus
      nextMode = 'focus';
      nextDuration = focusDurationSeconds;
    }

    // Leaving focus → always disable DND
    if (currentMode === 'focus') {
      await disableDnd();
    }

    // Entering focus while running → re-enable DND
    if (nextMode === 'focus' && running) {
      await enableDnd();
    }

    useTimerStore.getState().setMode(nextMode, nextDuration);
  };

  return {
    mode,
    secondsLeft,
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
    completedPomodoros,
    isRunning,
    selectedTaskId,
    setSelectedTaskId,
    start,
    pause,
    reset,
    skip,
  };
}
