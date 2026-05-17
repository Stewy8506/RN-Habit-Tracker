import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { stopTimerAlarm, triggerTimerAlarm } from '@/services/alarmService';
import { useTimerStore } from '@/store/useTimerStore';

export default function AlarmScreen() {
  const router = useRouter();
  const completedTimerName = useTimerStore((state) => state.completedTimerName);
  const pulse = useSharedValue(0);

  useEffect(() => {
    void triggerTimerAlarm();

    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );

    return () => stopTimerAlarm();
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.35,
    transform: [{ scale: 1 + pulse.value * 0.18 }],
  }));

  const stopAlarm = () => {
    stopTimerAlarm();
    router.replace('/today' as any);
  };

  return (
    <View style={styles.root}>
      <View style={styles.visual}>
        <Animated.View style={[styles.pulse, pulseStyle]} />
        <View style={styles.iconCircle}>
          <Ionicons name="alarm-outline" size={72} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>TIMER COMPLETE</Text>
        <Text style={styles.title}>{completedTimerName ?? 'Focus session'}</Text>
        <Text style={styles.subtitle}>Alarm is ringing</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={stopAlarm}
        style={({ pressed }) => [styles.stopButton, pressed && styles.stopButtonPressed]}>
        <Ionicons name="stop" size={24} color="#FFFFFF" />
        <Text style={styles.stopText}>Stop Alarm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    backgroundColor: '#050505',
    padding: 28,
  },
  visual: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#E5484D',
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D92D35',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  copy: {
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#A5A5A5',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    width: '100%',
    minHeight: 64,
    borderRadius: 8,
    backgroundColor: '#D92D35',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stopButtonPressed: {
    opacity: 0.82,
  },
  stopText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
});
