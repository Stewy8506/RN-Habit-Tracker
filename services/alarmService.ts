import { stopNativeAlarm, triggerNativeAlarm } from '@/modules/dnd-controller/src';
import { Vibration } from 'react-native';

export async function triggerTimerAlarm() {
  // Always trigger vibration for alarms
  Vibration.vibrate([0, 700, 250, 700, 250, 1100], true);

  // Also trigger the native alarm sound
  try {
    triggerNativeAlarm();
  } catch (error) {
    console.warn('Native alarm trigger failed', error);
  }
  return true;
}

export function stopTimerAlarm() {
  stopNativeAlarm();
  Vibration.cancel();
}
