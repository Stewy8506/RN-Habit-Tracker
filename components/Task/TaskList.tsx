import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TaskItem } from '@/components/Task/TaskItem';
import { Task } from '@/types/task';
import { COLORS } from '@/utils/constants';

type TaskListProps = {
  tasks: Task[];
  loading?: boolean;
  emptyText?: string;
  selectedTaskId?: string | null;
  onToggle: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onSelect?: (taskId: string) => void;
};

export function TaskList({
  tasks,
  loading,
  emptyText = 'No tasks yet.',
  selectedTaskId,
  onToggle,
  onDelete,
  onSelect,
}: TaskListProps) {
  if (loading) {
    return <ActivityIndicator color={COLORS.primary} />;
  }

  if (!tasks.length) {
    return <Text style={styles.empty}>{emptyText}</Text>;
  }

  return (
    <View style={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          selected={task.id === selectedTaskId}
          onToggle={onToggle}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  empty: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
