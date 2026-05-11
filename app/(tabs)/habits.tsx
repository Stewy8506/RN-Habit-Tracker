import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { HabitList } from '@/components/Habit/HabitList';
import { useColors } from '@/hooks/use-colors';
import { useHabits } from '@/hooks/useHabits';
import { compactTitle } from '@/utils/helpers';

export default function HabitsScreen() {
  const colors = useColors();
  const { habits, loading, error, addHabit, completeHabit, deleteHabit } = useHabits();
  const [name, setName] = useState('');

  const submit = async () => {
    const nextName = compactTitle(name);
    if (!nextName) {
      return;
    }

    await addHabit(nextName);
    setName('');
  };

  return (
    <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Habits</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Build a habit"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        />
        <Button disabled={!compactTitle(name)} title="Add" onPress={submit} />
      </View>
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily rhythm</Text>
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <HabitList
          habits={habits}
          loading={loading}
          emptyText="Add one daily habit to begin tracking a streak."
          onComplete={completeHabit}
          onDelete={deleteHabit}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
    padding: 20,
    paddingTop: 64,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  card: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    fontWeight: '700',
  },
});
