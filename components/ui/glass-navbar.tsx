import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';

type RouteIconName = keyof typeof Ionicons.glyphMap;

const icons: Record<string, RouteIconName> = {
  index: 'home',
  tasks: 'checkbox',
  habits: 'repeat',
  settings: 'settings',
};

export function GlassNavbar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const content = state.routes.map((route, index) => {
    const options = descriptors[route.key].options;
    const focused = state.index === index;
    const color = focused ? colors.primary : colors.muted;
    const label =
      typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <Pressable
        accessibilityLabel={options.tabBarAccessibilityLabel}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        key={route.key}
        onLongPress={onLongPress}
        onPress={onPress}
        style={styles.item}>
        <View style={[styles.iconBubble, focused && styles.activeBubble]}>
          <Ionicons color={color} name={icons[route.name] ?? 'ellipse'} size={22} />
        </View>
        <Text numberOfLines={1} style={[styles.label, { color }]}>
          {label}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {isLiquidGlassSupported ? (
        <LiquidGlassView interactive effect="clear" style={[styles.glass, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}>
          {content}
        </LiquidGlassView>
      ) : (
        <View style={styles.fallbackShadow}>
          <BlurView intensity={42} tint="dark" style={[styles.fallbackGlass, { borderColor: colors.border }]}> 
            <View pointerEvents="none" style={[styles.tintLayer, { backgroundColor: 'rgba(15, 23, 42, 0.42)' }]} />
            <View pointerEvents="none" style={styles.highlightLayer} />
            <View style={styles.contentRow}>{content}</View>
          </BlurView>
        </View>
      )}
    </View>
  );
}

export default GlassNavbar;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  glass: {
    alignItems: 'center',
    borderRadius: 28,
    flexDirection: 'row',
    gap: 4,
    minHeight: 70,
    overflow: 'hidden',
    padding: 8,
  },
  fallbackShadow: {
    borderRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  fallbackGlass: {
    borderRadius: 28,
    borderWidth: 1,
    minHeight: 70,
    overflow: 'hidden',
  },
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  highlightLayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 999,
    height: 36,
    opacity: 0.42,
    position: 'absolute',
    right: 14,
    top: 5,
    width: 72,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 70,
    padding: 8,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 54,
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 44,
  },
  activeBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    includeFontPadding: false,
  },
});
