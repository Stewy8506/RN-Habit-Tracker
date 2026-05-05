import { Timestamp } from 'firebase/firestore';

export type Habit = {
  id: string;
  name: string;
  streak: number;
  lastCompleted: Timestamp | null;
};
