import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Habit } from '@/types/habit';
import { COLORS } from '@/utils/constants';
import { isSameLocalDay } from '@/utils/time';

type HabitItemProps = {
  habit: Habit;
  onComplete: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
};

export function HabitItem({ habit, onComplete, onDelete }: HabitItemProps) {
  const completedToday = habit.lastCompleted
    ? isSameLocalDay(habit.lastCompleted.toDate(), new Date())
    : false;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completedToday }}
        disabled={completedToday}
        onPress={() => onComplete(habit)}
        style={[styles.check, completedToday && styles.checked]}>
        <Text style={styles.checkLabel}>{completedToday ? '✓' : ''}</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.name}>{habit.name}</Text>
        <Text style={styles.meta}>{habit.streak} day streak</Text>
      </View>
      {onDelete ? (
        <Pressable onPress={() => onDelete(habit.id)} hitSlop={12}>
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  check: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 13,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: COLORS.muted,
    fontSize: 13,
  },
  delete: {
    color: COLORS.danger,
    fontWeight: '700',
  },
});
