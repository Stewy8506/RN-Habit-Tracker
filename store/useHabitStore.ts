import { create } from 'zustand';

import { Habit } from '@/types/habit';

type HabitState = {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  setHabits: (habits: Habit[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  loading: true,
  error: null,
  setHabits: (habits) => set({ habits, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
