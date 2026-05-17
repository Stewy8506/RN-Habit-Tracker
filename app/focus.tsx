import { CircularProgressRing } from '@/components/Timer/CircularProgressRing';
import { WheelPicker } from '@/components/Timer/WheelPicker';
import { useTimer } from '@/hooks/useTimer';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing, interpolateColor, useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// ── Picker data ───────────────────────────────────────────────────────────────
const MINUTES = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
const SECONDS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function secsToIndices(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  // Round seconds down to nearest 5-second slot
  const secsIdx = Math.round(secs / 5);
  return {
    minsIdx: Math.min(mins, 99),
    secsIdx: Math.min(secsIdx, 11),
  };
}

function indicesToSecs(minsIdx: number, secsIdx: number) {
  return minsIdx * 60 + secsIdx * 5;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FocusScreen() {
  const router = useRouter();
  const userId = useSettingsStore((state) => state.userId);

  const [todayStats, setTodayStats] = useState({
    duration: 4.5 * 60 * 60,
    streak: 12,
  });

  const {
    mode,
    secondsLeft,
    currentDurationSeconds,
    focusDurationSeconds,
    shortBreakDurationSeconds,
    longBreakDurationSeconds,
    isRunning,
    autoStartRequested,
    consumeAutoStart,
    start,
    pause,
    reset,
    stop,
    skip,
  } = useTimer(() => router.push('/(tabs)/tasks'));

  const setFocusDurationSeconds = useTimerStore((s) => s.setFocusDurationSeconds);
  const setShortBreakDurationSeconds = useTimerStore((s) => s.setShortBreakDurationSeconds);
  const setLongBreakDurationSeconds = useTimerStore((s) => s.setLongBreakDurationSeconds);
  const selectedTaskId = useTimerStore((s) => s.selectedTaskId);

  useEffect(() => {
    if (selectedTaskId && autoStartRequested && !isRunning && mode === 'focus') {
      consumeAutoStart();
      void start();
    }
  }, [autoStartRequested, consumeAutoStart, selectedTaskId, isRunning, mode, start]);

  const progress =
    secondsLeft / currentDurationSeconds;

  // ── Mode transition animation ─────────────────────────────────────────────
  const transition = useSharedValue(0);
  const modeTextOpacity = useSharedValue(1);
  const modeTextScale = useSharedValue(1);
  const [displayedMode, setDisplayedMode] = useState(mode);
  const [isTransitioningMode, setIsTransitioningMode] = useState(false);

  useEffect(() => {
    // Animate mode text
    modeTextOpacity.value = withTiming(0.5, { duration: 300 });
    modeTextScale.value = withTiming(0.95, { duration: 300 });
    
    // Change text at the midpoint (smallest scale)
    setTimeout(() => {
      setDisplayedMode(mode);
      modeTextOpacity.value = withTiming(1, { duration: 300 });
      modeTextScale.value = withTiming(1, { duration: 300 });
    }, 300);

    // Animate background
    const targetValue = mode === 'focus' ? 0 : mode === 'shortBreak' ? 0.5 : 1;
    transition.value = withTiming(targetValue, { duration: 800 });
  }, [mode]);

  const animatedBgStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      transition.value,
      [0, 0.5, 1],
      ['#000000', '#080c10', '#0a1a0a']
    );
    return { backgroundColor };
  });

  const animatedModeTextStyle = useAnimatedStyle(() => ({
    opacity: modeTextOpacity.value,
    transform: [{ scale: modeTextScale.value }],
  }));

  const modalScale = useSharedValue(0.92);
  const modalOpacity = useSharedValue(0);

  const animatedModalStyle = useAnimatedStyle(() => {
  return {
    opacity: modalOpacity.value,
    transform: [
      {
        translateY: (1 - modalOpacity.value) * 420,
      },
      {
        scale: modalScale.value,
      },
    ],
  };
});

  // ── Editable timer ────────────────────────────────────────────────────────
  const currentDuration = mode === 'focus' 
    ? focusDurationSeconds 
    : mode === 'shortBreak' 
      ? shortBreakDurationSeconds 
      : longBreakDurationSeconds;
  const isIdle =
  !isRunning &&
  secondsLeft === currentDuration &&
  mode === displayedMode;

  // Which tab is active in the editor
  const [editTab, setEditTab] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');

  // Wheel indices — kept for both tabs simultaneously
  const [focusMinsIdx, setFocusMinsIdx] = useState(0);
  const [focusSecsIdx, setFocusSecsIdx] = useState(0);
  const [shortBreakMinsIdx, setShortBreakMinsIdx] = useState(0);
  const [shortBreakSecsIdx, setShortBreakSecsIdx] = useState(0);
  const [longBreakMinsIdx, setLongBreakMinsIdx] = useState(0);
  const [longBreakSecsIdx, setLongBreakSecsIdx] = useState(0);

  const [editVisible, setEditVisible] = useState(false);

  const lightTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const mediumTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

const softTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
};

const successTap = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

  const openEditor = () => {
    if (!isIdle) return;
    softTap();
    // Pre-populate from current store values
    const fi = secsToIndices(focusDurationSeconds);
    const sbi = secsToIndices(shortBreakDurationSeconds);
    const lbi = secsToIndices(longBreakDurationSeconds);
    setFocusMinsIdx(fi.minsIdx);
    setFocusSecsIdx(fi.secsIdx);
    setShortBreakMinsIdx(sbi.minsIdx);
    setShortBreakSecsIdx(sbi.secsIdx);
    setLongBreakMinsIdx(lbi.minsIdx);
    setLongBreakSecsIdx(lbi.secsIdx);
    // Open to the current mode's tab
    setEditTab(mode);

    modalScale.value = 1;
    modalOpacity.value = 0;

    setEditVisible(true);

    requestAnimationFrame(() => {
  modalScale.value = withSpring(1, {
    damping: 18,
    stiffness: 140,
    mass: 1,
  });

  modalOpacity.value = withTiming(1, {
    duration: 260,
    easing: Easing.out(Easing.cubic),
  });
});
  };

  const closeEditor = () => {
  modalOpacity.value = withTiming(0, {
    duration: 220,
    easing: Easing.in(Easing.cubic),
  });

  modalScale.value = withTiming(0.92, {
    duration: 220,
    easing: Easing.in(Easing.cubic),
  });

  setTimeout(() => {
    setEditVisible(false);
  }, 220);
};

  const confirmEdit = () => {
    const focusTotal = indicesToSecs(focusMinsIdx, focusSecsIdx);
    const shortBreakTotal = indicesToSecs(shortBreakMinsIdx, shortBreakSecsIdx);
    const longBreakTotal = indicesToSecs(longBreakMinsIdx, longBreakSecsIdx);
    if (focusTotal > 0) setFocusDurationSeconds(focusTotal);
    if (shortBreakTotal > 0) setShortBreakDurationSeconds(shortBreakTotal);
    if (longBreakTotal > 0) setLongBreakDurationSeconds(longBreakTotal);
    closeEditor();
  };

  useEffect(() => {
    if (userId) {
      setTodayStats({ duration: 4.5 * 60 * 60, streak: 12 });
    }
  }, [userId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}.${Math.floor((minutes / 60) * 10)}h`;
    return `${minutes}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <Animated.View style={[styles.root, animatedBgStyle]}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#666" />
        </Pressable>
        <Ionicons name="options-outline" size={26} color="#666" />
      </View>

      {/* MODE */}
      <Animated.Text style={[styles.modeText, animatedModeTextStyle]}>
        {displayedMode === 'focus' ? 'DEEP FOCUS' : displayedMode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
      </Animated.Text>

      {/* TIMER */}
      <View style={styles.timerWrapper}>
        <CircularProgressRing
          progress={progress}
          size={320}
          strokeWidth={5}
          colors={{ primary: '#9CA3AF', border: '#1A1A1A' }}
        />

        <TouchableOpacity
          style={styles.timerTextContainer}
          onPress={openEditor}
          activeOpacity={isIdle ? 0.55 : 1}
          disabled={!isIdle}
        >
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          {isIdle && <Text style={styles.editHint}>TAP TO EDIT</Text>}
        </TouchableOpacity>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <Pressable style={styles.playButton} onPress={isRunning ? pause : start}>
          <Ionicons name={isRunning ? 'pause' : 'play'} size={34} color="#FFF" />
        </Pressable>

        <View style={styles.secondaryControls}>
          <Pressable onPress={reset}>
            <Text style={styles.controlText}>RESET</Text>
          </Pressable>
          <Pressable onPress={skip}>
            <Text style={styles.controlText}>SKIP</Text>
          </Pressable>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TODAY</Text>
          <Text style={styles.statValue}>{formatDuration(todayStats.duration)}</Text>
          <Ionicons name="timer-outline" size={22} color="#6B7280" style={styles.statIcon} />
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.statValue}>{todayStats.streak}</Text>
          <Ionicons name="git-network-outline" size={22} color="#6B7280" style={styles.statIcon} />
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SLEEP</Text>
          <Text style={styles.statValue}>7h</Text>
          <Ionicons name="moon-outline" size={22} color="#6B7280" style={styles.statIcon} />
        </View>
      </View>

      {/* ── EDIT DURATION MODAL ──────────────────────────────────────────── */}
      <Modal
        visible={editVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeEditor}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeEditor}
          />

          <Animated.View style={[styles.modalCard, animatedModalStyle]}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>SET DURATION</Text>

            {/* Focus / Short Break / Long Break tab switcher */}
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tab, editTab === 'focus' && styles.tabActive]}
                onPress={() => setEditTab('focus')}
              >
                <Text style={[styles.tabText, editTab === 'focus' && styles.tabTextActive]}>
                  Focus
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, editTab === 'shortBreak' && styles.tabActive]}
                onPress={() => setEditTab('shortBreak')}
              >
                <Text style={[styles.tabText, editTab === 'shortBreak' && styles.tabTextActive]}>
                  S.Break
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, editTab === 'longBreak' && styles.tabActive]}
                onPress={() => setEditTab('longBreak')}
              >
                <Text style={[styles.tabText, editTab === 'longBreak' && styles.tabTextActive]}>
                  L.Break
                </Text>
              </Pressable>
            </View>

            {/* Wheel pickers */}
            <View style={styles.pickerRow}>
              {editTab === 'focus' ? (
                <>
                  <WheelPicker
                    items={MINUTES}
                    selectedIndex={focusMinsIdx}
                    onChange={setFocusMinsIdx}
                    width={100}
                  />
                  <Text style={styles.pickerSeparator}>:</Text>
                  <WheelPicker
                    items={SECONDS}
                    selectedIndex={focusSecsIdx}
                    onChange={setFocusSecsIdx}
                    width={100}
                  />
                </>
              ) : editTab === 'shortBreak' ? (
                <>
                  <WheelPicker
                    items={MINUTES}
                    selectedIndex={shortBreakMinsIdx}
                    onChange={setShortBreakMinsIdx}
                    width={100}
                  />
                  <Text style={styles.pickerSeparator}>:</Text>
                  <WheelPicker
                    items={SECONDS}
                    selectedIndex={shortBreakSecsIdx}
                    onChange={setShortBreakSecsIdx}
                    width={100}
                  />
                </>
              ) : (
                <>
                  <WheelPicker
                    items={MINUTES}
                    selectedIndex={longBreakMinsIdx}
                    onChange={setLongBreakMinsIdx}
                    width={100}
                  />
                  <Text style={styles.pickerSeparator}>:</Text>
                  <WheelPicker
                    items={SECONDS}
                    selectedIndex={longBreakSecsIdx}
                    onChange={setLongBreakSecsIdx}
                    width={100}
                  />
                </>
              )}
            </View>

            <View style={styles.pickerLabels}>
              <Text style={styles.pickerLabel}>MIN</Text>
              <Text style={styles.pickerLabel}>SEC</Text>
            </View>

            <Pressable style={styles.confirmBtn} onPress={confirmEdit}>
              <Text style={styles.confirmText}>CONFIRM</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },

  focusTitle: {
    color: '#666',
    fontSize: 18,
    letterSpacing: 6,
    fontWeight: '300',
  },

  modeText: {
    color: '#FFF',
    fontSize: 16,
    letterSpacing: 5,
    fontWeight: '600',
    marginBottom: 50,
  },

  timerWrapper: {
    width: 360,
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },

  timerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timerText: {
    color: '#FFF',
    fontSize: 86,
    fontWeight: '200',
    letterSpacing: -4,
  },

  editHint: {
    color: '#444',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 4,
    fontWeight: '500',
  },

  controls: {
    alignItems: 'center',
    marginBottom: 80,
  },

  playButton: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },

  secondaryControls: {
    flexDirection: 'row',
    gap: 60,
  },

  controlText: {
    color: '#AAA',
    fontSize: 16,
    letterSpacing: 3,
    fontWeight: '500',
  },

  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
  },

  statItem: {
    alignItems: 'center',
    gap: 8,
  },

  statLabel: {
    color: '#666',
    fontSize: 13,
    letterSpacing: 3,
    marginBottom: 6,
  },

  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },

  statIcon: {
    marginTop: 8,
  },

  // ── Modal ────────────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    paddingBottom: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  modalCard: {
    backgroundColor: '#0D0D0D',
    minHeight: 520,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1A1A1A',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 48,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: -8,
    },
    elevation: 30,
    alignItems: 'center',
  },

  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginBottom: 24,
  },

  modalTitle: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 5,
    fontWeight: '600',
    marginBottom: 20,
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 32,
    padding: 3,
  },

  tab: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 11,
  },

  tabActive: {
    backgroundColor: '#232323',
    shadowColor: '#FFF',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  tabText: {
    color: '#555',
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '600',
  },

  tabTextActive: {
    color: '#FFF',
  },

  // ── Wheel pickers ──
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
    zIndex: 10,
    overflow: 'visible',
  },

  pickerSeparator: {
    color: '#444',
    fontSize: 32,
    fontWeight: '200',
    paddingBottom: 4,
    width: 20,
    textAlign: 'center',
  },

  pickerLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 224,
    marginBottom: 28,
  },

  pickerLabel: {
    color: '#444',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '600',
  },

  // ── Confirm ──
  confirmBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },

  confirmText: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '600',
  },
});
