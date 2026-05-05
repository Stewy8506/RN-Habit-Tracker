import { StyleSheet, View } from 'react-native';

import { COLORS } from '@/utils/constants';

type ProgressRingProps = {
  progress: number;
};

export function ProgressRing({ progress }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    height: '100%',
  },
});
