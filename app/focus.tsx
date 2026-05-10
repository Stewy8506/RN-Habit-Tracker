import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CircularProgressRing } from '@/components/Timer/CircularProgressRing';
import { TimerControls } from '@/components/Timer/TimerControls';
import { TimerDisplay } from '@/components/Timer/TimerDisplay';
import { useTimer } from '@/hooks/useTimer';
import { getModeDuration } from '@/services/timerService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { getColors } from '@/utils/constants';

export default function FocusScreen() {
  const userId = useSettingsStore((state) => state.userId);
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const toggleColorScheme = useSettingsStore((state) => state.toggleColorScheme);
  const [todayStats, setTodayStats] = useState({ duration: 0, streak: 0 });

  const colors = getColors(colorScheme);

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

  // Calculate skip handler
  const handleSkip = useCallback(() => {
    const currentMode = useTimerStore.getState().mode;
    const nextMode = currentMode === 'focus' ? 'break' : 'focus';
    const setMode = useTimerStore.getState().setMode;
    const breakDurationSeconds = useTimerStore.getState().breakDurationSeconds;
    const focusDurationSeconds = useTimerStore.getState().focusDurationSeconds;

    setMode(nextMode, getModeDuration(nextMode, focusDurationSeconds, breakDurationSeconds));
  }, []);

  // TODO: Fetch actual today stats and streak from Firestore
  useEffect(() => {
    if (userId) {
      // Placeholder: In a real implementation, fetch from Firestore
      // For now, set mock values matching the screenshot
      setTodayStats({ duration: 4.5 * 60 * 60, streak: 12 });
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

  return (
    <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]} scrollEnabled={false}>
      {/* Theme Toggle Button */}
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        <Pressable style={styles.themeButton} onPress={toggleColorScheme} hitSlop={8}>
          <Ionicons
            name={colorScheme === 'light' ? 'moon' : 'sunny'}
            size={24}
            color={colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Timer Section */}
        <View style={styles.timerSection}>
          <TimerDisplay mode={mode} secondsLeft={secondsLeft} colors={colors} />

          {/* Circular Progress Ring */}
          <View style={styles.progressRingContainer}>
            <CircularProgressRing progress={progress} size={260} strokeWidth={6} colors={colors} />
          </View>

          {/* Controls */}
          <TimerControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={handleSkip}
            colors={colors}
          />
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>TODAY</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(todayStats.duration)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>STREAK</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{todayStats.streak}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  spacer: {
    flex: 1,
  },
  themeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  timerSection: {
    alignItems: 'center',
    gap: 32,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
    marginVertical: 20,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
});
