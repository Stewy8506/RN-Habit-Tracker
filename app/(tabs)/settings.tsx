import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useColors } from '@/hooks/use-colors';
import { disableDnd, enableDnd, getDndStatus, requestDndPolicyAccess } from '@/services/dndService';
import { updateUserTimerSettings } from '@/services/firestoreService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';

function clampMinutes(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(180, Math.max(1, Math.round(parsed)));
}

export default function SettingsScreen() {
  const colors = useColors();
  const userId = useSettingsStore((state) => state.userId);
  const authLoading = useSettingsStore((state) => state.authLoading);
  const dndEnabled = useSettingsStore((state) => state.dndEnabled);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const shortBreakDurationSeconds = useTimerStore((state) => state.shortBreakDurationSeconds);
  const longBreakDurationSeconds = useTimerStore((state) => state.longBreakDurationSeconds);
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval);
  const setFocusDurationMinutes = useTimerStore((state) => state.setFocusDurationMinutes);
  const setShortBreakDurationMinutes = useTimerStore((state) => state.setShortBreakDurationMinutes);
  const setLongBreakDurationMinutes = useTimerStore((state) => state.setLongBreakDurationMinutes);
  const setLongBreakInterval = useSettingsStore((state) => state.setLongBreakInterval);
  const dndStatus = getDndStatus();

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

  const updateShortBreakMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setShortBreakDurationMinutes(minutes);
    if (userId) {
      void updateUserTimerSettings(userId, { shortBreakDurationSeconds: seconds });
    }
  };

  const updateLongBreakMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setLongBreakDurationMinutes(minutes);
    if (userId) {
      void updateUserTimerSettings(userId, { longBreakDurationSeconds: seconds });
    }
  };

  const updateLongBreakInterval = (value: string) => {
    // Allow empty string for better UX while typing
    if (value === '') {
      setLongBreakInterval(1); // Temporary value while typing
      return;
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    const interval = Math.min(10, Math.max(1, numValue));
    setLongBreakInterval(interval);
    if (userId) {
      void updateUserTimerSettings(userId, { longBreakInterval: interval });
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Account status</Text>
            <Text style={[styles.value, { color: colors.muted }]}>{authLoading ? 'Signing in...' : userId ?? 'Unavailable'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Focus DND</Text>
            <Text style={[styles.value, { color: colors.muted }]}> 
              {dndStatus.nativeControlled
                ? 'Phone DND is managed while you focus.'
                : dndStatus.policyAccessGranted
                  ? 'DND access is available for this build.'
                  : 'Grant DND access to block distractions.'}
            </Text>
          </View>
          <Switch value={dndEnabled} onValueChange={toggleDnd} />
        </View>
        <Button
          title="Manage DND access"
          variant="secondary"
          onPress={() => void requestDndPolicyAccess()}
        />
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
            style={[styles.numberInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={String(Math.round(focusDurationSeconds / 60))}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>
        <View style={styles.durationRow}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Short break minutes</Text>
            <Text style={[styles.value, { color: colors.muted }]}>Recovery time after a focus session</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={updateShortBreakMinutes}
            selectTextOnFocus
            style={[styles.numberInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={String(Math.round(shortBreakDurationSeconds / 60))}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>
        <View style={styles.durationRow}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Long break minutes</Text>
            <Text style={[styles.value, { color: colors.muted }]}>Longer rest after repeated focus rounds</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={updateLongBreakMinutes}
            selectTextOnFocus
            style={[styles.numberInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={String(Math.round(longBreakDurationSeconds / 60))}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>

        <View style={styles.durationRow}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Long break intervals</Text>
            <Text style={[styles.value, { color: colors.muted }]}>Sessions before an extended recharge</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={updateLongBreakInterval}
            selectTextOnFocus
            style={[styles.numberInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={String(longBreakInterval)}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
    paddingBottom: 40,
    paddingTop: 64,
  },
  title: {
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
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
  },
  numberInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 12,
    textAlign: 'center',
    width: 76,
  },
});
