import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);

type CircularProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  colors?: {
    primary: string;
    border: string;
  };
};

export function CircularProgressRing({
  progress,
  size = 320,
  strokeWidth = 5,
  colors = {
    primary: '#9CA3AF',
    border: '#1A1A1A',
  },
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 600 });
  }, [progress]);

  // Each circle needs its own animated props using its own circumference
  // so the arc progress angle matches the main ring exactly.
  const mainAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  // Canvas padding must fit the widest glow layer
  const padding = 12;
  const canvasSize = size + padding * 2;
  const center = canvasSize / 2;

  return (
    <View style={styles.container}>
      <Svg width={canvasSize} height={canvasSize}>

        {/* BACKGROUND TRACK */}
        <Circle
          stroke={colors.border}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* MAIN PROGRESS ARC */}
        <AnimatedCircle
          animatedProps={mainAnimatedProps}
          stroke={colors.primary}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          opacity={1}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});