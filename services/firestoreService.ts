import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import { Habit } from '@/types/habit';
import { CreateSessionInput } from '@/types/session';
import { CreateTaskInput, Task } from '@/types/task';
import { compactTitle } from '@/utils/helpers';
import { isSameLocalDay, isYesterday } from '@/utils/time';

function userDoc(userId: string) {
  return doc(db, 'users', userId);
}

function tasksCollection(userId: string) {
  return collection(db, 'users', userId, 'tasks');
}

function habitsCollection(userId: string) {
  return collection(db, 'users', userId, 'habits');
}

function sessionsCollection(userId: string) {
  return collection(db, 'users', userId, 'sessions');
}

export async function upsertUser(userId: string) {
  await setDoc(userDoc(userId), { updatedAt: serverTimestamp() }, { merge: true });
}

export function listenToTasks(
  userId: string,
  onNext: (tasks: Task[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(tasksCollection(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      onNext(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Task));
    },
    onError,
  );
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const title = compactTitle(input.title);
  if (!title) {
    return;
  }

  await addDoc(tasksCollection(userId), {
    title,
    completed: false,
    createdAt: serverTimestamp(),
    pomodoroCount: 0,
    deadline: input.deadline ? Timestamp.fromDate(input.deadline) : null,
  });
}

export async function toggleTask(userId: string, task: Task) {
  await updateDoc(doc(tasksCollection(userId), task.id), {
    completed: !task.completed,
  });
}

export async function deleteTask(userId: string, taskId: string) {
  await deleteDoc(doc(tasksCollection(userId), taskId));
}

export async function incrementTaskPomodoro(userId: string, taskId: string) {
  await updateDoc(doc(tasksCollection(userId), taskId), {
    pomodoroCount: increment(1),
  });
}

export function listenToHabits(
  userId: string,
  onNext: (habits: Habit[]) => void,
  onError: (error: Error) => void,
) {
  const q = query(habitsCollection(userId), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      onNext(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Habit));
    },
    onError,
  );
}

export async function createHabit(userId: string, nameValue: string) {
  const name = compactTitle(nameValue);
  if (!name) {
    return;
  }

  await addDoc(habitsCollection(userId), {
    name,
    streak: 0,
    lastCompleted: null,
  });
}

export async function completeHabit(userId: string, habit: Habit) {
  const habitRef = doc(habitsCollection(userId), habit.id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(habitRef);
    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data() as Habit;
    const lastCompleted = data.lastCompleted?.toDate() ?? null;
    const now = new Date();

    if (lastCompleted && isSameLocalDay(lastCompleted, now)) {
      return;
    }

    const nextStreak = lastCompleted && isYesterday(lastCompleted, now) ? data.streak + 1 : 1;

    transaction.update(habitRef, {
      streak: nextStreak,
      lastCompleted: Timestamp.fromDate(now),
    });
  });
}

export async function deleteHabit(userId: string, habitId: string) {
  await deleteDoc(doc(habitsCollection(userId), habitId));
}

export async function createSession(userId: string, input: CreateSessionInput) {
  await addDoc(sessionsCollection(userId), {
    taskId: input.taskId,
    duration: input.duration,
    completed: input.completed,
    createdAt: serverTimestamp(),
  });
}
