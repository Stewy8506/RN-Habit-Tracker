import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
    animatedProgress.value = withTiming(progress, {
      duration: 500,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset:
        circumference * (1 - animatedProgress.value),
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* BACKGROUND RING */}
        <Circle
          stroke={colors.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* PROGRESS RING */}
        <AnimatedCircle
          animatedProps={animatedProps}
          stroke={colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
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