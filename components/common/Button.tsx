import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useColors } from '@/hooks/use-colors';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        },
        variant === 'danger' && {
          backgroundColor: 'rgba(248, 81, 73, 0.14)',
          borderColor: colors.danger,
          borderWidth: 1,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          variant !== 'primary' && { color: colors.text },
          variant === 'danger' && { color: colors.danger },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
