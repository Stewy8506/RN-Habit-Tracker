import { useCallback, useEffect } from 'react';

import { disableDnd, enableDnd } from '@/services/dndService';
import { completeTask, updateTaskTimeSpent } from '@/services/firestoreService';
import { saveCompletedFocusSession } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { FocusMode } from '@/types/session';
export function useTimer(onTaskCompleted?: () => void) {
  const userId = useSettingsStore((state) => state.userId);
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval);
  const tasks = useTaskStore((state) => state.tasks);
  const mode = useTimerStore((state) => state.mode);
  const secondsLeft = useTimerStore((state) => state.secondsLeft);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const shortBreakDurationSeconds = useTimerStore((state) => state.shortBreakDurationSeconds);
  const longBreakDurationSeconds = useTimerStore((state) => state.longBreakDurationSeconds);
  const completedPomodoros = useTimerStore((state) => state.completedPomodoros);
  const isRunning = useTimerStore((state) => state.isRunning);
  const selectedTaskId = useTimerStore((state) => state.selectedTaskId);
  const selectedTimerType = useTimerStore((state) => state.selectedTimerType);
  const selectedTimerName = useTimerStore((state) => state.selectedTimerName);
  const setMode = useTimerStore((state) => state.setMode);
  const setSecondsLeft = useTimerStore((state) => state.setSecondsLeft);
  const setIsRunning = useTimerStore((state) => state.setIsRunning);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const setSelectedTimerType = useTimerStore((state) => state.setSelectedTimerType);
  const setSelectedTimerName = useTimerStore((state) => state.setSelectedTimerName);
  const incrementCompletedPomodoros = useTimerStore((state) => state.incrementCompletedPomodoros);
  const resetStore = useTimerStore((state) => state.reset);

  const completeInterval = useCallback(async () => {
    const completedMode = mode;
    let nextMode: FocusMode;
    let nextDuration: number;

    if (completedMode === 'focus') {
      // After focus, save deep-work session first.
      await disableDnd();
      if (userId) {
        await saveCompletedFocusSession(userId, selectedTaskId, focusDurationSeconds);
      }

      // Handle task completion
      if (selectedTaskId) {
        const task = tasks.find(t => t.id === selectedTaskId);
        if (task && task.durationMinutes) {
          const durationSeconds = task.durationMinutes * 60;
          const timeSpent = (task.timeSpentSeconds || 0) + focusDurationSeconds;
          if (userId) {
            await updateTaskTimeSpent(userId, selectedTaskId, timeSpent);
          }
          if (timeSpent >= durationSeconds) {
            // Task completed
            if (userId) {
              await completeTask(userId, selectedTaskId);
            }
            setSelectedTaskId(null);
            setSelectedTimerType(null);
            setSelectedTimerName(null);
            setIsRunning(false);
            setMode('focus', focusDurationSeconds);
            onTaskCompleted?.();
            return;
          } else {
            // Start another session for remaining time
            const remaining = durationSeconds - timeSpent;
            nextDuration = Math.min(remaining, focusDurationSeconds);
            nextMode = 'focus';
            setIsRunning(false);
            setMode(nextMode, nextDuration);
            setTimeout(() => {
              void enableDnd();
              setIsRunning(true);
            }, 1000);
            return;
          }
        }
      }

      if (selectedTimerType === 'regular') {
        // Regular mode ends after one deep focus block and does not auto-enter a break.
        setIsRunning(false);
        setMode('focus', focusDurationSeconds);
        return;
      }

      // After focus, determine break type based on long break interval for pomodoro.
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

    // Set the next mode and start automatically
    setMode(nextMode, nextDuration);
    
    // Auto-start the next timer after a quick transition delay
    setTimeout(() => {
      if (nextMode === 'focus') {
        void enableDnd();
      }
      setIsRunning(true);
    }, 1000);
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
    tasks,
    onTaskCompleted,
  ]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      if (!useTimerStore.getState().isRunning) {
        return;
      }
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
    setIsRunning(false);
    resetStore();
    await disableDnd();
  };

  const skip = async () => {
    const currentMode = useTimerStore.getState().mode;
    const currentTimerType = useTimerStore.getState().selectedTimerType;
    let nextMode: FocusMode;
    let nextDuration: number;
    const running = useTimerStore.getState().isRunning;

    if (currentMode === 'focus') {
      if (currentTimerType === 'regular') {
        nextMode = 'focus';
        nextDuration = focusDurationSeconds;
      } else {
        // After focus, determine break type based on long break interval
        const nextPomodoroCount = useTimerStore.getState().completedPomodoros + 1;
        nextMode = nextPomodoroCount % longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
        nextDuration = nextMode === 'longBreak' ? longBreakDurationSeconds : shortBreakDurationSeconds;
        useTimerStore.getState().incrementCompletedPomodoros();
      }
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

  const stop = () => {
    setIsRunning(false);
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
    selectedTimerType,
    selectedTimerName,
    setSelectedTaskId,
    setSelectedTimerType,
    setSelectedTimerName,
    start,
    pause,
    reset,
    stop,
    skip,
  };
}
