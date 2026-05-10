import { createSession, incrementTaskPomodoro } from '@/services/firestoreService';
import { FocusMode } from '@/types/session';

export function getModeDuration(
  mode: FocusMode,
  focusDurationSeconds: number,
  shortBreakDurationSeconds: number,
  longBreakDurationSeconds: number,
) {
  switch (mode) {
    case 'focus':
      return focusDurationSeconds;
    case 'shortBreak':
      return shortBreakDurationSeconds;
    case 'longBreak':
      return longBreakDurationSeconds;
  }
}

export async function saveCompletedFocusSession(
  userId: string,
  taskId: string | null,
  duration: number,
) {
  await createSession(userId, {
    taskId,
    duration,
    completed: true,
  });

  if (taskId) {
    await incrementTaskPomodoro(userId, taskId);
  }
}
