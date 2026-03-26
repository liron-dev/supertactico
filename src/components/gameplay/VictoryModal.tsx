import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useGame } from '../../state/GameContext';

export default function VictoryModal() {
  const { state, dispatch } = useGame();
  if (state.phase !== 'victory' || !state.winner) return null;

  const playerColor = state.winner === 'yellow' ? '#f59e0b' : '#3b82f6';

  return (
    <Modal transparent animationType="fade" visible>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.85)',
        }}
      >
        <View
          style={{
            backgroundColor: '#0f1d2e',
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            minWidth: 340,
            borderWidth: 2,
            borderColor: playerColor,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {'\u{1F3C6}'}
          </Text>
          <Text
            style={{
              color: '#e2e8f0',
              fontSize: 14,
              fontWeight: '600',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            VICTORY
          </Text>
          <Text
            style={{
              color: playerColor,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            {state.winner} WINS!
          </Text>
          <Text
            style={{
              color: '#829ab1',
              fontSize: 13,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            The enemy flag has been captured{'\n'}and returned to the home island!
          </Text>

          <Pressable
            onPress={() => dispatch({ type: 'RESET_GAME' })}
            style={({ pressed }: any) => ({
              backgroundColor: pressed ? playerColor + 'cc' : playerColor,
              paddingVertical: 12,
              paddingHorizontal: 36,
              borderRadius: 8,
            })}
          >
            <Text style={{ color: '#0a1929', fontWeight: '700', fontSize: 14 }}>
              Play Again
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
