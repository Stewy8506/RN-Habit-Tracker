import { createSession, incrementTaskPomodoro } from '@/services/firestoreService';
import { FocusMode } from '@/types/session';

export function getModeDuration(
  mode: FocusMode,
  focusDurationSeconds: number,
  breakDurationSeconds: number,
) {
  return mode === 'focus' ? focusDurationSeconds : breakDurationSeconds;
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
