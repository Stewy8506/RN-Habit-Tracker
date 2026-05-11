import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { Habit } from '@/types/habit';
import { Task } from '@/types/task';
import { isSameLocalDay } from '@/utils/time';
import { compactTitle } from '@/utils/helpers';

const BG = '#0A0A0A';
const CARD = '#141414';
const CARD2 = '#1C1C1C';
const TEXT = '#FFFFFF';
const MUTED = '#888888';
const LABEL = '#555555';
const ACCENT = '#4A8FD4';
const DOT_ON = '#4A8FD4';
const DOT_OFF = '#272727';
const BORDER = 'rgba(255,255,255,0.07)';

// ── Habit row with 7-dot streak strip ────────────────────────────────
function HabitRow({ habit, onComplete }: { habit: Habit; onComplete: (h: Habit) => void }) {
  const today = new Date();
  const doneToday = habit.lastCompleted
    ? isSameLocalDay(habit.lastCompleted.toDate(), today)
    : false;
  const filledDots = Math.min(habit.streak, 7);

  const icons: Array<keyof typeof Ionicons.glyphMap> = [
    'book-outline',
    'pencil-outline',
    'barbell-outline',
    'heart-outline',
    'musical-notes-outline',
    'camera-outline',
    'walk-outline',
  ];
  const iconIndex = habit.name.length % icons.length;

  return (
    <Pressable
      onPress={() => !doneToday && onComplete(habit)}
      style={[styles.habitRow, doneToday && styles.habitRowDone]}>
      <View style={[styles.habitIcon, doneToday && styles.habitIconDone]}>
        <Ionicons
          name={doneToday ? 'checkmark' : icons[iconIndex]}
          size={16}
          color={doneToday ? TEXT : MUTED}
        />
      </View>
      <Text style={[styles.habitName, doneToday && { color: MUTED }]}>{habit.name}</Text>
      <View style={styles.dots}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i < filledDots ? DOT_ON : DOT_OFF }]}
          />
        ))}
      </View>
    </Pressable>
  );
}

