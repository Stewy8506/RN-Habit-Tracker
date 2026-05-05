import { createSession, incrementTaskPomodoro } from '@/services/firestoreService';
import { FocusMode } from '@/types/session';
import { BREAK_DURATION_SECONDS, FOCUS_DURATION_SECONDS } from '@/utils/constants';

export function getModeDuration(mode: FocusMode) {
  return mode === 'focus' ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS;
}

export async function saveCompletedFocusSession(userId: string, taskId: string | null) {
  await createSession(userId, {
    taskId,
    duration: FOCUS_DURATION_SECONDS,
    completed: true,
  });

  if (taskId) {
    await incrementTaskPomodoro(userId, taskId);
  }
}
