import { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const ITEM_HEIGHT = 56;
const VISIBLE = 5; // must be odd
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE / 2);

type WheelPickerProps = {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
};

export function WheelPicker({
  items,
  selectedIndex,
  onChange,
  width = 90,
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to initial position after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  const settle = useCallback(
    (y: number) => {
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
      onChange(clamped);
    },
    [items.length, onChange]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      settle(e.nativeEvent.contentOffset.y);
    },
    [settle]
  );

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      settle(e.nativeEvent.contentOffset.y);
    },
    [settle]
  );

  return (
    <View style={[styles.container, { width, height: PICKER_HEIGHT }]}>
      {/*
        IMPORTANT ORDER: ScrollView first (lowest z-index).
        Overlays come after, all wrapped in View with pointerEvents="none"
        so they never intercept touch events from the ScrollView.
      */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: PADDING }}
      >
        {items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Selection band — View wrapper ensures pointerEvents="none" is respected */}
      <View
        pointerEvents="none"
        style={[styles.selectionBand, { top: PADDING, height: ITEM_HEIGHT }]}
      />

      {/* Top fade — wrap in View so LinearGradient doesn't intercept touches */}
      <View
        pointerEvents="none"
        style={[styles.fadeOverlay, { top: 0, height: PADDING }]}
      >
        <LinearGradient
          colors={['#0D0D0D', 'rgba(13,13,13,0)']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Bottom fade */}
      <View
        pointerEvents="none"
        style={[styles.fadeOverlay, { bottom: 0, height: PADDING }]}
      >
        <LinearGradient
          colors={['rgba(13,13,13,0)', '#0D0D0D']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: 1,
  },

  selectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
    backgroundColor: '#161616',
  },

  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
