import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, getColors } from '@/utils/constants';

type TimerControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip?: () => void;
  colors?: ReturnType<typeof getColors>;
};

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
  colors = COLORS,
}: TimerControlsProps) {
  return (
    <View style={styles.container}>
      {/* Play Button */}
      <Pressable
        style={[styles.playButton, { backgroundColor: colors.primary }]}
        onPress={isRunning ? onPause : onStart}
        hitSlop={10}
      >
        <Ionicons
          name={isRunning ? 'pause' : 'play'}
          size={40}
          color={colors.surface}
        />
      </Pressable>

      {/* Reset and Skip Buttons */}
      <View style={styles.buttonsRow}>
        <Pressable style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onReset} hitSlop={8}>
          <Ionicons name="refresh" size={20} color={colors.text} />
        </Pressable>
        {onSkip && (
          <Pressable style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onSkip} hitSlop={8}>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
});
