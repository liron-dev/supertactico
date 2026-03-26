import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useGame } from '../../state/GameContext';

export default function HandoffScreen() {
  const { state, dispatch } = useGame();

  const nextPlayer =
    state.phase === 'handoff-to-blue' ? 'blue' :
    state.phase === 'handoff-to-yellow' ? 'yellow' :
    state.currentPlayer;

  const playerColor = nextPlayer === 'yellow' ? '#f59e0b' : '#3b82f6';
  const isGameStart = state.phase === 'handoff-to-yellow' && state.turnNumber === 1;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a1929',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          padding: 40,
        }}
      >
        {/* Shield/emblem shape */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: playerColor + '20',
            borderWidth: 3,
            borderColor: playerColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: playerColor,
            }}
          />
        </View>

        <Text
          style={{
            color: '#627d98',
            fontSize: 14,
            fontWeight: '500',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {isGameStart ? 'All set! Game begins' : 'Pass the device to'}
        </Text>

        <Text
          style={{
            color: playerColor,
            fontSize: 32,
            fontWeight: '800',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {nextPlayer} Player
        </Text>

        {isGameStart && (
          <Text style={{ color: '#829ab1', fontSize: 14, marginBottom: 24 }}>
            Yellow goes first
          </Text>
        )}

        <Text
          style={{
            color: '#486581',
            fontSize: 13,
            textAlign: 'center',
            maxWidth: 300,
            marginTop: 8,
            marginBottom: 32,
            lineHeight: 20,
          }}
        >
          Make sure only the {nextPlayer} player can see the screen before continuing.
        </Text>

        <Pressable
          onPress={() => dispatch({ type: 'HANDOFF_COMPLETE' })}
          style={({ pressed }: any) => ({
            backgroundColor: pressed ? playerColor + 'cc' : playerColor,
            paddingVertical: 14,
            paddingHorizontal: 48,
            borderRadius: 10,
          })}
        >
          <Text style={{ color: '#0a1929', fontWeight: '800', fontSize: 16, letterSpacing: 1 }}>
            I'M READY
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
