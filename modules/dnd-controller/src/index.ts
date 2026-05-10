import { requireOptionalNativeModule } from 'expo-modules-core';
import { Linking, Platform } from 'react-native';

type DndControllerModule = {
  isAvailable: () => boolean;
  hasPolicyAccess: () => boolean;
  getStatus: () => NativeDndStatus;
  openPolicyAccessSettings: () => boolean;
  enableDnd: () => boolean;
  disableDnd: () => boolean;
};

export type NativeDndStatus = {
  available: boolean;
  policyAccessGranted: boolean;
  interruptionFilter: number;
  lastError: string | null;
};

const unavailableStatus: NativeDndStatus = {
  available: false,
  policyAccessGranted: false,
  interruptionFilter: 0,
  lastError: null,
};

const DndController = requireOptionalNativeModule<DndControllerModule>('DndController');

export function isNativeDndAvailable() {
  return Platform.OS === 'android' && DndController?.isAvailable() === true;
}

export function hasDndPolicyAccess() {
  return DndController?.hasPolicyAccess() === true;
}

export function getNativeDndStatus() {
  if (Platform.OS !== 'android') {
    return unavailableStatus;
  }

  return DndController?.getStatus() ?? unavailableStatus;
}

export async function openDndPolicyAccessSettings() {
  if (DndController?.openPolicyAccessSettings()) {
    return true;
  }

  if (Platform.OS === 'android') {
    await Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS');
    return true;
  }

  return false;
}

export function enableNativeDnd() {
  if (DndController?.enableDnd() !== true) {
    return false;
  }

  return getNativeDndStatus().interruptionFilter === 3;
}

export function disableNativeDnd() {
  return DndController?.disableDnd() === true;
}
