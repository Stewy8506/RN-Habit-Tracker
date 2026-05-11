import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Habit } from '@/types/habit';
import { isSameLocalDay } from '@/utils/time';

type HabitItemProps = {
  habit: Habit;
  onComplete: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
};

export function HabitItem({ habit, onComplete, onDelete }: HabitItemProps) {
  const colors = useColors();
  const completedToday = habit.lastCompleted
    ? isSameLocalDay(habit.lastCompleted.toDate(), new Date())
    : false;

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completedToday }}
        disabled={completedToday}
        onPress={() => onComplete(habit)}
        style={[
          styles.check,
          { borderColor: colors.border },
          completedToday && { backgroundColor: colors.success, borderColor: colors.success },
        ]}>
        <Text style={styles.checkLabel}>{completedToday ? '✓' : ''}</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>{habit.name}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{habit.streak} day streak</Text>
      </View>
      {onDelete ? (
        <Pressable onPress={() => onDelete(habit.id)} hitSlop={12}>
          <Text style={[styles.delete, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  check: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
  },
  delete: {
    fontWeight: '700',
  },
});
