import { create } from 'zustand';

type SettingsState = {
  userId: string | null;
  authLoading: boolean;
  dndEnabled: boolean;
  setUserId: (userId: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setDndEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  userId: null,
  authLoading: true,
  dndEnabled: false,
  setUserId: (userId) => set({ userId }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setDndEnabled: (dndEnabled) => set({ dndEnabled }),
}));
