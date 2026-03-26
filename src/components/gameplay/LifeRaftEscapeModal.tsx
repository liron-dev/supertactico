import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useGame } from '../../state/GameContext';

export default function LifeRaftEscapeModal() {
  const { state, dispatch } = useGame();
  if (state.phase !== 'life-raft-escape' || !state.lifeRaftEscape) return null;

  const { lifeRaft } = state.lifeRaftEscape;
  const soldierCount = lifeRaft.cargo.length;

  return (
    <Modal transparent animationType="fade" visible>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}
      >
        <View
          style={{
            backgroundColor: '#0f1d2e',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            maxWidth: 340,
            borderWidth: 1,
            borderColor: '#38bdf8',
          }}
        >
          <Text style={{ color: '#38bdf8', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
            Life Raft Escape!
          </Text>
          <Text
            style={{
              color: '#bcccdc',
              fontSize: 13,
              textAlign: 'center',
              marginBottom: 8,
              lineHeight: 20,
            }}
          >
            A life raft with {soldierCount} soldier{soldierCount !== 1 ? 's' : ''} can escape
            the sinking ship!
          </Text>
          <Text
            style={{
              color: '#627d98',
              fontSize: 12,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Tap an adjacent sea cell on the board to place the life raft, or skip.
          </Text>

          <Pressable
            onPress={() => dispatch({ type: 'SKIP_LIFE_RAFT_ESCAPE' })}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 24,
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <Text style={{ color: '#829ab1', fontSize: 13 }}>Skip Escape</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
