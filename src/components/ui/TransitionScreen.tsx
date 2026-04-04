import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Player } from '../../types/unit';

interface TransitionScreenProps {
  nextPlayer: Player;
  message?: string;
  onReady: () => void;
}

export default function TransitionScreen({ nextPlayer, message, onReady }: TransitionScreenProps) {
  const isYellow = nextPlayer === 'yellow';
  const bgColor = isYellow ? '#7d6608' : '#1a5276';
  const playerLabel = isYellow ? 'Yellow' : 'Blue';

  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: bgColor }}
    >
      <View className="items-center px-8">
        <Text className="text-white text-4xl font-bold mb-4 text-center">
          {playerLabel} Player
        </Text>
        <Text className="text-white/80 text-lg mb-2 text-center">
          {message || 'It\'s your turn!'}
        </Text>
        <Text className="text-white/60 text-base mb-8 text-center">
          Make sure the other player is not looking.
        </Text>
        <Pressable
          onPress={onReady}
          className="bg-white/20 border-2 border-white rounded-2xl px-12 py-4 active:bg-white/30"
        >
          <Text className="text-white text-2xl font-bold">I'm Ready</Text>
        </Pressable>
      </View>
    </View>
  );
}
