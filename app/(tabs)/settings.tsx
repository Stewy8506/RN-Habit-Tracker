import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { disableDnd, enableDnd } from '@/services/dndService';
import { updateUserTimerSettings } from '@/services/firestoreService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { COLORS } from '@/utils/constants';

function clampMinutes(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(180, Math.max(1, Math.round(parsed)));
}

export default function SettingsScreen() {
  const userId = useSettingsStore((state) => state.userId);
  const authLoading = useSettingsStore((state) => state.authLoading);
  const dndEnabled = useSettingsStore((state) => state.dndEnabled);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const breakDurationSeconds = useTimerStore((state) => state.breakDurationSeconds);
  const setFocusDurationMinutes = useTimerStore((state) => state.setFocusDurationMinutes);
  const setBreakDurationMinutes = useTimerStore((state) => state.setBreakDurationMinutes);

  const toggleDnd = (enabled: boolean) => {
    void (enabled ? enableDnd() : disableDnd());
  };

  const updateFocusMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setFocusDurationMinutes(minutes);
    if (userId) {
      void updateUserTimerSettings(userId, { focusDurationSeconds: seconds });
    }
  };

  const updateBreakMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setBreakDurationMinutes(minutes);
    if (userId) {
      void updateUserTimerSettings(userId, { breakDurationSeconds: seconds });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Anonymous account</Text>
            <Text style={styles.value}>{authLoading ? 'Signing in...' : userId ?? 'Unavailable'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>DND during focus</Text>
            <Text style={styles.value}>
              {dndEnabled ? 'Simulated DND is enabled' : 'Simulated DND is off'}
            </Text>
          </View>
          <Switch value={dndEnabled} onValueChange={toggleDnd} />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.durationHeader}>
          <Text style={styles.sectionTitle}>Timer length</Text>
          <Text style={styles.value}>Changes apply immediately when the timer is not running.</Text>
        </View>
        <View style={styles.durationRow}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Focus minutes</Text>
            <Text style={styles.value}>How long one pomodoro lasts</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={updateFocusMinutes}
            selectTextOnFocus
            style={styles.numberInput}
            value={String(Math.round(focusDurationSeconds / 60))}
          />
        </View>
        <View style={styles.durationRow}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Break minutes</Text>
            <Text style={styles.value}>Recovery time after focus</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={updateBreakMinutes}
            selectTextOnFocus
            style={styles.numberInput}
            value={String(Math.round(breakDurationSeconds / 60))}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
    gap: 18,
    padding: 20,
    paddingTop: 64,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
  },
  card: {
    gap: 18,
  },
  durationHeader: {
    gap: 4,
  },
  durationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  value: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  numberInput: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 12,
    textAlign: 'center',
    width: 76,
  },
});
