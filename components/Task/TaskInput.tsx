import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { COLORS } from '@/utils/constants';
import { compactTitle } from '@/utils/helpers';

type TaskInputProps = {
  onSubmit: (title: string) => Promise<void> | void;
  placeholder?: string;
};

export function TaskInput({ onSubmit, placeholder = 'Add a task' }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const nextTitle = compactTitle(title);
    if (!nextTitle || saving) {
      return;
    }

    setSaving(true);
    await onSubmit(nextTitle);
    setTitle('');
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={submit}
        style={styles.input}
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
});
