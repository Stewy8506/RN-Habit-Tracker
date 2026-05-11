import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Task } from '@/types/task';
import { pluralize } from '@/utils/helpers';

type TaskItemProps = {
  task: Task;
  selected?: boolean;
  onToggle: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onSelect?: (taskId: string) => void;
};

export function TaskItem({ task, selected, onToggle, onDelete, onSelect }: TaskItemProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={() => onSelect?.(task.id)}
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      accessibilityRole={onSelect ? 'button' : undefined}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        onPress={() => onToggle(task)}
        style={[
          styles.checkbox,
          { borderColor: colors.border },
          task.completed && { backgroundColor: colors.success, borderColor: colors.success },
        ]}>
        <Text style={styles.check}>{task.completed ? '✓' : ''}</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, task.completed && { color: colors.muted, textDecorationLine: 'line-through' }]}>
          {task.title}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {task.pomodoroCount} {pluralize(task.pomodoroCount, 'pomodoro')}
        </Text>
      </View>
      {onDelete ? (
        <Pressable onPress={() => onDelete(task.id)} hitSlop={12}>
          <Text style={[styles.delete, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      ) : null}
    </Pressable>
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
  checkbox: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 2,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  check: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
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
