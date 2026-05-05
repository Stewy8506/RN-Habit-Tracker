import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { HabitList } from '@/components/Habit/HabitList';
import { useHabits } from '@/hooks/useHabits';
import { COLORS } from '@/utils/constants';
import { compactTitle } from '@/utils/helpers';

export default function HabitsScreen() {
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
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Habits</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add a habit"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          style={styles.input}
        />
        <Button disabled={!compactTitle(name)} title="Add" onPress={submit} />
      </View>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Daily check-in</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  card: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    color: COLORS.danger,
  },
});
