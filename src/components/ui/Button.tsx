import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

const VARIANT_CLASSES = {
  primary: 'bg-gold-400 active:bg-gold-500',
  secondary: 'bg-navy-600 active:bg-navy-700',
  danger: 'bg-red-600 active:bg-red-700',
  outline: 'border-2 border-gold-400 active:opacity-80',
};

const TEXT_CLASSES = {
  primary: 'text-navy-900 font-bold',
  secondary: 'text-white font-bold',
  danger: 'text-white font-bold',
  outline: 'text-gold-400 font-bold',
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  small = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${VARIANT_CLASSES[variant]} rounded-xl items-center justify-center ${
        small ? 'px-4 py-2' : 'px-8 py-3'
      } ${disabled ? 'opacity-40' : ''}`}
      style={style}
    >
      <Text className={`${TEXT_CLASSES[variant]} ${small ? 'text-sm' : 'text-base'}`}>
        {title}
      </Text>
    </Pressable>
  );
}
