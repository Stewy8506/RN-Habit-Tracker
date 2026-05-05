import { Timestamp } from 'firebase/firestore';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
  pomodoroCount: number;
  deadline: Timestamp | null;
};

export type CreateTaskInput = {
  title: string;
  deadline?: Date | null;
};