// ── Task row ──────────────────────────────────────────────────────────
function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (t: Task) => void;
}) {
  const estMins = task.pomodoroCount > 0 ? task.pomodoroCount * 25 : null;

  return (
    <View style={[styles.taskRow, task.completed && styles.taskRowDone]}>
      <Pressable onPress={() => onToggle(task)} style={styles.taskCheckWrap}>
        <View style={[styles.taskCheck, task.completed && styles.taskCheckDone]}>
          {task.completed && <Ionicons name="checkmark" size={12} color={TEXT} />}
        </View>
      </Pressable>
      <View style={styles.taskContent}>
        <Text
          style={[styles.taskTitle, task.completed && { color: MUTED, textDecorationLine: 'line-through' }]}
          numberOfLines={2}>
          {task.title}
        </Text>
        {estMins && (
          <View style={styles.taskMeta}>
            <Ionicons name="time-outline" size={11} color={MUTED} />
            <Text style={styles.taskMetaText}>{estMins} min</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { habits, loading: habLoading, completeHabit, addHabit } = useHabits();
  const { tasks, loading: taskLoading, addTask, toggleTask, deleteTask } = useTasks();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [habitInput, setHabitInput] = useState('');
  const [upcomingOpen, setUpcomingOpen] = useState(false);

  const today = new Date();
  const priorityTasks = tasks.filter((t) => !t.completed);
  const upcomingTasks = tasks.filter(
    (t) => !t.completed && t.deadline && t.deadline.toDate() > today,
  );

  const submitTask = async () => {
    const v = compactTitle(taskInput);
    if (!v) return;
    await addTask(v);
    setTaskInput('');
    setShowAddTask(false);
  };

  const submitHabit = async () => {
    const v = compactTitle(habitInput);
    if (!v) return;
    await addHabit(v);
    setHabitInput('');
    setShowAddHabit(false);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.screen, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="menu" size={22} color={TEXT} />
        </Pressable>
        <Text style={styles.appName}>MONOS</Text>
        <Pressable style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="settings-outline" size={20} color={TEXT} />
        </Pressable>
      </View>

      {/* ── CONSISTENCY ─────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CONSISTENCY</Text>
        <View style={styles.divider} />
      </View>

      {habLoading ? (
        <ActivityIndicator color={ACCENT} />
      ) : habits.length === 0 ? (
        <Text style={styles.emptyText}>No habits yet.</Text>
      ) : (
        habits.map((h) => <HabitRow key={h.id} habit={h} onComplete={completeHabit} />)
      )}

      {/* Add habit */}
      {showAddHabit ? (
        <View style={styles.inlineInput}>
          <TextInput
            autoFocus
            placeholder="New habit..."
            placeholderTextColor={MUTED}
            value={habitInput}
            onChangeText={setHabitInput}
            onSubmitEditing={submitHabit}
            style={styles.textInput}
          />
          <Pressable onPress={submitHabit} style={styles.inlineSubmit}>
            <Ionicons name="arrow-up-circle" size={24} color={ACCENT} />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addRow} onPress={() => setShowAddHabit(true)}>
          <Ionicons name="add" size={16} color={MUTED} />
          <Text style={styles.addLabel}>ADD HABIT</Text>
        </Pressable>
      )}

      <View style={{ height: 18 }} />

      {/* ── PRIORITY ────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PRIORITY</Text>
        <Text style={styles.remainingCount}>
          {priorityTasks.length} REMAINING
        </Text>
      </View>

      {taskLoading ? (
        <ActivityIndicator color={ACCENT} />
      ) : priorityTasks.length === 0 ? (
        <Text style={styles.emptyText}>All tasks done. 🎉</Text>
      ) : (
        priorityTasks.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)
      )}

      {/* Add task */}
      {showAddTask ? (
        <View style={styles.inlineInput}>
          <TextInput
            autoFocus
            placeholder="New task..."
            placeholderTextColor={MUTED}
            value={taskInput}
            onChangeText={setTaskInput}
            onSubmitEditing={submitTask}
            style={styles.textInput}
          />
          <Pressable onPress={submitTask} style={styles.inlineSubmit}>
            <Ionicons name="arrow-up-circle" size={24} color={ACCENT} />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addRow} onPress={() => setShowAddTask(true)}>
          <Ionicons name="add" size={16} color={MUTED} />
          <Text style={styles.addLabel}>ADD TASK</Text>
        </Pressable>
      )}

      <View style={{ height: 18 }} />

      {/* ── UPCOMING (collapsible) ───────────────── */}
      <Pressable style={styles.section} onPress={() => setUpcomingOpen((o) => !o)}>
        <Ionicons
          name={upcomingOpen ? 'chevron-down' : 'chevron-forward'}
          size={12}
          color={LABEL}
        />
        <Text style={styles.sectionLabel}>UPCOMING</Text>
      </Pressable>

      {upcomingOpen &&
        (upcomingTasks.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming deadlines.</Text>
        ) : (
          upcomingTasks.map((t) => (
            <View key={t.id} style={styles.upcomingRow}>
              <Text style={styles.upcomingTitle} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={styles.upcomingDate}>
                {t.deadline!.toDate().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ))
        ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  screen: { padding: 18, gap: 0 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appName: { color: TEXT, fontSize: 15, fontWeight: '800', letterSpacing: 3 },

  // Section label row
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionLabel: {
    color: LABEL,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  remainingCount: {
    marginLeft: 'auto',
    color: LABEL,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  divider: { flex: 1, height: 1, backgroundColor: BORDER },

  // Habit row
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
    paddingHorizontal: 2,
  },
  habitRowDone: { opacity: 0.55 },
  habitIcon: {
    width: 34,
    height: 34,
    backgroundColor: CARD2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIconDone: { backgroundColor: ACCENT },
  habitName: { color: TEXT, fontSize: 15, fontWeight: '500', flex: 1 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },

  // Task row
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 2,
  },
  taskRowDone: { opacity: 0.45 },
  taskCheckWrap: { paddingTop: 3 },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckDone: { backgroundColor: ACCENT, borderColor: ACCENT },
  taskContent: { flex: 1, gap: 4 },
  taskTitle: { color: TEXT, fontSize: 20, fontWeight: '700', lineHeight: 26 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskMetaText: { color: MUTED, fontSize: 11 },

  // Inline add input
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 12,
    marginTop: 4,
    gap: 8,
  },
  textInput: { flex: 1, color: TEXT, fontSize: 14, paddingVertical: 12 },
  inlineSubmit: { padding: 4 },

  // Add row
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  addLabel: { color: MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },

  // Upcoming
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  upcomingTitle: { color: MUTED, fontSize: 14, flex: 1 },
  upcomingDate: { color: LABEL, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },

  emptyText: { color: MUTED, fontSize: 13, paddingVertical: 8, paddingHorizontal: 2 },
});
