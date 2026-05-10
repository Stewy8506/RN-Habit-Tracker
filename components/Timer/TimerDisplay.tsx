import { StyleSheet, Text, View } from 'react-native';

import { COLORS, getColors } from '@/utils/constants';
import { formatTime } from '@/utils/time';

type TimerDisplayProps = {
  secondsLeft: number;
  mode: 'focus' | 'break';
  colors?: ReturnType<typeof getColors>;
};

export function TimerDisplay({ secondsLeft, mode, colors = COLORS }: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.mode, { color: colors.muted }]}>{mode === 'focus' ? 'FOCUS' : 'BREAK'}</Text>
      <Text style={[styles.deepWork, { color: colors.text }]}>{mode === 'focus' ? 'DEEP WORK' : 'RELAX'}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.time, { color: colors.text }]}>
        {formatTime(secondsLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  mode: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  deepWork: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  time: {
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    marginTop: 16,
  },
});
