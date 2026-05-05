import { useEffect } from 'react';

import { completeHabit, createHabit, deleteHabit, listenToHabits } from '@/services/firestoreService';
import { useHabitStore } from '@/store/useHabitStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Habit } from '@/types/habit';

export function useHabits() {
  const userId = useSettingsStore((state) => state.userId);
  const habits = useHabitStore((state) => state.habits);
  const loading = useHabitStore((state) => state.loading);
  const error = useHabitStore((state) => state.error);
  const setHabits = useHabitStore((state) => state.setHabits);
  const setLoading = useHabitStore((state) => state.setLoading);
  const setError = useHabitStore((state) => state.setError);

  useEffect(() => {
    if (!userId) {
      return;
    }

    setLoading(true);
    return listenToHabits(userId, setHabits, (nextError) => setError(nextError.message));
  }, [setError, setHabits, setLoading, userId]);

  return {
    habits,
    loading,
    error,
    addHabit: (name: string) => (userId ? createHabit(userId, name) : Promise.resolve()),
    completeHabit: (habit: Habit) => (userId ? completeHabit(userId, habit) : Promise.resolve()),
    deleteHabit: (habitId: string) => (userId ? deleteHabit(userId, habitId) : Promise.resolve()),
  };
}
