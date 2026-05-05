import { useCallback, useEffect } from 'react';

import { disableDnd, enableDnd } from '@/services/dndService';
import { getModeDuration, saveCompletedFocusSession } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';

export function useTimer() {
  const userId = useSettingsStore((state) => state.userId);
  const mode = useTimerStore((state) => state.mode);
  const secondsLeft = useTimerStore((state) => state.secondsLeft);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const breakDurationSeconds = useTimerStore((state) => state.breakDurationSeconds);
  const isRunning = useTimerStore((state) => state.isRunning);
  const selectedTaskId = useTimerStore((state) => state.selectedTaskId);
  const setMode = useTimerStore((state) => state.setMode);
  const setSecondsLeft = useTimerStore((state) => state.setSecondsLeft);
  const setIsRunning = useTimerStore((state) => state.setIsRunning);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const resetStore = useTimerStore((state) => state.reset);

  const completeInterval = useCallback(async () => {
    const completedMode = mode;
    const nextMode = completedMode === 'focus' ? 'break' : 'focus';

    setIsRunning(false);

    if (completedMode === 'focus') {
      await disableDnd();
      if (userId) {
        await saveCompletedFocusSession(userId, selectedTaskId, focusDurationSeconds);
      }
    }

    setMode(nextMode, getModeDuration(nextMode, focusDurationSeconds, breakDurationSeconds));
  }, [
    breakDurationSeconds,
    focusDurationSeconds,
    mode,
    selectedTaskId,
    setIsRunning,
    setMode,
    userId,
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

  return {
    mode,
    secondsLeft,
    focusDurationSeconds,
    breakDurationSeconds,
    isRunning,
    selectedTaskId,
    setSelectedTaskId,
    start,
    pause,
    reset,
  };
}
