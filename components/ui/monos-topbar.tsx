import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MonosTopbar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { height: insets.top + 54 }]}>
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.headerContent}>
          <Pressable style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="menu" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.appName}>MOMENTUM</Text>
          <Pressable
            style={styles.headerBtn}
            hitSlop={8}
            onPress={() => router.push('/(tabs)/settings')}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(10, 10, 10, 0.4)',
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 3,
  },
});

export default MonosTopbar;
