import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { HabitList } from '@/components/Habit/HabitList';
import { TaskList } from '@/components/Task/TaskList';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { COLORS } from '@/utils/constants';

export default function HomeScreen() {
  const { tasks, loading: tasksLoading, toggleTask } = useTasks();
  const { habits, loading: habitsLoading, completeHabit } = useHabits();
  const authLoading = useSettingsStore((state) => state.authLoading);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const todaysTasks = tasks.filter((task) => !task.completed).slice(0, 4);

  const startFocus = () => {
    setSelectedTaskId(todaysTasks[0]?.id ?? null);
    router.push('/focus');
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{authLoading ? 'Connecting' : 'Ready'}</Text>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>Choose a task, start a focus session, and keep the day moving.</Text>
      </View>

      <Button disabled={authLoading} title="Start Focus" onPress={startFocus} />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s tasks</Text>
        <TaskList
          tasks={todaysTasks}
          loading={tasksLoading}
          emptyText="No active tasks. Add one in the Tasks tab."
          onToggle={toggleTask}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Habit checklist</Text>
        <HabitList
          habits={habits.slice(0, 4)}
          loading={habitsLoading}
          emptyText="No habits yet. Add one in the Habits tab."
          onComplete={completeHabit}
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
  header: {
    gap: 6,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
