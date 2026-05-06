import {
  disableNativeDnd,
  enableNativeDnd,
  hasDndPolicyAccess,
  isNativeDndAvailable,
  openDndPolicyAccessSettings,
} from '@/modules/dnd-controller/src';

type DndListener = (enabled: boolean) => void;

let enabled = false;
let nativeControlled = false;
const listeners = new Set<DndListener>();

function emit() {
  listeners.forEach((listener) => listener(enabled));
}

export async function enableDnd() {
  nativeControlled = enableNativeDnd();
  enabled = nativeControlled || true;
  emit();
  return nativeControlled;
}

export async function disableDnd() {
  nativeControlled = false;
  disableNativeDnd();
  enabled = false;
  emit();
}

export function getDndEnabled() {
  return enabled;
}

export function getDndStatus() {
  return {
    enabled,
    nativeAvailable: isNativeDndAvailable(),
    nativeControlled,
    policyAccessGranted: hasDndPolicyAccess(),
  };
}

export async function requestDndPolicyAccess() {
  return openDndPolicyAccessSettings();
}

export function subscribeToDnd(listener: DndListener) {
  listeners.add(listener);
  listener(enabled);
  return () => listeners.delete(listener);
}
