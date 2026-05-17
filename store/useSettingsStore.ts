import { create } from 'zustand';

type ColorScheme = 'light' | 'dark';

type SettingsState = {
  userId: string | null;
  authLoading: boolean;
  dndEnabled: boolean;
  triggerAlarmEnabled: boolean;
  colorScheme: ColorScheme;
  longBreakInterval: number;
  activeTabIndex: number;
  prevTabIndex: number;
  setUserId: (userId: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setDndEnabled: (enabled: boolean) => void;
  setTriggerAlarmEnabled: (enabled: boolean) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setLongBreakInterval: (interval: number) => void;
  setActiveTabIndex: (index: number) => void;
  toggleColorScheme: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  userId: null,
  authLoading: true,
  dndEnabled: false,
  triggerAlarmEnabled: true,
  colorScheme: 'light',
  longBreakInterval: 2,
  activeTabIndex: 0,
  prevTabIndex: 0,
  setUserId: (userId) => set({ userId }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setDndEnabled: (dndEnabled) => set({ dndEnabled }),
  setTriggerAlarmEnabled: (triggerAlarmEnabled) => set({ triggerAlarmEnabled }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setLongBreakInterval: (longBreakInterval) => set({ longBreakInterval }),
  setActiveTabIndex: (activeTabIndex) =>
    set((state) => ({
      prevTabIndex: state.activeTabIndex,
      activeTabIndex,
    })),
  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
    })),
}));
