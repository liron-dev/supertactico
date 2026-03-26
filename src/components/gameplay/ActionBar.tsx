import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useGame } from '../../state/GameContext';
import { getUnitDef, isTransportUnit, isMobileUnit } from '../../constants/units';
import { getPieceImage } from '../../assets/images';
import { getTransportCapacity } from '../../constants/transport';

export default function ActionBar() {
  const { state, dispatch } = useGame();
  const player = state.currentPlayer;
  const playerColor = player === 'yellow' ? '#f59e0b' : '#3b82f6';

  const selectedPiece = state.selectedPosition
    ? state.board[state.selectedPosition.row][state.selectedPosition.col].piece
    : null;

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
      {/* Player & Turn Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: playerColor,
            marginRight: 8,
          }}
        />
        <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '700', flex: 1 }}>
          {player === 'yellow' ? 'Yellow' : 'Blue'}'s Turn
        </Text>
        <Text style={{ color: '#627d98', fontSize: 12 }}>
          Turn {state.turnNumber}
        </Text>
      </View>

      {/* Selected Piece Info */}
      {selectedPiece && selectedPiece.player === player ? (
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 8,
              backgroundColor: playerColor + '15',
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Image
              source={getPieceImage(selectedPiece.unitName, player)}
              style={{ width: 40, height: 40, borderRadius: 6 }}
              resizeMode="cover"
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '600' }}>
                {selectedPiece.unitName}
              </Text>
              {selectedPiece.carryingFlag && (
                <Text style={{ color: '#f59e0b', fontSize: 11 }}>
                  Carrying enemy flag
                </Text>
              )}
            </View>
          </View>

          {/* Cargo Display */}
          {selectedPiece.cargo.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#829ab1', fontSize: 11, fontWeight: '600', marginBottom: 4 }}>
                CARGO ({selectedPiece.cargo.length})
              </Text>
              {selectedPiece.cargo.map((c, idx) => (
                <Pressable
                  key={c.id}
                  onPress={() => dispatch({ type: 'SELECT_CARGO', cargoIndex: idx })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 4,
                    marginBottom: 2,
                    borderRadius: 6,
                    backgroundColor:
                      state.selectedCargoIndex === idx
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(255,255,255,0.04)',
                    borderWidth: state.selectedCargoIndex === idx ? 1 : 0,
                    borderColor: '#22c55e',
                  }}
                >
                  <Image
                    source={getPieceImage(c.unitName, player)}
                    style={{ width: 24, height: 24, borderRadius: 3 }}
                    resizeMode="cover"
                  />
                  <Text style={{ color: '#bcccdc', fontSize: 11, marginLeft: 6, flex: 1 }}>
                    {c.unitName}
                  </Text>
                  {c.carryingFlag && (
                    <Text style={{ fontSize: 10 }}>🚩</Text>
                  )}
                  {c.cargo.length > 0 && (
                    <Text style={{ color: '#627d98', fontSize: 10 }}>
                      +{c.cargo.length}
                    </Text>
                  )}
                </Pressable>
              ))}
              {state.selectedCargoIndex !== null && (
                <Text style={{ color: '#22c55e', fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                  Tap a green cell to unload
                </Text>
              )}
            </View>
          )}

          {/* Instructions */}
          <View style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
            <Text style={{ color: '#627d98', fontSize: 10, textAlign: 'center', lineHeight: 16 }}>
              {isMobileUnit(selectedPiece.unitName)
                ? '🟢 Move  🔴 Attack  🔵 Load'
                : 'Tap cargo to unload'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#627d98', fontSize: 12, textAlign: 'center' }}>
            Select one of your pieces to see available actions
          </Text>
        </View>
      )}

      {/* Deselect button */}
      {state.selectedPosition && (
        <Pressable
          onPress={() => dispatch({ type: 'DESELECT' })}
          style={{
            marginTop: 10,
            paddingVertical: 8,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#829ab1', fontSize: 12 }}>Deselect</Text>
        </Pressable>
      )}
    </View>
  );
}
