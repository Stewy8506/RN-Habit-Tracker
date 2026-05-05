import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ensureAnonymousAuth, subscribeToAuth } from '@/services/authService';
import { upsertUser } from '@/services/firestoreService';
import { subscribeToDnd } from '@/services/dndService';
import { useSettingsStore } from '@/store/useSettingsStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setUserId = useSettingsStore((state) => state.setUserId);
  const setAuthLoading = useSettingsStore((state) => state.setAuthLoading);
  const setDndEnabled = useSettingsStore((state) => state.setDndEnabled);

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setUserId(user?.uid ?? null);
      setAuthLoading(false);
      if (user) {
        void upsertUser(user.uid);
      }
    });

    void ensureAnonymousAuth().catch(() => setAuthLoading(false));
    const unsubscribeDnd = subscribeToDnd(setDndEnabled);

    return () => {
      unsubscribeAuth();
      unsubscribeDnd();
    };
  }, [setAuthLoading, setDndEnabled, setUserId]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="focus" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
