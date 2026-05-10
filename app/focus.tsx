import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CircularProgressRing } from '@/components/Timer/CircularProgressRing';
import { useTimer } from '@/hooks/useTimer';
import { getModeDuration } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';

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
  } = useTimer();

  const progress =
    1 - secondsLeft / getModeDuration(mode, focusDurationSeconds, breakDurationSeconds);

  const handleSkip = useCallback(() => {
    const currentMode = useTimerStore.getState().mode;
    const nextMode = currentMode === 'focus' ? 'break' : 'focus';

    const setMode = useTimerStore.getState().setMode;

    const breakDurationSeconds = useTimerStore.getState().breakDurationSeconds;

    const focusDurationSeconds = useTimerStore.getState().focusDurationSeconds;

    setMode(
      nextMode,
      getModeDuration(
        nextMode,
        focusDurationSeconds,
        breakDurationSeconds
      )
    );
  }, []);

  useEffect(() => {
    if (userId) {
      setTodayStats({
        duration: 4.5 * 60 * 60,
        streak: 12,
      });
    }
  }, [userId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}.${Math.floor((minutes / 60) * 10)}h`;
    }

    return `${minutes}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');

    const secs = (seconds % 60)
      .toString()
      .padStart(2, '0');

    return `${mins}:${secs}`;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    >
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
          colors={{
            primary: '#9CA3AF',
            border: '#1A1A1A',
          }}
        />

        <View style={styles.timerTextContainer}>
          <Text style={styles.timerText}>
            {formatTime(secondsLeft)}
          </Text>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <Pressable
          style={styles.playButton}
          onPress={isRunning ? pause : start}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={34}
            color="#FFF"
          />
        </Pressable>

        <View style={styles.secondaryControls}>
          <Pressable onPress={reset}>
            <Text style={styles.controlText}>RESET</Text>
          </Pressable>

          <Pressable onPress={handleSkip}>
            <Text style={styles.controlText}>SKIP</Text>
          </Pressable>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TODAY</Text>

          <Text style={styles.statValue}>
            {formatDuration(todayStats.duration)}
          </Text>

          <Ionicons
            name="timer-outline"
            size={22}
            color="#6B7280"
            style={styles.statIcon}
          />
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STREAK</Text>

          <Text style={styles.statValue}>
            {todayStats.streak}
          </Text>

          <Ionicons
            name="git-network-outline"
            size={22}
            color="#6B7280"
            style={styles.statIcon}
          />
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SLEEP</Text>

          <Text style={styles.statValue}>7h</Text>

          <Ionicons
            name="moon-outline"
            size={22}
            color="#6B7280"
            style={styles.statIcon}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
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
    fontSize: 24,
    letterSpacing: 5,
    fontWeight: '600',
    marginBottom: 50,
  },

  timerWrapper: {
    width: 340,
    height: 340,
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
});