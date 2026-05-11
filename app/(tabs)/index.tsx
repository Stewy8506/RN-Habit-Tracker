import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { isSameLocalDay } from '@/utils/time';

const BG = '#0A0A0A';
const CARD = '#141414';
const CARD2 = '#1A1A1A';
const TEXT = '#FFFFFF';
const MUTED = '#888888';
const LABEL = '#555555';
const ACCENT = '#4A8FD4';
const BORDER = 'rgba(255,255,255,0.07)';

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function HomeScreen() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { habits, loading: habitsLoading, completeHabit } = useHabits();
  const authLoading = useSettingsStore((s) => s.authLoading);
  const setSelectedTaskId = useTimerStore((s) => s.setSelectedTaskId);
  const insets = useSafeAreaInsets();
  const today = new Date();

  // ── Derived stats ──────────────────────────────────────────────────
  const habitsToday = habits.filter(
    (h) => h.lastCompleted && isSameLocalDay(h.lastCompleted.toDate(), today),
  );
  const consistencyScore =
    habits.length > 0 ? Math.round((habitsToday.length / habits.length) * 100) : 0;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const focusFuelPct =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const nextTask = incompleteTasks[0] ?? null;

  // Weekly bars: last 6 days as placeholder + today's real value
  const weekBars = [0.35, 0.5, 0.45, 0.65, 0.55, 0.7, consistencyScore / 100];

  const recentItems = [
    ...habitsToday.map((h) => ({
      id: h.id,
      label: h.name,
      icon: 'checkmark-circle' as const,
      tag: 'HABIT',
    })),
    ...completedTasks.slice(0, 3).map((t) => ({
      id: t.id,
      label: t.title,
      icon: 'checkmark-circle' as const,
      tag: 'TASK',
    })),
    ...incompleteTasks.slice(0, 2).map((t) => ({
      id: t.id,
      label: t.title,
      icon: 'ellipse-outline' as const,
      tag: 'PENDING',
    })),
  ].slice(0, 5);

  const startFocus = () => {
    setSelectedTaskId(nextTask?.id ?? null);
    router.push('/focus');
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.screen, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="menu" size={22} color={TEXT} />
        </Pressable>
        <Text style={styles.appName}>MONOS</Text>
        <Pressable
          style={styles.headerBtn}
          hitSlop={8}
          onPress={() => router.push('/(tabs)/settings')}>
          <Ionicons name="settings-outline" size={20} color={TEXT} />
        </Pressable>
      </View>

      {/* ── Consistency Card ── */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <SectionLabel>CONSISTENCY</SectionLabel>
          <View style={styles.badge}>
            <Ionicons name="flame-outline" size={11} color={ACCENT} />
            <Text style={styles.badgeText}>{bestStreak} DAY</Text>
          </View>
        </View>
        {habitsLoading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 16 }} />
        ) : (
          <>
            <Text style={styles.bigNum}>
              {consistencyScore}
              <Text style={styles.bigNumUnit}>%</Text>
            </Text>
            <Text style={styles.cardSub}>
              {habitsToday.length} of {habits.length} habits done today
            </Text>
          </>
        )}
      </View>

      {/* ── Two-col: Focus Fuel + Weekly Trend ── */}
      <View style={styles.row2}>
        <View style={[styles.card, styles.flex1]}>
          <SectionLabel>FOCUS FUEL</SectionLabel>
          <Text style={styles.fuelPct}>{focusFuelPct}%</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${focusFuelPct}%` as any }]} />
          </View>
        </View>
        <View style={[styles.card, styles.flex1]}>
          <SectionLabel>WEEKLY TREND</SectionLabel>
          <View style={styles.bars}>
            {weekBars.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(h * 44, 4),
                      backgroundColor: i === 6 ? ACCENT : CARD2,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Next Up ── */}
      <SectionLabel>NEXT UP</SectionLabel>
      {tasksLoading ? (
        <ActivityIndicator color={ACCENT} style={{ marginVertical: 12 }} />
      ) : nextTask ? (
        <Pressable style={styles.nextCard} onPress={startFocus}>
          <View style={styles.nextIcon}>
            <Ionicons name="document-text-outline" size={20} color={TEXT} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle} numberOfLines={1}>
              {nextTask.title}
            </Text>
            <Text style={styles.nextMeta}>
              PRIORITY
              {nextTask.pomodoroCount > 0 ? ` · ${nextTask.pomodoroCount * 25} MINS` : ''}
            </Text>
          </View>
          <Pressable style={styles.playBtn} onPress={startFocus}>
            <Ionicons name="play" size={15} color={TEXT} />
          </Pressable>
        </Pressable>
      ) : (
        <View style={[styles.nextCard, styles.emptyCard]}>
          <Text style={[styles.nextMeta, { color: MUTED }]}>No tasks pending — well done.</Text>
        </View>
      )}

      {/* ── Daily Overview ── */}
      <SectionLabel>DAILY OVERVIEW</SectionLabel>
      <View style={styles.row2}>
        <View style={[styles.card, styles.flex1, styles.overviewCell]}>
          <Text style={styles.overviewNum}>
            {habitsToday.length}/{habits.length}
          </Text>
          <Text style={styles.overviewLabel}>HABITS</Text>
          <View style={styles.overviewIcon}>
            <Ionicons name="checkmark-circle-outline" size={22} color={MUTED} />
          </View>
        </View>
        <View style={[styles.card, styles.flex1, styles.overviewCell]}>
          <Text style={styles.overviewNum}>{incompleteTasks.length}</Text>
          <Text style={styles.overviewLabel}>TASKS LEFT</Text>
          <View style={styles.overviewIcon}>
            <Ionicons name="list-outline" size={22} color={MUTED} />
          </View>
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={startFocus}
          disabled={authLoading}>
          <Ionicons name="timer-outline" size={16} color={TEXT} />
          <Text style={styles.actionBtnText}>Start Timer</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={() => router.push('/today' as any)}>
          <Ionicons name="add" size={18} color={TEXT} />
          <Text style={styles.actionBtnText}>Quick Add</Text>
        </Pressable>
      </View>

      {/* ── Recent Activity ── */}
      {recentItems.length > 0 && (
        <>
          <SectionLabel>RECENT ACTIVITY</SectionLabel>
          <View style={styles.card}>
            {recentItems.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.activityRow,
                  idx < recentItems.length - 1 && styles.activityBorder,
                ]}>
                <Ionicons name={item.icon} size={18} color={item.icon === 'checkmark-circle' ? ACCENT : MUTED} />
                <Text style={styles.activityLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.activityTag}>{item.tag}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  screen: { padding: 18, gap: 12 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // Cards
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 6,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSub: { color: MUTED, fontSize: 12, marginTop: 2 },

  // Section label
  sectionLabel: {
    color: LABEL,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,143,212,0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  badgeText: { color: ACCENT, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  // Big number
  bigNum: { color: TEXT, fontSize: 64, fontWeight: '900', lineHeight: 72, marginTop: 4 },
  bigNumUnit: { fontSize: 28, fontWeight: '700', color: MUTED },

  // Row layout
  row2: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },

  // Focus Fuel
  fuelPct: { color: TEXT, fontSize: 28, fontWeight: '800', marginTop: 4 },
  progressTrack: {
    height: 4,
    backgroundColor: CARD2,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: { height: 4, backgroundColor: ACCENT, borderRadius: 2 },

  // Weekly bars
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 48, marginTop: 8 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 48 },
  bar: { width: '100%', borderRadius: 2 },

  // Next Up
  nextCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  emptyCard: { justifyContent: 'center' },
  nextIcon: {
    width: 42,
    height: 42,
    backgroundColor: CARD2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextContent: { flex: 1, gap: 3 },
  nextTitle: { color: TEXT, fontSize: 17, fontWeight: '700' },
  nextMeta: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  playBtn: {
    width: 36,
    height: 36,
    backgroundColor: CARD2,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Daily overview
  overviewCell: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  overviewNum: { color: TEXT, fontSize: 34, fontWeight: '900', flex: 1 },
  overviewLabel: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginTop: 4 },
  overviewIcon: { opacity: 0.6 },

  // Actions
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionBtnPressed: { opacity: 0.7 },
  actionBtnText: { color: TEXT, fontSize: 13, fontWeight: '700' },

  // Recent activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
  },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  activityLabel: { color: TEXT, fontSize: 14, fontWeight: '500', flex: 1 },
  activityTag: { color: MUTED, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
});
