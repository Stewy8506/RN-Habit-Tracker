import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';

import { disableDnd, enableDnd, scheduleAlarm, cancelAlarm } from '@/services/dndService';
import { completeHabit as completeHabitDoc, completeTask, updateTaskTimeSpent } from '@/services/firestoreService';
import { saveCompletedFocusSession } from '@/services/timerService';
import { useHabitStore } from '@/store/useHabitStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { FocusMode } from '@/types/session';

const ONGOING_NOTIFICATION_ID = 'ongoing-timer-notification';

const scheduleTimerNotification = async (secondsLeft: number, timerName: string | null) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (secondsLeft <= 0) return;

  scheduleAlarm(secondsLeft);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Session Completed! 🎉',
      body: timerName ? `Your session "${timerName}" is done.` : 'Your focus session is finished. Time for a break!',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsLeft,
      channelId: 'alarm-channel',
    },
  });
};

const showOngoingTimerNotification = async (secondsLeft: number, timerName: string | null) => {
  if (secondsLeft <= 0) return;

  const endTimestamp = Date.now() + secondsLeft * 1000;
  const endTimeStr = new Date(endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  await Notifications.scheduleNotificationAsync({
    identifier: ONGOING_NOTIFICATION_ID,
    content: {
      title: 'Focus Session in Progress ⏱️',
      body: `"${timerName ?? 'Focus'}" is running • Ends at ${endTimeStr}`,
      sticky: true,
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
    trigger: null,
  });
};

const dismissOngoingTimerNotification = async () => {
  await Notifications.dismissNotificationAsync(ONGOING_NOTIFICATION_ID);
};

const cancelTimerNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissNotificationAsync(ONGOING_NOTIFICATION_ID);
  cancelAlarm();
};

export function useTimer(onTaskCompleted?: () => void) {
  const onTaskCompletedRef = useRef(onTaskCompleted);
  useEffect(() => {
    onTaskCompletedRef.current = onTaskCompleted;
  }, [onTaskCompleted]);
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  const userId = useSettingsStore((state) => state.userId);
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval);
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
  const completedTimerName = useTimerStore((state) => state.completedTimerName);
  const setMode = useTimerStore((state) => state.setMode);
  const setSecondsLeft = useTimerStore((state) => state.setSecondsLeft);
  const setIsRunning = useTimerStore((state) => state.setIsRunning);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const setSelectedTimerTargetType = useTimerStore((state) => state.setSelectedTimerTargetType);
  const setSelectedTimerType = useTimerStore((state) => state.setSelectedTimerType);
  const setSelectedTimerName = useTimerStore((state) => state.setSelectedTimerName);
  const setCompletedTimerName = useTimerStore((state) => state.setCompletedTimerName);
  const incrementCompletedPomodoros = useTimerStore((state) => state.incrementCompletedPomodoros);
  const requestAutoStart = useTimerStore((state) => state.requestAutoStart);
  const consumeAutoStart = useTimerStore((state) => state.consumeAutoStart);
  const resetStore = useTimerStore((state) => state.reset);

  const completeInterval = useCallback(async () => {
    void cancelTimerNotifications();
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

    const finishTimer = () => {
      setCompletedTimerName(selectedTimerName ?? 'Focus session');
      setTimeout(() => {
        onTaskCompletedRef.current?.();
      }, 0);
    };

    const completedMode = mode;
    let nextMode: FocusMode;
    let nextDuration: number;

    setIsRunning(false);

    if (completedMode === 'focus') {
      const matchingTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
      const matchingHabit = selectedTaskId ? habits.find(h => h.id === selectedTaskId) : null;
      const task =
        selectedTimerTargetType === 'habit'
          ? null
          : matchingTask;
      const habit =
        selectedTimerTargetType === 'task'
          ? null
          : matchingHabit;
      const completedFocusSeconds = currentDurationSeconds;

      if (selectedTaskId && habit) {
        await runSafely('DND disable', disableDnd);
        finishTimer();
        clearSelection();
        setMode('focus', focusDurationSeconds);
        if (userId) {
          await runSafely('session save', () =>
            saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, false),
          );
        }
        if (userId) {
          await runSafely('habit completion update', () => completeHabitDoc(userId, habit));
        }
        return;
      }

      // Handle task completion
      if (selectedTaskId && task) {
        if (task.durationMinutes) {
          const durationSeconds = task.durationMinutes * 60;
          const timeSpent = (task.timeSpentSeconds || 0) + completedFocusSeconds;

          if (timeSpent >= durationSeconds) {
            await runSafely('DND disable', disableDnd);
            finishTimer();
            clearSelection();
            setMode('focus', focusDurationSeconds);
            if (userId) {
              await runSafely('session save', () =>
                saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, true),
              );
              await runSafely('task progress update', () =>
                updateTaskTimeSpent(userId, selectedTaskId, timeSpent),
              );
            }
            // Task completed
            if (userId) {
              await runSafely('task completion update', () => completeTask(userId, selectedTaskId));
            }
            return;
          } else {
            await runSafely('DND disable', disableDnd);
            if (userId) {
              await runSafely('session save', () =>
                saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, true),
              );
              await runSafely('task progress update', () =>
                updateTaskTimeSpent(userId, selectedTaskId, timeSpent),
              );
            }

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

      if (selectedTaskId && task) {
        await runSafely('DND disable', disableDnd);
        finishTimer();
        clearSelection();
        setMode('focus', focusDurationSeconds);
        if (userId) {
          await runSafely('session save', () =>
            saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, true),
          );
        }
        return;
      }

      if (selectedTimerType === 'regular') {
        // Regular mode ends after one deep focus block and does not auto-enter a break.
        await runSafely('DND disable', disableDnd);
        finishTimer();
        clearSelection();
        setMode('focus', focusDurationSeconds);
        if (userId) {
          await runSafely('session save', () =>
            saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, false),
          );
        }
        return;
      }

      await runSafely('DND disable', disableDnd);
      if (userId) {
        await runSafely('session save', () =>
          saveCompletedFocusSession(userId, selectedTaskId, completedFocusSeconds, Boolean(task)),
        );
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
    setCompletedTimerName,
    shortBreakDurationSeconds,
    userId,
    incrementCompletedPomodoros,
    tasks,
    selectedTimerName,
  ]);

  const completeIntervalRef = useRef(completeInterval);
  useEffect(() => {
    completeIntervalRef.current = completeInterval;
  }, [completeInterval]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isTimerRunning = useTimerStore.getState().isRunning;

      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        void dismissOngoingTimerNotification();
        if (isTimerRunning && backgroundTimeRef.current !== null) {
          const elapsedSeconds = Math.round((Date.now() - backgroundTimeRef.current) / 1000);
          const currentSeconds = useTimerStore.getState().secondsLeft;
          const remaining = Math.max(0, currentSeconds - elapsedSeconds);

          if (remaining <= 0) {
            useTimerStore.getState().setSecondsLeft(0);
            void completeIntervalRef.current().catch((error) => {
              console.warn('Timer completion in background failed', error);
              useTimerStore.getState().setIsRunning(false);
            });
          } else {
            useTimerStore.getState().setSecondsLeft(remaining);
          }
        }
        backgroundTimeRef.current = null;
      } else if (nextAppState.match(/inactive|background/)) {
        if (isTimerRunning) {
          backgroundTimeRef.current = Date.now();
          const currentSeconds = useTimerStore.getState().secondsLeft;
          const currentName = useTimerStore.getState().selectedTimerName;
          void showOngoingTimerNotification(currentSeconds, currentName);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

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
        void completeIntervalRef.current().catch((error) => {
          console.warn('Timer completion failed', error);
          useTimerStore.getState().setIsRunning(false);
        });
        return;
      }

      useTimerStore.getState().setSecondsLeft(currentSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const start = async () => {
    if (mode === 'focus') {
      await enableDnd();
    }
    const currentSeconds = useTimerStore.getState().secondsLeft;
    const currentName = useTimerStore.getState().selectedTimerName;
    void scheduleTimerNotification(currentSeconds, currentName);
    setIsRunning(true);
  };

  const pause = async () => {
    setIsRunning(false);
    await disableDnd();
    void cancelTimerNotifications();
  };

  const reset = async () => {
    setIsRunning(false);
    resetStore();
    await disableDnd();
    void cancelTimerNotifications();
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

    if (running) {
      const nextName = useTimerStore.getState().selectedTimerName;
      void scheduleTimerNotification(nextDuration, nextName);
    } else {
      void cancelTimerNotifications();
    }
  };

  const stop = () => {
    setIsRunning(false);
    void cancelTimerNotifications();
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
    completedTimerName,
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
