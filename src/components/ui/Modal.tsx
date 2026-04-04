import React from 'react';
import { View, Text, Pressable, Modal as RNModal } from 'react-native';

interface ModalProps {
  visible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export default function Modal({ visible, title, children, onClose }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View className="bg-navy-800 rounded-2xl p-6 mx-4 max-w-lg w-full" style={{ maxHeight: '80%' }}>
          {title && (
            <Text className="text-gold-400 text-xl font-bold mb-4 text-center">
              {title}
            </Text>
          )}
          {children}
          {onClose && (
            <Pressable
              onPress={onClose}
              className="mt-4 bg-navy-600 rounded-xl py-2 px-6 self-center active:opacity-80"
            >
              <Text className="text-white font-bold">Close</Text>
            </Pressable>
          )}
        </View>
      </View>
    </RNModal>
  );
}
