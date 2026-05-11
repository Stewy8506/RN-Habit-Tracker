import { PropsWithChildren } from 'react';
import { Pressable, Modal as RNModal, StyleSheet } from 'react-native';

import { useColors } from '@/hooks/use-colors';

type ModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

export function Modal({ visible, onClose, children }: ModalProps) {
  const colors = useColors();

  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
});
