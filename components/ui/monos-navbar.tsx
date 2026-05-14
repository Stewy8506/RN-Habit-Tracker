import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassEffectView } from 'react-native-glass-effect-view';
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
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.shadow}>
        <GlassEffectView appearance="dark" useNative={false} style={styles.pill}>
          {bar}
        </GlassEffectView>
      </View>
    </View>
  );
}

export default MonosNavbar;

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 48,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  shadow: {
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  pill: {
    height: 60,
    width: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(15,15,15,0.45)',
  },
  row: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
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
