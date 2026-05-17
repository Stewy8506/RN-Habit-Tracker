import { stopNativeAlarm, triggerNativeAlarm } from '@/modules/dnd-controller/src';
import { Vibration } from 'react-native';

export async function triggerTimerAlarm() {
  if (triggerNativeAlarm()) {
    return true;
  }

  Vibration.vibrate([0, 700, 250, 700, 250, 1100], true);
  return false;
}

export function stopTimerAlarm() {
  stopNativeAlarm();
  Vibration.cancel();
}
