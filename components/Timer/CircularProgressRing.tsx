import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { COLORS, getColors } from '@/utils/constants';

type CircularProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  colors?: ReturnType<typeof getColors>;
};

export function CircularProgressRing({
  progress,
  size = 280,
  strokeWidth = 8,
  colors = COLORS,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 300,
    });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = animatedProgress.value * 360;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const borderColor = colors.background === '#0F172A' ? '#334155' : '#E5E7EB';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor,
          },
        ]}
      />
      {/* Progress arc */}
      <Animated.View
        style={[
          styles.progressArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: colors.primary,
            borderRightColor: 'transparent',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
  },
});
