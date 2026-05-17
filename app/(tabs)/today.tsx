import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useTimer } from '@/hooks/useTimer';
import { useTimerStore } from '@/store/useTimerStore';
import { Habit, HabitPriority, HabitTimerType } from '@/types/habit';
import { Task, TaskPriority, TaskTimerType } from '@/types/task';
import { compactTitle } from '@/utils/helpers';
import { getNextTaskFocusSeconds } from '@/utils/taskTimer';
import { isSameLocalDay } from '@/utils/time';

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

const TASK_ICON_OPTIONS = [
  'time-outline',
  'book-outline',
  'fitness-outline',
  'brush-outline',
  'musical-notes-outline',
  'heart-outline',
] as const;
const HABIT_ICON_OPTIONS = [
  'moon-outline',
  'book-outline',
  'barbell-outline',
  'heart-outline',
  'pencil-outline',
  'medkit-outline',
] as const;

type TaskIcon = typeof TASK_ICON_OPTIONS[number];
type HabitIcon = typeof HABIT_ICON_OPTIONS[number];

const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;
const HABIT_PRESETS = [
  { name: 'Meditation', icon: 'moon-outline' },
  { name: 'Studying', icon: 'book-outline' },
  { name: 'Workout', icon: 'barbell-outline' },
  { name: 'Reading', icon: 'book-outline' },
];

