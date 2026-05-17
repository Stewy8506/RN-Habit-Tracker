import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { MonosNavbar } from '@/components/ui/monos-navbar';
import { MonosTopbar } from '@/components/ui/monos-topbar';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* Tab Screens */}
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <MonosNavbar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons size={size} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="today"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <Ionicons size={size} name="checkmark-circle" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons size={size} name="settings-outline" color={color} />
            ),
          }}
        />
        {/* Legacy screens — hidden from nav */}
        <Tabs.Screen name="tasks" options={{ href: null }} />
        <Tabs.Screen name="habits" options={{ href: null }} />
      </Tabs>

      {/* Global Translucent Blurred Topbar */}
      <MonosTopbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
