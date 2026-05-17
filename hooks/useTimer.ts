import { useCallback, useEffect } from 'react';

import { triggerTimerAlarm } from '@/services/alarmService';
import { disableDnd, enableDnd } from '@/services/dndService';
import { completeHabit as completeHabitDoc, completeTask, updateTaskTimeSpent } from '@/services/firestoreService';
import { saveCompletedFocusSession } from '@/services/timerService';
import { useHabitStore } from '@/store/useHabitStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { FocusMode } from '@/types/session';
export function useTimer(onTaskCompleted?: () => void) {
  const userId = useSettingsStore((state) => state.userId);
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval);
  const triggerAlarmEnabled = useSettingsStore((state) => state.triggerAlarmEnabled);
  const tasks = useTaskStore((state) => state.tasks);
  const habits = useHabitStore((state) => state.habits);
  const mode = useTimerStore((state) => state.mode);
  const secondsLeft = useTimerStore((state) => state.secondsLeft);
  const currentDurationSeconds = useTimerStore((state) => state.currentDurationSeconds);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const shortBreakDurationSeconds = useTimerStore((state) => state.shortBreakDurationSeconds);
  const longBreakDurationSeconds = useTimerStore((state) => state.longBreakDurationSeconds);
  const completedPomodoros = useTimerStore((state) => state.completedPomodoros);
  const isRunning = useTimerStore((state) => state.isRunning);
  const autoStartRequested = useTimerStore((state) => state.autoStartRequested);
  const selectedTaskId = useTimerStore((state) => state.selectedTaskId);
  const selectedTimerTargetType = useTimerStore((state) => state.selectedTimerTargetType);
  const selectedTimerType = useTimerStore((state) => state.selectedTimerType);
  const selectedTimerName = useTimerStore((state) => state.selectedTimerName);
  const setMode = useTimerStore((state) => state.setMode);
  const setSecondsLeft = useTimerStore((state) => state.setSecondsLeft);
  const setIsRunning = useTimerStore((state) => state.setIsRunning);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const setSelectedTimerTargetType = useTimerStore((state) => state.setSelectedTimerTargetType);
  const setSelectedTimerType = useTimerStore((state) => state.setSelectedTimerType);
  const setSelectedTimerName = useTimerStore((state) => state.setSelectedTimerName);
  const incrementCompletedPomodoros = useTimerStore((state) => state.incrementCompletedPomodoros);
  const requestAutoStart = useTimerStore((state) => state.requestAutoStart);
  const consumeAutoStart = useTimerStore((state) => state.consumeAutoStart);
  const resetStore = useTimerStore((state) => state.reset);

  const completeInterval = useCallback(async () => {
    const runSafely = async (label: string, action: () => Promise<unknown>) => {
      try {
        await action();
      } catch (error) {
        console.warn(`Timer ${label} failed`, error);
      }
    };

    const clearSelection = () => {
      setSelectedTaskId(null);
      setSelectedTimerTargetType(null);
      setSelectedTimerType(null);
      setSelectedTimerName(null);
    };

    const finishTimer = async () => {
      if (triggerAlarmEnabled) {
        await runSafely('alarm trigger', triggerTimerAlarm);
      }
      onTaskCompleted?.();
    };

    const completedMode = mode;
    let nextMode: FocusMode;
    let nextDuration: number;

    setIsRunning(false);

    if (completedMode === 'focus') {
      const task =
        selectedTaskId && selectedTimerTargetType === 'task'
          ? tasks.find(t => t.id === selectedTaskId)
          : null;
      const habit =
        selectedTaskId && selectedTimerTargetType === 'habit'
          ? habits.find(h => h.id === selectedTaskId)
          : null;
      const completedFocusSeconds = currentDurationSeconds;

      // After focus, save deep-work session first.
      await runSafely('DND disable', disableDnd);
      if (userId) {
        await runSafely('session save', () =>
          saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, Boolean(task)),
        );
      }

      if (selectedTaskId && habit) {
        if (userId) {
          await runSafely('habit completion update', () => completeHabitDoc(userId, habit));
        }
        clearSelection();
        setMode('focus', focusDurationSeconds);
        await finishTimer();
        return;
      }

      // Handle task completion
      if (selectedTaskId && task) {
        if (task.durationMinutes) {
          const durationSeconds = task.durationMinutes * 60;
          const timeSpent = (task.timeSpentSeconds || 0) + completedFocusSeconds;
          if (userId) {
            await runSafely('task progress update', () =>
              updateTaskTimeSpent(userId, selectedTaskId, timeSpent),
            );
          }
          if (timeSpent >= durationSeconds) {
            // Task completed
            if (userId) {
              await runSafely('task completion update', () => completeTask(userId, selectedTaskId));
            }
            clearSelection();
            setMode('focus', focusDurationSeconds);
            await finishTimer();
            return;
          } else {
            // Start another session for remaining time
            const remaining = durationSeconds - timeSpent;
            nextDuration = Math.min(remaining, focusDurationSeconds);
            nextMode = 'focus';
            setMode(nextMode, nextDuration);
            setTimeout(() => {
              void (async () => {
                await runSafely('DND enable', enableDnd);
                setIsRunning(true);
              })();
            }, 1000);
            return;
          }
        }
      }

      if (selectedTimerType === 'regular') {
        // Regular mode ends after one deep focus block and does not auto-enter a break.
        clearSelection();
        setMode('focus', focusDurationSeconds);
        await finishTimer();
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

    // Set the next mode and start automatically
    setMode(nextMode, nextDuration);
    
    // Auto-start the next timer after a quick transition delay
    setTimeout(() => {
      void (async () => {
        if (nextMode === 'focus') {
          await runSafely('DND enable', enableDnd);
        }
        setIsRunning(true);
      })();
    }, 1000);
  }, [
    completedPomodoros,
    currentDurationSeconds,
    focusDurationSeconds,
    longBreakDurationSeconds,
    longBreakInterval,
    mode,
    habits,
    selectedTaskId,
    selectedTimerTargetType,
    selectedTimerType,
    setSelectedTaskId,
    setSelectedTimerTargetType,
    setIsRunning,
    setMode,
    setSelectedTimerName,
    setSelectedTimerType,
    shortBreakDurationSeconds,
    userId,
    incrementCompletedPomodoros,
    tasks,
    triggerAlarmEnabled,
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
        void completeInterval().catch((error) => {
          console.warn('Timer completion failed', error);
          useTimerStore.getState().setIsRunning(false);
        });
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
    currentDurationSeconds,
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
    completedPomodoros,
    isRunning,
    selectedTaskId,
    selectedTimerTargetType,
    selectedTimerType,
    selectedTimerName,
    autoStartRequested,
    setSelectedTaskId,
    setSelectedTimerTargetType,
    setSelectedTimerType,
    setSelectedTimerName,
    requestAutoStart,
    consumeAutoStart,
    start,
    pause,
    reset,
    stop,
    skip,
  };
}
