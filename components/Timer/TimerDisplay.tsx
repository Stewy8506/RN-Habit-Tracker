import { StyleSheet, Text, View } from 'react-native';

import { formatTime } from '@/utils/time';

type TimerDisplayProps = {
  secondsLeft: number;
  mode: 'focus' | 'break';
};

export function TimerDisplay({ secondsLeft, mode }: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.mode}>{mode === 'focus' ? 'Focus' : 'Break'}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.time}>
        {formatTime(secondsLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mode: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  time: {
    color: '#0F172A',
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
});
