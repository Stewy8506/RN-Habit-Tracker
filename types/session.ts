import { Timestamp } from 'firebase/firestore';

export type FocusMode = 'focus' | 'shortBreak' | 'longBreak';

export type FocusSession = {
  id: string;
  taskId: string | null;
  duration: number;
  completed: boolean;
  createdAt: Timestamp;
};

export type CreateSessionInput = {
  taskId: string | null;
  duration: number;
  completed: boolean;
};
