import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle: any =
  Animated.createAnimatedComponent(Circle);

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
  strokeWidth = 4,
  colors = {
    primary: '#A8AFBA',
    border: '#111111',
  },
}: CircularProgressRingProps) {
  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  const animatedProgress =
    useSharedValue(0);

  useEffect(() => {
    animatedProgress.value =
      withTiming(progress, {
        duration: 600,
      });
  }, [progress]);

  const animatedProps =
    useAnimatedProps(() => {
      return {
        strokeDashoffset:
          circumference *
          (1 - animatedProgress.value),
      };
    });

  return (
    <View style={styles.container}>
      {/* SUBTLE AMBIENT GRADIENT */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.045)',
          'rgba(255,255,255,0.015)',
          'rgba(0,0,0,0)',
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ambientGradient,
          {
            width: size + 40,
            height: size + 40,
            borderRadius:
              (size + 40) / 2,
          },
        ]}
      />

      {/* SVG RING */}
      <Svg width={size} height={size}>
        {/* BACKGROUND TRACK */}
        <Circle
          stroke={colors.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* SOFT GLOW STROKE */}
        <AnimatedCircle
          animatedProps={animatedProps}
          stroke="rgba(255,255,255,0.08)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          rotation="-90"
          origin={`${size / 2}, ${
            size / 2
          }`}
        />

        {/* MAIN PROGRESS */}
        <AnimatedCircle
          animatedProps={animatedProps}
          stroke={colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          rotation="-90"
          origin={`${size / 2}, ${
            size / 2
          }`}
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

  ambientGradient: {
    position: 'absolute',
    opacity: 0.45,
  },
});