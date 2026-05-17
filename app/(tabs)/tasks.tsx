import { ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/common/Card';
import { TaskInput } from '@/components/Task/TaskInput';
import { TaskList } from '@/components/Task/TaskList';
import { useColors } from '@/hooks/use-colors';
import { useTasks } from '@/hooks/useTasks';
import { useTimerStore } from '@/store/useTimerStore';
import { getNextTaskFocusSeconds } from '@/utils/taskTimer';
import { useRouter } from 'expo-router';

export default function TasksScreen() {
  const colors = useColors();
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();
  const router = useRouter();
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const setSelectedTimerType = useTimerStore((state) => state.setSelectedTimerType);
  const setSelectedTimerName = useTimerStore((state) => state.setSelectedTimerName);
  const setMode = useTimerStore((state) => state.setMode);
  const requestAutoStart = useTimerStore((state) => state.requestAutoStart);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const timerDuration = getNextTaskFocusSeconds(task, focusDurationSeconds);

    setSelectedTaskId(taskId);
    setSelectedTimerType('regular');
    setSelectedTimerName(task.title);
    setMode('focus', timerDuration);
    requestAutoStart();

    router.push('/focus');
  };

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
          onSelect={handleTaskSelect}
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
