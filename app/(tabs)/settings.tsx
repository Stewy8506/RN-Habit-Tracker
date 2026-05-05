import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { disableDnd, enableDnd } from '@/services/dndService';
import { useSettingsStore } from '@/store/useSettingsStore';
import { COLORS } from '@/utils/constants';

export default function SettingsScreen() {
  const userId = useSettingsStore((state) => state.userId);
  const authLoading = useSettingsStore((state) => state.authLoading);
  const dndEnabled = useSettingsStore((state) => state.dndEnabled);

  const toggleDnd = (enabled: boolean) => {
    void (enabled ? enableDnd() : disableDnd());
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
  value: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
