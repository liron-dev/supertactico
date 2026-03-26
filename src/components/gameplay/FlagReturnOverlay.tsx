import React from 'react';
import { View, Text } from 'react-native';
import { useGame } from '../../state/GameContext';

export default function FlagReturnOverlay() {
  const { state } = useGame();
  if (state.phase !== 'flag-return' || !state.flagReturn) return null;

  const playerColor = state.flagReturn.player === 'yellow' ? '#f59e0b' : '#3b82f6';

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0f1d2e',
        padding: 12,
        borderBottomWidth: 2,
        borderBottomColor: playerColor,
        zIndex: 100,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: playerColor, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
        Flag Returned!
      </Text>
      <Text style={{ color: '#bcccdc', fontSize: 12, textAlign: 'center' }}>
        {state.flagReturn.player} player: tap any land cell (not island) to place your flag back.
      </Text>
    </View>
  );
}
