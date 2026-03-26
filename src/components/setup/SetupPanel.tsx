import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useGame } from '../../state/GameContext';
import { getPieceImage } from '../../assets/images';

export default function SetupPanel() {
  const { state, dispatch } = useGame();
  const player = state.currentPlayer;
  const pending = state.pendingSetup[player];
  const remaining = pending.reduce((sum, p) => sum + p.count, 0);

  const playerColor = player === 'yellow' ? '#f59e0b' : '#3b82f6';
  const playerBg = player === 'yellow' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)';

  return (
    <View
      style={{
        width: 220,
        backgroundColor: '#0f1d2e',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: playerColor + '40',
      }}
    >
      <Text
        style={{
          color: playerColor,
          fontSize: 16,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {player} Setup
      </Text>
      <Text
        style={{
          color: '#9fb3c8',
          fontSize: 12,
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        {remaining} pieces remaining
      </Text>

      <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
        {pending.map((piece, idx) => {
          if (piece.count <= 0) return null;
          const isSelected = state.selectedSetupPiece === idx;
          return (
            <Pressable
              key={piece.unitName}
              onPress={() => dispatch({ type: 'SELECT_SETUP_PIECE', index: idx })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 6,
                marginBottom: 3,
                borderRadius: 8,
                backgroundColor: isSelected ? playerColor + '30' : 'transparent',
                borderWidth: isSelected ? 1 : 0,
                borderColor: playerColor,
              }}
            >
              <Image
                source={getPieceImage(piece.unitName, player)}
                style={{ width: 32, height: 32, borderRadius: 4 }}
                resizeMode="cover"
              />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '600' }}>
                  {piece.unitName}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: playerColor + '30',
                  borderRadius: 10,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: playerColor, fontSize: 12, fontWeight: '700' }}>
                  ×{piece.count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {state.setupError && (
        <View style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 6 }}>
          <Text style={{ color: '#fca5a5', fontSize: 11, textAlign: 'center' }}>
            {state.setupError}
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => dispatch({ type: 'CONFIRM_SETUP' })}
        style={({ pressed }: any) => ({
          marginTop: 12,
          backgroundColor: pressed ? playerColor + 'cc' : playerColor,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
        })}
      >
        <Text style={{ color: '#0a1929', fontWeight: '700', fontSize: 14 }}>
          Confirm Setup
        </Text>
      </Pressable>
    </View>
  );
}
