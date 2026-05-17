import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { HabitList } from '@/components/Habit/HabitList';
import { useColors } from '@/hooks/use-colors';
import { useHabits } from '@/hooks/useHabits';
import { useTimerStore } from '@/store/useTimerStore';
import { Habit } from '@/types/habit';
import { compactTitle } from '@/utils/helpers';
import { useRouter } from 'expo-router';

export default function HabitsScreen() {
  const colors = useColors();
  const { habits, loading, error, addHabit, completeHabit, deleteHabit } = useHabits();
  const router = useRouter();
  const focusDurationSeconds = useTimerStore((state) => state.focusDurationSeconds);
  const setSelectedTaskId = useTimerStore((state) => state.setSelectedTaskId);
  const setSelectedTimerTargetType = useTimerStore((state) => state.setSelectedTimerTargetType);
  const setSelectedTimerType = useTimerStore((state) => state.setSelectedTimerType);
  const setSelectedTimerName = useTimerStore((state) => state.setSelectedTimerName);
  const setMode = useTimerStore((state) => state.setMode);
  const requestAutoStart = useTimerStore((state) => state.requestAutoStart);
  const [name, setName] = useState('');

  const submit = async () => {
    const nextName = compactTitle(name);
    if (!nextName) {
      return;
    }

    await addHabit({ name: nextName });
    setName('');
  };

  const startHabitTimer = (habit: Habit) => {
    const durationSeconds = Math.min((habit.durationMinutes ?? focusDurationSeconds / 60) * 60, focusDurationSeconds);

    setSelectedTaskId(habit.id);
    setSelectedTimerTargetType('habit');
    setSelectedTimerType(habit.timerType ?? 'regular');
    setSelectedTimerName(habit.name);
    setMode('focus', durationSeconds);
    requestAutoStart();
    router.push('/focus');
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
          onStartTimer={startHabitTimer}
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
