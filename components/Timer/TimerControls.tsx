import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';

type TimerControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function TimerControls({ isRunning, onStart, onPause, onReset }: TimerControlsProps) {
  return (
    <View style={styles.container}>
      <Button
        style={styles.primary}
        title={isRunning ? 'Pause' : 'Start'}
        onPress={isRunning ? onPause : onStart}
      />
      <Button title="Reset" variant="secondary" onPress={onReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  primary: {
    flex: 1,
  },
});
