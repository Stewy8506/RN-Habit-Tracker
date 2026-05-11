import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { HabitList } from '@/components/Habit/HabitList';
import { TaskList } from '@/components/Task/TaskList';
import { useColors } from '@/hooks/use-colors';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';

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

  const colors = useColors();

  return (
    <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{authLoading ? 'Connecting...' : 'Ready for focus'}</Text>
        <Text style={[styles.title, { color: colors.text }]}>Today</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Pick a task, start a focus session, and keep the day in flow.</Text>
      </View>

      <Button disabled={authLoading} title="Start focus" onPress={startFocus} />

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Next up</Text>
        <TaskList
          tasks={todaysTasks}
          loading={tasksLoading}
          emptyText="No active tasks yet. Add one in Tasks, then return to start a session."
          onToggle={toggleTask}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily habits</Text>
        <HabitList
          habits={habits.slice(0, 4)}
          loading={habitsLoading}
          emptyText="No habits yet. Add your first daily ritual in Habits."
          onComplete={completeHabit}
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
  header: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
});
