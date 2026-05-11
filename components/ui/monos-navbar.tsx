import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RouteIconName = keyof typeof Ionicons.glyphMap;

const ROUTE_ICONS: Record<string, { idle: RouteIconName; active: RouteIconName }> = {
  index: { idle: 'home-outline', active: 'home' },
  today: { idle: 'checkmark-circle-outline', active: 'checkmark-circle' },
  settings: { idle: 'settings-outline', active: 'settings' },
};

export function MonosNavbar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => {
    const opts = descriptors[route.key]?.options as any;
    return opts?.href !== null && opts?.href !== undefined
      ? false
      : ROUTE_ICONS[route.name] !== undefined;
  });

  const items = visibleRoutes.map((route) => {
    const focused = state.routes[state.index]?.key === route.key;
    const iconSet = ROUTE_ICONS[route.name];
    const iconName = focused ? iconSet.active : iconSet.idle;
    const iconColor = focused ? '#FFFFFF' : 'rgba(255,255,255,0.38)';

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

    return (
      <Pressable key={route.key} onPress={onPress} style={styles.item}>
        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
      </Pressable>
    );
  });

  const bar = <View style={styles.row}>{items}</View>;

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {isLiquidGlassSupported ? (
        <LiquidGlassView interactive effect="clear" style={styles.pill}>
          {bar}
        </LiquidGlassView>
      ) : (
        <View style={styles.shadow}>
          <BlurView intensity={55} tint="dark" style={styles.pill}>
            <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
            {bar}
          </BlurView>
        </View>
      )}
    </View>
  );
}

export default MonosNavbar;

const styles = StyleSheet.create({
  safeArea: {
    paddingHorizontal: 48,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  shadow: {
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  pill: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(20,20,20,0.82)',
  },
  tint: {
    backgroundColor: 'rgba(15,15,15,0.7)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 46,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});
