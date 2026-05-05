import { ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/common/Card';
import { TaskInput } from '@/components/Task/TaskInput';
import { TaskList } from '@/components/Task/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { COLORS } from '@/utils/constants';

export default function TasksScreen() {
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Tasks</Text>
      <TaskInput onSubmit={addTask} />
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>All tasks</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TaskList
          tasks={tasks}
          loading={loading}
          emptyText="Add a task to attach it to focus sessions."
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
    gap: 18,
    padding: 20,
    paddingTop: 64,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
  },
  card: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    color: COLORS.danger,
  },
});
