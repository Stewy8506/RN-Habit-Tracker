import { triggerNativeAlarm } from '@/modules/dnd-controller/src';
import { Vibration } from 'react-native';

export async function triggerTimerAlarm() {
  if (triggerNativeAlarm()) {
    return true;
  }

  Vibration.vibrate([0, 600, 250, 600, 250, 600]);
  return false;
}
