import { Timestamp } from 'firebase/firestore';

export type FocusMode = 'focus' | 'break';

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
