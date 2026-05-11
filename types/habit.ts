import { Timestamp } from 'firebase/firestore';

export type HabitPriority = 'low' | 'medium' | 'high';

export type HabitTimerType = 'pomodoro' | 'regular';

export type Habit = {
  id: string;
  name: string;
  streak: number;
  lastCompleted: Timestamp | null;
  icon?: string | null;
  priority?: HabitPriority | null;
  category?: string | null;
  durationMinutes?: number | null;
  timerType?: HabitTimerType | null;
};

export type CreateHabitInput = {
  name: string;
  icon?: string | null;
  priority?: HabitPriority | null;
  category?: string | null;
  durationMinutes?: number | null;
  timerType?: HabitTimerType | null;
};
