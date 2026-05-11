import { Timestamp } from 'firebase/firestore';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskTimerType = 'pomodoro' | 'regular';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
  pomodoroCount: number;
  deadline: Timestamp | null;
  durationMinutes?: number | null;
  icon?: string | null;
  priority?: TaskPriority | null;
  timerType?: TaskTimerType | null;
};

export type CreateTaskInput = {
  title: string;
  deadline?: Date | null;
  durationMinutes?: number | null;
  icon?: string | null;
  priority?: TaskPriority | null;
  timerType?: TaskTimerType | null;
};
