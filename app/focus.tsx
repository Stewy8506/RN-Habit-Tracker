import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CircularProgressRing } from '@/components/Timer/CircularProgressRing';
import { WheelPicker } from '@/components/Timer/WheelPicker';
import { useTimer } from '@/hooks/useTimer';
import { getModeDuration } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';

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
  const userId = useSettingsStore((state) => state.userId);

  const [todayStats, setTodayStats] = useState({
    duration: 4.5 * 60 * 60,
    streak: 12,
  });

  const {
    mode,
    secondsLeft,
    focusDurationSeconds,
    breakDurationSeconds,
    isRunning,
    start,
    pause,
    reset,
    skip,
  } = useTimer();

  const setFocusDurationSeconds = useTimerStore((s) => s.setFocusDurationSeconds);
  const setBreakDurationSeconds = useTimerStore((s) => s.setBreakDurationSeconds);

  const progress =
    secondsLeft / getModeDuration(mode, focusDurationSeconds, breakDurationSeconds);

  // ── Mode transition animation ─────────────────────────────────────────────
  const transition = useSharedValue(0);

  useEffect(() => {
    transition.value = withTiming(mode === 'focus' ? 0 : 1, { duration: 800 });
  }, [mode]);

  const animatedBgStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      transition.value,
      [0, 1],
      ['#000000', '#080c10']
    );
    return { backgroundColor };
  });

  // ── Editable timer ────────────────────────────────────────────────────────
  const currentDuration = mode === 'focus' ? focusDurationSeconds : breakDurationSeconds;
  const isIdle = !isRunning && secondsLeft === currentDuration;

  // Which tab is active in the editor
  const [editTab, setEditTab] = useState<'focus' | 'break'>('focus');

  // Wheel indices — kept for both tabs simultaneously
  const [focusMinsIdx, setFocusMinsIdx] = useState(0);
  const [focusSecsIdx, setFocusSecsIdx] = useState(0);
  const [breakMinsIdx, setBreakMinsIdx] = useState(0);
  const [breakSecsIdx, setBreakSecsIdx] = useState(0);

  const [editVisible, setEditVisible] = useState(false);

  const openEditor = () => {
    if (!isIdle) return;
    // Pre-populate from current store values
    const fi = secsToIndices(focusDurationSeconds);
    const bi = secsToIndices(breakDurationSeconds);
    setFocusMinsIdx(fi.minsIdx);
    setFocusSecsIdx(fi.secsIdx);
    setBreakMinsIdx(bi.minsIdx);
    setBreakSecsIdx(bi.secsIdx);
    // Open to the current mode's tab
    setEditTab(mode);
    setEditVisible(true);
  };

  const confirmEdit = () => {
    const focusTotal = indicesToSecs(focusMinsIdx, focusSecsIdx);
    const breakTotal = indicesToSecs(breakMinsIdx, breakSecsIdx);
    if (focusTotal > 0) setFocusDurationSeconds(focusTotal);
    if (breakTotal > 0) setBreakDurationSeconds(breakTotal);
    setEditVisible(false);
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
        <Ionicons name="menu" size={28} color="#666" />
        <Text style={styles.focusTitle}>FOCUS</Text>
        <Ionicons name="options-outline" size={26} color="#666" />
      </View>

      {/* MODE */}
      <Text style={styles.modeText}>
        {mode === 'focus' ? 'DEEP WORK' : 'BREAK'}
      </Text>

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
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEditVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalCard}>
                <View style={styles.modalHandle} />

                <Text style={styles.modalTitle}>SET DURATION</Text>

                {/* Focus / Break tab switcher */}
                <View style={styles.tabRow}>
                  <Pressable
                    style={[styles.tab, editTab === 'focus' && styles.tabActive]}
                    onPress={() => setEditTab('focus')}
                  >
                    <Text style={[styles.tabText, editTab === 'focus' && styles.tabTextActive]}>
                      FOCUS
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.tab, editTab === 'break' && styles.tabActive]}
                    onPress={() => setEditTab('break')}
                  >
                    <Text style={[styles.tabText, editTab === 'break' && styles.tabTextActive]}>
                      BREAK
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
                  ) : (
                    <>
                      <WheelPicker
                        items={MINUTES}
                        selectedIndex={breakMinsIdx}
                        onChange={setBreakMinsIdx}
                        width={100}
                      />
                      <Text style={styles.pickerSeparator}>:</Text>
                      <WheelPicker
                        items={SECONDS}
                        selectedIndex={breakSecsIdx}
                        onChange={setBreakSecsIdx}
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
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1A1A1A',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 48,
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
    backgroundColor: '#1E1E1E',
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