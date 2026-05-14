import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { useColors } from '@/hooks/use-colors';
import { CreateTaskInput } from '@/types/task';
import { compactTitle } from '@/utils/helpers';

type TaskInputProps = {
  onSubmit: (input: CreateTaskInput) => Promise<void> | void;
  placeholder?: string;
};

export function TaskInput({ onSubmit, placeholder = 'Add a task' }: TaskInputProps) {
  const colors = useColors();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const nextTitle = compactTitle(title);
    const durationMinutes = duration ? parseInt(duration, 10) : null;
    if (!nextTitle || saving) {
      return;
    }

    setSaving(true);
    await onSubmit({ title: nextTitle, durationMinutes });
    setTitle('');
    setDuration('');
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={submit}
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
      />
      <TextInput
        placeholder="Duration (minutes)"
        placeholderTextColor={colors.muted}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
      />
      <Button disabled={saving || !compactTitle(title)} title="Add" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
