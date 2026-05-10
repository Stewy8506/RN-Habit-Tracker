import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  const isScrollingRef = useRef(false);
  const lastIndexRef = useRef(selectedIndex);

  // Scroll to selected position when selectedIndex changes
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0 && !isScrollingRef.current) {
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        const y = selectedIndex * ITEM_HEIGHT;
        scrollRef.current?.scrollTo({ y, animated: false });
      }, 10);
    }
  }, [selectedIndex]);

  const settle = useCallback(
    (y: number) => {
      isScrollingRef.current = false;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      
      // Trigger haptic feedback if index changed
      if (clamped !== lastIndexRef.current) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(err => {
            console.log('Haptics error:', err);
          });
        } catch (err) {
          console.log('Haptics try-catch error:', err);
        }
        lastIndexRef.current = clamped;
      }
      
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
      isScrollingRef.current = true;
      // Only settle if not currently in momentum scrolling
      const velocity = e.nativeEvent.velocity?.y || 0;
      if (Math.abs(velocity) < 0.2) {
        settle(e.nativeEvent.contentOffset.y);
      }
    },
    [settle]
  );

  const onScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
  }, []);

  return (
    <View style={[styles.container, { width, height: PICKER_HEIGHT }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={8}
        contentContainerStyle={{ paddingVertical: PADDING }}
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }} // Set initial position
      >
        {items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text 
              style={[
                styles.itemText,
                i === selectedIndex && styles.selectedItemText,
              ]}
            >
              {item}
            </Text>
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
    backgroundColor: '#0D0D0D',
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

  selectedItemText: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  selectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
  },

  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
