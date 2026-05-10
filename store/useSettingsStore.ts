import { create } from 'zustand';

type ColorScheme = 'light' | 'dark';

type SettingsState = {
  userId: string | null;
  authLoading: boolean;
  dndEnabled: boolean;
  colorScheme: ColorScheme;
  setUserId: (userId: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setDndEnabled: (enabled: boolean) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  userId: null,
  authLoading: true,
  dndEnabled: false,
  colorScheme: 'light',
  setUserId: (userId) => set({ userId }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setDndEnabled: (dndEnabled) => set({ dndEnabled }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  toggleColorScheme: () =>
    set((state) => ({
      colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
    })),
}));
