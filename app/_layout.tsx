import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ensureAnonymousAuth, subscribeToAuth } from '@/services/authService';
import { subscribeToDnd } from '@/services/dndService';
import { listenToUserSettings, upsertUser } from '@/services/firestoreService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { warnOnReject } from '@/utils/promises';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldVibrate: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: true,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Request notification permissions and setup channel
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarm-channel', {
          name: 'Timer Alarm',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 700, 250, 700, 250, 1100],
          lightColor: '#FF231F7C',
          enableVibrate: true,
          bypassDnd: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
    })();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      // Tap notification -> push to alarm page
      setTimeout(() => {
        router.push('/alarm' as any);
      }, 0);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
  const setUserId = useSettingsStore((state) => state.setUserId);
  const setAuthLoading = useSettingsStore((state) => state.setAuthLoading);
  const setDndEnabled = useSettingsStore((state) => state.setDndEnabled);
  const userId = useSettingsStore((state) => state.userId);
  const setFocusDurationSeconds = useTimerStore((state) => state.setFocusDurationSeconds);
  const setShortBreakDurationSeconds = useTimerStore((state) => state.setShortBreakDurationSeconds);
  const setLongBreakDurationSeconds = useTimerStore((state) => state.setLongBreakDurationSeconds);
  const setLongBreakInterval = useSettingsStore((state) => state.setLongBreakInterval);
  const setTriggerAlarmEnabled = useSettingsStore((state) => state.setTriggerAlarmEnabled);

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setUserId(user?.uid ?? null);
      setAuthLoading(false);
      if (user) {
        warnOnReject('User bootstrap', upsertUser(user.uid));
      }
    });

    ensureAnonymousAuth().catch((error) => {
      console.warn('Anonymous auth failed', error);
      setAuthLoading(false);
    });
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
        if (settings.shortBreakDurationSeconds) {
          setShortBreakDurationSeconds(settings.shortBreakDurationSeconds);
        }
        if (settings.longBreakDurationSeconds) {
          setLongBreakDurationSeconds(settings.longBreakDurationSeconds);
        }
        if (settings.longBreakInterval) {
          setLongBreakInterval(settings.longBreakInterval);
        }
        if (typeof settings.triggerAlarmEnabled === 'boolean') {
          setTriggerAlarmEnabled(settings.triggerAlarmEnabled);
        }
      },
      (error) => console.warn('User settings listener failed', error),
    );
  }, [setFocusDurationSeconds, setShortBreakDurationSeconds, setLongBreakDurationSeconds, setLongBreakInterval, setTriggerAlarmEnabled, userId]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="focus" options={{ headerShown: false }} />
        <Stack.Screen name="alarm" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
