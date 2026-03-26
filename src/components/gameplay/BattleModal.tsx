import React from 'react';
import { View, Text, Pressable, Image, Modal } from 'react-native';
import { useGame } from '../../state/GameContext';
import { getPieceImage } from '../../assets/images';

export default function BattleModal() {
  const { state, dispatch } = useGame();
  if (!state.showBattle || !state.lastBattle) return null;

  const { attacker, defender, winner } = state.lastBattle;

  const resultText =
    winner === 'attacker'
      ? `${attacker.unitName} wins!`
      : winner === 'defender'
      ? `${defender.unitName} wins!`
      : 'Both units destroyed!';

  const resultColor =
    winner === 'both_die' ? '#ef4444' : '#22c55e';

  return (
    <Modal transparent animationType="fade" visible>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.75)',
        }}
      >
        <View
          style={{
            backgroundColor: '#0f1d2e',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            minWidth: 320,
            borderWidth: 1,
            borderColor: '#243b53',
          }}
        >
          <Text
            style={{
              color: '#e2e8f0',
              fontSize: 18,
              fontWeight: '800',
              marginBottom: 20,
              letterSpacing: 1,
            }}
          >
            BATTLE
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            {/* Attacker */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  borderWidth: 2,
                  borderColor: winner === 'attacker' ? '#22c55e' : winner === 'both_die' ? '#ef4444' : '#ef4444',
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                <Image
                  source={getPieceImage(attacker.unitName, attacker.player)}
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </View>
              <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                {attacker.unitName}
              </Text>
              <Text
                style={{
                  color: attacker.player === 'yellow' ? '#f59e0b' : '#3b82f6',
                  fontSize: 10,
                  fontWeight: '500',
                }}
              >
                {attacker.player}
              </Text>
            </View>

            {/* VS */}
            <View style={{ marginHorizontal: 20, alignItems: 'center' }}>
              <Text style={{ color: '#627d98', fontSize: 24, fontWeight: '900' }}>
                VS
              </Text>
            </View>

            {/* Defender */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  borderWidth: 2,
                  borderColor: winner === 'defender' ? '#22c55e' : winner === 'both_die' ? '#ef4444' : '#ef4444',
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                <Image
                  source={getPieceImage(defender.unitName, defender.player)}
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </View>
              <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                {defender.unitName}
              </Text>
              <Text
                style={{
                  color: defender.player === 'yellow' ? '#f59e0b' : '#3b82f6',
                  fontSize: 10,
                  fontWeight: '500',
                }}
              >
                {defender.player}
              </Text>
            </View>
          </View>

          {/* Result */}
          <Text
            style={{
              color: resultColor,
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 6,
            }}
          >
            {resultText}
          </Text>

          {state.lastBattle.flagCaptured && (
            <Text style={{ color: '#f59e0b', fontSize: 13, marginBottom: 4 }}>
              Flag captured!
            </Text>
          )}
          {state.lastBattle.flagDropped && (
            <Text style={{ color: '#f59e0b', fontSize: 13, marginBottom: 4 }}>
              Flag dropped on the ground!
            </Text>
          )}
          {state.lastBattle.lifeRaftEscape && (
            <Text style={{ color: '#38bdf8', fontSize: 13, marginBottom: 4 }}>
              Life raft can escape!
            </Text>
          )}

          <Pressable
            onPress={() => dispatch({ type: 'DISMISS_BATTLE' })}
            style={({ pressed }: any) => ({
              marginTop: 16,
              backgroundColor: pressed ? '#1d4ed8' : '#3b82f6',
              paddingVertical: 10,
              paddingHorizontal: 32,
              borderRadius: 8,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
