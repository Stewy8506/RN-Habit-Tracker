import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { auth } from '@/config/firebase';
import { useColors } from '@/hooks/use-colors';
import { signInWithGoogle } from '@/services/authService';
import { disableDnd, enableDnd, getDndStatus, requestDndPolicyAccess } from '@/services/dndService';
import { updateUserTimerSettings } from '@/services/firestoreService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { warnOnReject } from '@/utils/promises';

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
  const triggerAlarmEnabled = useSettingsStore((state) => state.triggerAlarmEnabled);
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const shortBreakDurationSeconds = useTimerStore((state) => state.shortBreakDurationSeconds);
  const longBreakDurationSeconds = useTimerStore((state) => state.longBreakDurationSeconds);
  const longBreakInterval = useSettingsStore((state) => state.longBreakInterval);
  const setFocusDurationMinutes = useTimerStore((state) => state.setFocusDurationMinutes);
  const setShortBreakDurationMinutes = useTimerStore((state) => state.setShortBreakDurationMinutes);
  const setLongBreakDurationMinutes = useTimerStore((state) => state.setLongBreakDurationMinutes);
  const setLongBreakInterval = useSettingsStore((state) => state.setLongBreakInterval);
  const setTriggerAlarmEnabled = useSettingsStore((state) => state.setTriggerAlarmEnabled);
  const dndStatus = getDndStatus();

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.warn('Google connection failed:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleDnd = (enabled: boolean) => {
    void (enabled ? enableDnd() : disableDnd());
  };

  const toggleTriggerAlarm = (enabled: boolean) => {
    setTriggerAlarmEnabled(enabled);
    if (userId) {
      warnOnReject('Alarm setting save', updateUserTimerSettings(userId, { triggerAlarmEnabled: enabled }));
    }
  };

  const updateFocusMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setFocusDurationMinutes(minutes);
    if (userId) {
      warnOnReject('Focus duration save', updateUserTimerSettings(userId, { focusDurationSeconds: seconds }));
    }
  };

  const updateShortBreakMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setShortBreakDurationMinutes(minutes);
    if (userId) {
      warnOnReject('Short break duration save', updateUserTimerSettings(userId, { shortBreakDurationSeconds: seconds }));
    }
  };

  const updateLongBreakMinutes = (value: string) => {
    const minutes = clampMinutes(value);
    const seconds = minutes * 60;
    setLongBreakDurationMinutes(minutes);
    if (userId) {
      warnOnReject('Long break duration save', updateUserTimerSettings(userId, { longBreakDurationSeconds: seconds }));
    }
  };

  const updateLongBreakInterval = (value: string) => {
    if (value === '') {
      setLongBreakInterval(1);
      return;
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    const interval = Math.min(10, Math.max(1, numValue));
    setLongBreakInterval(interval);
    if (userId) {
      warnOnReject('Long break interval save', updateUserTimerSettings(userId, { longBreakInterval: interval }));
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
        <View style={[styles.row, { alignItems: 'center' }]}>
          <View style={[styles.rowText, { gap: 4 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Account status</Text>
            {authLoading ? (
              <Text style={[styles.value, { color: colors.muted }]}>Signing in...</Text>
            ) : auth.currentUser ? (
              <View style={styles.accountContainer}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, auth.currentUser.isAnonymous ? styles.guestBadge : styles.googleBadge]}>
                    <Ionicons 
                      name={auth.currentUser.isAnonymous ? "person-outline" : "logo-google"} 
                      size={10} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.badgeText}>
                      {auth.currentUser.isAnonymous ? 'GUEST' : 'GOOGLE'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.value, { color: colors.muted }]} numberOfLines={1}>
                  {auth.currentUser.isAnonymous ? `ID: ${userId?.slice(0, 12)}...` : auth.currentUser.email}
                </Text>
              </View>
            ) : (
              <Text style={[styles.value, { color: colors.muted }]}>Unavailable</Text>
            )}
          </View>
          {auth.currentUser?.isAnonymous && (
            <Button
              title={googleLoading ? "Connecting..." : "Connect Google"}
              variant="secondary"
              disabled={googleLoading}
              onPress={handleGoogleLogin}
              style={{ minHeight: 38, height: 38, paddingHorizontal: 12, justifyContent: 'center' }}
            />
          )}
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
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.text }]}>Trigger alarm</Text>
            <Text style={[styles.value, { color: colors.muted }]}>Play the phone alarm when a timer finishes.</Text>
          </View>
          <Switch value={triggerAlarmEnabled} onValueChange={toggleTriggerAlarm} />
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
    paddingBottom: 110,
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
  // Account Status Styles
  accountContainer: {
    gap: 4,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  guestBadge: {
    backgroundColor: '#8E8E93',
  },
  googleBadge: {
    backgroundColor: '#34C759',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
