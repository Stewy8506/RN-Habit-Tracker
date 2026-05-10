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

  // Outer glow layers — positioned so their INNER EDGE
  // starts exactly at the main ring's OUTER EDGE.
  // r_glow = radius + strokeWidth/2 + glowWidth/2
  const tightGlowWidth = 6;
  const tightGlowRadius = radius + strokeWidth / 2 + tightGlowWidth / 2;
  const tightGlowCircumference = 2 * Math.PI * tightGlowRadius;

  const wideGlowWidth = 18;
  const wideGlowRadius = radius + strokeWidth / 2 + tightGlowWidth + wideGlowWidth / 2;
  const wideGlowCircumference = 2 * Math.PI * wideGlowRadius;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 600 });
  }, [progress]);

  // Each circle needs its own animated props using its own circumference
  // so the arc progress angle matches the main ring exactly.
  const mainAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const tightGlowProps = useAnimatedProps(() => ({
    strokeDashoffset: tightGlowCircumference * (1 - animatedProgress.value),
  }));

  const wideGlowProps = useAnimatedProps(() => ({
    strokeDashoffset: wideGlowCircumference * (1 - animatedProgress.value),
  }));

  // Canvas padding must fit the widest glow layer
  const padding = wideGlowWidth + tightGlowWidth + 10;
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

        {/* WIDE OUTER GLOW — furthest out, most diffuse */}
        <AnimatedCircle
          animatedProps={wideGlowProps}
          stroke={colors.primary}
          fill="none"
          cx={center}
          cy={center}
          r={wideGlowRadius}
          strokeWidth={wideGlowWidth}
          strokeLinecap="butt"
          strokeDasharray={wideGlowCircumference}
          opacity={0.06}
          rotation="-90"
          origin={`${center}, ${center}`}
        />

        {/* TIGHT OUTER GLOW — just outside the ring edge */}
        <AnimatedCircle
          animatedProps={tightGlowProps}
          stroke={colors.primary}
          fill="none"
          cx={center}
          cy={center}
          r={tightGlowRadius}
          strokeWidth={tightGlowWidth}
          strokeLinecap="butt"
          strokeDasharray={tightGlowCircumference}
          opacity={0.2}
          rotation="-90"
          origin={`${center}, ${center}`}
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