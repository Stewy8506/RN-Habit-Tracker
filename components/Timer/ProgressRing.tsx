import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

type ProgressRingProps = {
  progress: number;
};

export function ProgressRing({ progress }: ProgressRingProps) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}> 
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
    height: '100%',
  },
});