// ── Habit row with 7-dot streak strip ────────────────────────────────
function HabitRow({
  habit,
  onComplete,
  onOpenTimer,
}: {
  habit: Habit;
  onComplete: (h: Habit) => void;
  onOpenTimer?: (h: Habit) => void;
}) {
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
  const iconName = (habit.icon as keyof typeof Ionicons.glyphMap) ?? icons[iconIndex];
  const timerLabel = habit.timerType ? habit.timerType.toUpperCase() : null;

  return (
    <View style={[styles.habitRow, doneToday && styles.habitRowDone]}>
      <Pressable
        onPress={() => !doneToday && onComplete(habit)}
        style={[styles.habitRowContent, doneToday && styles.habitRowDone]}>
        <View style={[styles.habitIcon, doneToday && styles.habitIconDone]}>
          <Ionicons
            name={doneToday ? 'checkmark' : iconName}
            size={16}
            color={doneToday ? TEXT : MUTED}
          />
        </View>
        <View style={styles.habitTextWrap}>
          <Text style={[styles.habitName, doneToday && { color: MUTED }]}>{habit.name}</Text>
          {habit.durationMinutes || timerLabel ? (
            <Text style={styles.habitMeta}>
              {habit.durationMinutes ? `${habit.durationMinutes} min · ` : ''}
              {timerLabel}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {habit.timerType ? (
        <Pressable style={styles.timerButton} onPress={() => onOpenTimer?.(habit)}>
          <Ionicons name="play" size={16} color={ACCENT} />
        </Pressable>
      ) : null}
      <View style={styles.dots}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i < filledDots ? DOT_ON : DOT_OFF }]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Task row ──────────────────────────────────────────────────────────
function TaskRow({
  task,
  onToggle,
  onOpenTimer,
}: {
  task: Task;
  onToggle: (t: Task) => void;
  onOpenTimer?: (t: Task) => void;
}) {
  const duration = task.durationMinutes ?? (task.pomodoroCount > 0 ? task.pomodoroCount * 25 : null);
  const deadlineText = task.deadline
    ? task.deadline.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const iconName = (task.icon as keyof typeof Ionicons.glyphMap) ?? 'stopwatch-outline';
  const timerLabel = task.timerType ? task.timerType.toUpperCase() : null;

  return (
    <View style={[styles.taskRow, task.completed && styles.taskRowDone]}>
      <Pressable onPress={() => onToggle(task)} style={styles.taskCheckWrap}>
        <View style={[styles.taskCheck, task.completed && styles.taskCheckDone]}>
          {task.completed && <Ionicons name="checkmark" size={12} color={TEXT} />}
        </View>
      </Pressable>
      <Pressable
        style={styles.taskContent}
        onPress={() => onOpenTimer?.(task)}>
        <View style={styles.taskHeader}>
          <Text
            style={[styles.taskTitle, task.completed && { color: MUTED, textDecorationLine: 'line-through' }]}
            numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.taskIconBadge}>
            <Ionicons name={iconName} size={14} color={TEXT} />
          </View>
        </View>
        <View style={styles.taskMetaRow}>
          {duration ? (
            <View style={styles.taskMeta}>
              <Ionicons name="time-outline" size={11} color={MUTED} />
              <Text style={styles.taskMetaText}>{duration} min</Text>
            </View>
          ) : null}
          {deadlineText ? (
            <View style={styles.taskMeta}>
              <Ionicons name="calendar-outline" size={11} color={MUTED} />
              <Text style={styles.taskMetaText}>{deadlineText}</Text>
            </View>
          ) : null}
          {timerLabel ? (
            <View style={styles.taskMeta}>
              <Ionicons name="play-outline" size={11} color={MUTED} />
              <Text style={styles.taskMetaText}>{timerLabel}</Text>
            </View>
          ) : null}
          {task.priority ? (
            <View
              style={[
                styles.priorityPill,
                task.priority === 'high'
                  ? styles.priorityHigh
                  : task.priority === 'medium'
                  ? styles.priorityMedium
                  : styles.priorityLow,
              ]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, loading: habLoading, completeHabit, addHabit } = useHabits();
  const { tasks, loading: taskLoading, addTask, toggleTask, deleteTask } = useTasks();
  const {
    isRunning,
    mode,
    secondsLeft,
    selectedTaskId,
    selectedTimerName,
    selectedTimerType,
    setSelectedTaskId,
    setSelectedTimerType,
    setSelectedTimerName,
    requestAutoStart,
  } = useTimer();
  const setMode = useTimerStore((state) => state.setMode);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    duration: string;
    icon: TaskIcon;
    deadline: string;
    priority: TaskPriority;
    timerType: TaskTimerType;
  }>({
    title: '',
    duration: '25',
    icon: TASK_ICON_OPTIONS[0] as TaskIcon,
    deadline: '',
    priority: 'medium' as TaskPriority,
    timerType: 'pomodoro' as TaskTimerType,
  });
  const [habitForm, setHabitForm] = useState<{
    name: string;
    icon: HabitIcon;
    priority: HabitPriority;
    category: string;
    duration: string;
    timerType: HabitTimerType;
  }>({
    name: '',
    icon: HABIT_ICON_OPTIONS[0] as HabitIcon,
    priority: 'medium' as HabitPriority,
    category: '',
    duration: '25',
    timerType: 'pomodoro' as HabitTimerType,
  });
  const [upcomingOpen, setUpcomingOpen] = useState(false);

  const today = new Date();
  const priorityTasks = tasks.filter((t) => !t.completed);
  const upcomingTasks = tasks.filter(
    (t) => !t.completed && t.deadline && t.deadline.toDate() > today,
  );

  const formatTimerLabel = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openTaskTimer = (task: Task) => {
    setSelectedTaskId(task.id);
    setSelectedTimerName(task.title);
    setSelectedTimerType(task.timerType ?? 'regular');
    setMode('focus', getNextTaskFocusSeconds(task, focusDurationSeconds));
    requestAutoStart();
    router.push('/focus');
  };

  const openHabitTimer = (habit: Habit) => {
    const timerDuration = Math.min((habit.durationMinutes ?? focusDurationSeconds / 60) * 60, focusDurationSeconds);

    setSelectedTaskId(habit.id);
    setSelectedTimerName(habit.name);
    setSelectedTimerType(habit.timerType ?? 'regular');
    setMode('focus', timerDuration);
    requestAutoStart();
    router.push('/focus');
  };

  const resetTaskForm = () =>
    setTaskForm({
      title: '',
      duration: '25',
      icon: TASK_ICON_OPTIONS[0] as TaskIcon,
      deadline: '',
      priority: 'medium' as TaskPriority,
      timerType: 'pomodoro' as TaskTimerType,
    });

  const resetHabitForm = () =>
    setHabitForm({
      name: '',
      icon: HABIT_ICON_OPTIONS[0] as HabitIcon,
      priority: 'medium' as HabitPriority,
      category: '',
      duration: '25',
      timerType: 'pomodoro' as HabitTimerType,
    });

  const parseDeadline = (value: string) => {
    if (!value.trim()) {
      return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const submitTask = async () => {
    const title = compactTitle(taskForm.title);
    if (!title) return;

    const deadline = parseDeadline(taskForm.deadline);
    if (taskForm.deadline && !deadline) {
      return;
    }

    await addTask({
      title,
      icon: taskForm.icon,
      durationMinutes: Number(taskForm.duration) > 0 ? Number(taskForm.duration) : null,
      deadline,
      priority: taskForm.priority,
      timerType: taskForm.timerType,
    });

    resetTaskForm();
    setShowAddTask(false);
  };

  const submitHabit = async () => {
    const name = compactTitle(habitForm.name);
    if (!name) return;

    await addHabit({
      name,
      icon: habitForm.icon,
      priority: habitForm.priority,
      category: habitForm.category || null,
      durationMinutes: Number(habitForm.duration) > 0 ? Number(habitForm.duration) : null,
      timerType: habitForm.timerType,
    });

    resetHabitForm();
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

      {isRunning && selectedTimerName ? (
        <Pressable style={styles.activeTimerCard} onPress={() => router.push('/focus')}>
          <Text style={styles.activeTimerLabel}>Active timer</Text>
          <View style={styles.activeTimerRow}>
            <Text style={styles.activeTimerName}>{selectedTimerName}</Text>
            <Text style={styles.activeTimerTime}>
              {formatTimerLabel(secondsLeft)} · {selectedTimerType?.toUpperCase()}
            </Text>
          </View>
        </Pressable>
      ) : null}

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
        habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            onComplete={completeHabit}
            onOpenTimer={openHabitTimer}
          />
        ))
      )}

      <Pressable style={styles.addRow} onPress={() => setShowAddHabit(true)}>
        <Ionicons name="add" size={16} color={MUTED} />
        <Text style={styles.addLabel}>ADD HABIT</Text>
      </Pressable>

      <Modal visible={showAddHabit} onClose={() => setShowAddHabit(false)}>
        <Text style={styles.modalHeading}>New habit</Text>
        <TextInput
          placeholder="Habit name"
          placeholderTextColor={MUTED}
          value={habitForm.name}
          onChangeText={(value) => setHabitForm((prev) => ({ ...prev, name: value }))}
          style={[styles.modalInput, { color: TEXT }]}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submitHabit}
        />
        <Text style={styles.modalLabel}>Suggested habits</Text>
        <View style={styles.suggestionRow}>
          {HABIT_PRESETS.map((preset) => (
            <Pressable
              key={preset.name}
              style={[
                styles.presetButton,
                habitForm.name === preset.name && styles.presetButtonActive,
              ]}
              onPress={() =>
                setHabitForm((prev) => ({
                  ...prev,
                  name: preset.name,
                  icon: preset.icon as HabitIcon,
                  category: preset.name,
                }))
              }>
              <Text
                style={[
                  styles.presetText,
                  habitForm.name === preset.name && styles.presetTextActive,
                ]}>
                {preset.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.modalLabel}>Icon</Text>
        <View style={styles.iconRow}>
          {HABIT_ICON_OPTIONS.map((icon) => (
            <Pressable
              key={icon}
              style={[
                styles.iconOption,
                habitForm.icon === icon && styles.iconOptionSelected,
              ]}
              onPress={() => setHabitForm((prev) => ({ ...prev, icon }))}>
              <Ionicons name={icon} size={20} color={habitForm.icon === icon ? TEXT : MUTED} />
            </Pressable>
          ))}
        </View>
        <Text style={styles.modalLabel}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.priorityButton,
                habitForm.priority === option && styles.priorityButtonSelected,
              ]}
              onPress={() => setHabitForm((prev) => ({ ...prev, priority: option }))}>
              <Text
                style={[
                  styles.priorityButtonText,
                  habitForm.priority === option && styles.priorityButtonTextSelected,
                ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => {
              resetHabitForm();
              setShowAddHabit(false);
            }}
          />
          <Button
            title="Add habit"
            onPress={submitHabit}
            disabled={!compactTitle(habitForm.name)}
          />
        </View>
      </Modal>

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
        priorityTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onToggle={toggleTask}
            onOpenTimer={openTaskTimer}
          />
        ))
      )}

      <Pressable style={styles.addRow} onPress={() => setShowAddTask(true)}>
        <Ionicons name="add" size={16} color={MUTED} />
        <Text style={styles.addLabel}>ADD TASK</Text>
      </Pressable>

      <Modal visible={showAddTask} onClose={() => setShowAddTask(false)}>
        <Text style={styles.modalHeading}>New task</Text>
        <TextInput
          placeholder="Task name"
          placeholderTextColor={MUTED}
          value={taskForm.title}
          onChangeText={(value) => setTaskForm((prev) => ({ ...prev, title: value }))}
          style={[styles.modalInput, { color: TEXT }]}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submitTask}
        />
        <Text style={styles.modalLabel}>Duration (minutes)</Text>
        <TextInput
          placeholder="25"
          placeholderTextColor={MUTED}
          value={taskForm.duration}
          onChangeText={(value) => setTaskForm((prev) => ({ ...prev, duration: value }))}
          keyboardType="number-pad"
          style={[styles.modalInput, { color: TEXT }]}
        />
        <Text style={styles.modalLabel}>Icon</Text>
        <View style={styles.iconRow}>
          {TASK_ICON_OPTIONS.map((icon) => (
            <Pressable
              key={icon}
              style={[
                styles.iconOption,
                taskForm.icon === icon && styles.iconOptionSelected,
              ]}
              onPress={() => setTaskForm((prev) => ({ ...prev, icon }))}>
              <Ionicons name={icon} size={20} color={taskForm.icon === icon ? TEXT : MUTED} />
            </Pressable>
          ))}
        </View>
        <Text style={styles.modalLabel}>Deadline</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor={MUTED}
          value={taskForm.deadline}
          onChangeText={(value) => setTaskForm((prev) => ({ ...prev, deadline: value }))}
          style={[styles.modalInput, { color: TEXT }]}
        />
        <Text style={styles.modalLabel}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.priorityButton,
                taskForm.priority === option && styles.priorityButtonSelected,
              ]}
              onPress={() => setTaskForm((prev) => ({ ...prev, priority: option }))}>
              <Text
                style={[
                  styles.priorityButtonText,
                  taskForm.priority === option && styles.priorityButtonTextSelected,
                ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => {
              resetTaskForm();
              setShowAddTask(false);
            }}
          />
          <Button
            title="Add task"
            onPress={submitTask}
            disabled={!compactTitle(taskForm.title)}
          />
        </View>
      </Modal>

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

      <View style={{ height: 110 }} />
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
  habitRowContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  habitTextWrap: { flex: 1 },
  habitName: { color: TEXT, fontSize: 15, fontWeight: '500', flex: 1 },
  habitMeta: { color: MUTED, fontSize: 12, marginTop: 2 },
  timerButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: CARD2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },

  activeTimerCard: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: CARD2,
    padding: 18,
    gap: 10,
  },
  activeTimerLabel: {
    color: LABEL,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  activeTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  activeTimerName: { color: TEXT, fontSize: 18, fontWeight: '700' },
  activeTimerTime: { color: MUTED, fontSize: 13 },

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
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6, alignItems: 'center' },
  taskIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: CARD2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: { color: TEXT, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  priorityHigh: { backgroundColor: 'rgba(248, 81, 73, 0.16)' },
  priorityMedium: { backgroundColor: 'rgba(255, 201, 71, 0.16)' },
  priorityLow: { backgroundColor: 'rgba(76, 161, 175, 0.16)' },

  modalHeading: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
  },
  modalLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: CARD,
    fontSize: 15,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  presetButtonActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  presetText: { color: TEXT, fontSize: 13 },
  presetTextActive: { color: '#FFFFFF' },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  priorityButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  priorityButtonSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  priorityButtonText: { color: TEXT, fontSize: 13, textTransform: 'capitalize' },
  priorityButtonTextSelected: { color: '#FFFFFF' },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },

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
