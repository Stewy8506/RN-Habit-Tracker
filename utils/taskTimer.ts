import { Task } from '@/types/task';

export function getNextTaskFocusSeconds(task: Task, focusDurationSeconds: number) {
  if (!task.durationMinutes) {
    return focusDurationSeconds;
  }

  const totalSeconds = task.durationMinutes * 60;
  const spentSeconds = task.timeSpentSeconds ?? 0;
  const remainingSeconds = Math.max(totalSeconds - spentSeconds, 0);

  return Math.min(remainingSeconds || totalSeconds, focusDurationSeconds);
}
