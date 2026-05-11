import { ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/common/Card';
import { TaskInput } from '@/components/Task/TaskInput';
import { TaskList } from '@/components/Task/TaskList';
import { useColors } from '@/hooks/use-colors';
import { useTasks } from '@/hooks/useTasks';

export default function TasksScreen() {
  const colors = useColors();
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();

  return (
    <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
      <TaskInput onSubmit={addTask} />
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Task queue</Text>
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <TaskList
          tasks={tasks}
          loading={loading}
          emptyText="Add a task to fuel your next focus session."
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
    padding: 20,
    paddingTop: 64,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
  },
  card: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    fontWeight: '700',
  },
});
