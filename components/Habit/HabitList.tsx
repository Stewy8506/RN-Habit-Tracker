import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { HabitItem } from '@/components/Habit/HabitItem';
import { useColors } from '@/hooks/use-colors';
import { Habit } from '@/types/habit';

type HabitListProps = {
  habits: Habit[];
  loading?: boolean;
  emptyText?: string;
  onComplete: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
};

export function HabitList({
  habits,
  loading,
  emptyText = 'No habits yet.',
  onComplete,
  onDelete,
}: HabitListProps) {
  const colors = useColors();

  if (loading) {
    return <ActivityIndicator color={colors.primary} />;
  }

  if (!habits.length) {
    return <Text style={[styles.empty, { color: colors.muted }]}>{emptyText}</Text>;
  }

  return (
    <View style={styles.list}>
      {habits.map((habit) => (
        <HabitItem key={habit.id} habit={habit} onComplete={onComplete} onDelete={onDelete} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
  },
});
