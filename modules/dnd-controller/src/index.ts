import { requireOptionalNativeModule } from 'expo-modules-core';
import { Linking, Platform } from 'react-native';

type DndControllerModule = {
  isAvailable: () => boolean;
  hasPolicyAccess: () => boolean;
  openPolicyAccessSettings: () => boolean;
  enableDnd: () => boolean;
  disableDnd: () => boolean;
};

const DndController = requireOptionalNativeModule<DndControllerModule>('DndController');

export function isNativeDndAvailable() {
  return Platform.OS === 'android' && DndController?.isAvailable() === true;
}

export function hasDndPolicyAccess() {
  return DndController?.hasPolicyAccess() === true;
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
  return DndController?.enableDnd() === true;
}

export function disableNativeDnd() {
  return DndController?.disableDnd() === true;
}
