import { useEffect } from 'react';

import { createTask, deleteTask, listenToTasks, toggleTask } from '@/services/firestoreService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Task } from '@/types/task';

export function useTasks() {
  const userId = useSettingsStore((state) => state.userId);
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const setTasks = useTaskStore((state) => state.setTasks);
  const setLoading = useTaskStore((state) => state.setLoading);
  const setError = useTaskStore((state) => state.setError);

  useEffect(() => {
    if (!userId) {
      return;
    }

    setLoading(true);
    return listenToTasks(userId, setTasks, (nextError) => setError(nextError.message));
  }, [setError, setLoading, setTasks, userId]);

  return {
    tasks,
    loading,
    error,
    addTask: (title: string) => (userId ? createTask(userId, { title }) : Promise.resolve()),
    toggleTask: (task: Task) => (userId ? toggleTask(userId, task) : Promise.resolve()),
    deleteTask: (taskId: string) => (userId ? deleteTask(userId, taskId) : Promise.resolve()),
  };
}
