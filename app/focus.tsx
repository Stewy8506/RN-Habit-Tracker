import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { ProgressRing } from '@/components/Timer/ProgressRing';
import { TimerControls } from '@/components/Timer/TimerControls';
import { TimerDisplay } from '@/components/Timer/TimerDisplay';
import { TaskList } from '@/components/Task/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { useTimer } from '@/hooks/useTimer';
import { getModeDuration } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { COLORS } from '@/utils/constants';

export default function FocusScreen() {
  const { tasks, loading, toggleTask } = useTasks();
  const dndEnabled = useSettingsStore((state) => state.dndEnabled);
  const {
    mode,
    secondsLeft,
    focusDurationSeconds,
    breakDurationSeconds,
    isRunning,
    selectedTaskId,
    setSelectedTaskId,
    start,
    pause,
    reset,
  } = useTimer();
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const progress =
    1 - secondsLeft / getModeDuration(mode, focusDurationSeconds, breakDurationSeconds);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" color={COLORS.text} size={26} />
        </Pressable>
        <Text style={styles.topTitle}>Focus</Text>
        <View style={styles.iconSpacer} />
      </View>

      <Card style={styles.timerCard}>
        <TimerDisplay mode={mode} secondsLeft={secondsLeft} />
        <ProgressRing progress={progress} />
        <Text style={styles.taskName}>{selectedTask?.title ?? 'No task selected'}</Text>
        <Text style={[styles.dnd, dndEnabled && styles.dndOn]}>
          DND {dndEnabled ? 'enabled' : 'disabled'}
        </Text>
        <TimerControls isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />
      </Card>

      <Card style={styles.tasksCard}>
        <Text style={styles.sectionTitle}>Attach task</Text>
        <TaskList
          tasks={tasks.filter((task) => !task.completed)}
          loading={loading}
          emptyText="Create a task first, then attach it to this session."
          selectedTaskId={selectedTaskId}
          onToggle={toggleTask}
          onSelect={setSelectedTaskId}
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
    paddingTop: 54,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  topTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  iconSpacer: {
    width: 44,
  },
  timerCard: {
    gap: 22,
  },
  taskName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  dnd: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  dndOn: {
    color: COLORS.success,
  },
  tasksCard: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
