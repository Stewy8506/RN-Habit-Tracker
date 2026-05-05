import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ensureAnonymousAuth, subscribeToAuth } from '@/services/authService';
import { listenToUserSettings, upsertUser } from '@/services/firestoreService';
import { subscribeToDnd } from '@/services/dndService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setUserId = useSettingsStore((state) => state.setUserId);
  const setAuthLoading = useSettingsStore((state) => state.setAuthLoading);
  const setDndEnabled = useSettingsStore((state) => state.setDndEnabled);
  const userId = useSettingsStore((state) => state.userId);
  const setFocusDurationSeconds = useTimerStore((state) => state.setFocusDurationSeconds);
  const setBreakDurationSeconds = useTimerStore((state) => state.setBreakDurationSeconds);

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

  useEffect(() => {
    if (!userId) {
      return;
    }

    return listenToUserSettings(
      userId,
      (settings) => {
        if (settings.focusDurationSeconds) {
          setFocusDurationSeconds(settings.focusDurationSeconds);
        }
        if (settings.breakDurationSeconds) {
          setBreakDurationSeconds(settings.breakDurationSeconds);
        }
      },
      () => undefined,
    );
  }, [setBreakDurationSeconds, setFocusDurationSeconds, userId]);

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
