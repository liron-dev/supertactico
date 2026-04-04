import React from 'react';
import { View, Text } from 'react-native';
import { Player } from '../../types/unit';

interface FlagReplacementProps {
  player: Player;
}

export default function FlagReplacement({ player }: FlagReplacementProps) {
  const isYellow = player === 'yellow';

  return (
    <View className="bg-navy-800 border-t border-navy-600 px-4 py-3">
      <Text className="text-gold-400 text-base font-bold text-center mb-1">
        Flag Returned!
      </Text>
      <Text className="text-white/70 text-sm text-center">
        {isYellow ? 'Yellow' : 'Blue'}: Your flag has been returned.
        {'\n'}Tap any empty land cell (not island) to place it.
      </Text>
    </View>
  );
}
