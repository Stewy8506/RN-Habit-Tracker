import { create } from 'zustand';

import { Task } from '@/types/task';

type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: true,
  error: null,
  setTasks: (tasks) => set({ tasks, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
