import React from 'react';
import { View, Text } from 'react-native';
import { Player } from '../../types/unit';

interface TurnIndicatorProps {
  player: Player;
  turnNumber: number;
  actionTaken: boolean;
}

export default function TurnIndicator({ player, turnNumber, actionTaken }: TurnIndicatorProps) {
  const isYellow = player === 'yellow';
  const dotColor = isYellow ? '#f1c40f' : '#3498db';

  return (
    <View className="flex-row items-center justify-between bg-navy-800 px-4 py-2">
      <View className="flex-row items-center">
        <View
          style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor }}
          className="mr-2"
        />
        <Text className="text-white font-bold text-base">
          {isYellow ? 'Yellow' : 'Blue'}'s Turn
        </Text>
      </View>
      <Text className="text-white/60 text-sm">Turn #{turnNumber}</Text>
      {actionTaken && (
        <Text className="text-gold-400/80 text-xs">Action taken - End turn</Text>
      )}
    </View>
  );
}
