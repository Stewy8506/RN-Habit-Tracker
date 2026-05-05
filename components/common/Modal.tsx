import { PropsWithChildren } from 'react';
import { Modal as RNModal, Pressable, StyleSheet } from 'react-native';

type ModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

export function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.content}>{children}</Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    width: '100%',
  },
});
