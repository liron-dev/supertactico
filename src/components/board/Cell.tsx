import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { BoardCell, Position, TerrainType } from '../../types/board';
import { Player } from '../../types/unit';
import Piece from './Piece';

interface CellProps {
  cell: BoardCell;
  position: Position;
  size: number;
  isSelected: boolean;
  isValidMove: boolean;
  isValidAttack: boolean;
  isValidLoad: boolean;
  isValidFlagPickup: boolean;
  currentPlayer: Player | null;
  onPress: (position: Position) => void;
  dimmed?: boolean;
}

const TERRAIN_BG: Record<TerrainType, string> = {
  S: '#1a5276',
  L: '#d4a574',
  I: '#27ae60',
};

const TERRAIN_BG_DIMMED: Record<TerrainType, string> = {
  S: '#0e2a3d',
  L: '#8a6b4a',
  I: '#18693c',
};

export default React.memo(function Cell({
  cell,
  position,
  size,
  isSelected,
  isValidMove,
  isValidAttack,
  isValidLoad,
  isValidFlagPickup,
  currentPlayer,
  onPress,
  dimmed = false,
}: CellProps) {
  const bg = dimmed ? TERRAIN_BG_DIMMED[cell.terrain] : TERRAIN_BG[cell.terrain];

  const isVisible = cell.unit
    ? currentPlayer === cell.unit.owner
    : false;

  return (
    <Pressable
      onPress={() => onPress(position)}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        borderWidth: 0.5,
        borderColor: '#2c3e50',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 2,
            borderColor: '#f4d03f',
            borderRadius: 2,
            zIndex: 10,
          }}
        />
      )}

      {/* Valid move indicator */}
      {isValidMove && (
        <View
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: 'rgba(46, 204, 113, 0.6)',
            zIndex: 5,
          }}
        />
      )}

      {/* Valid flag pickup indicator */}
      {isValidFlagPickup && (
        <View
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: 'rgba(241, 196, 15, 0.7)',
            zIndex: 5,
          }}
        />
      )}

      {/* Valid attack indicator */}
      {isValidAttack && !cell.unit && (
        <View
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: 'rgba(231, 76, 60, 0.6)',
            zIndex: 5,
          }}
        />
      )}

      {/* Attack border on enemy unit */}
      {isValidAttack && cell.unit && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 2,
            borderColor: '#e74c3c',
            borderRadius: 2,
            zIndex: 5,
          }}
        />
      )}

      {/* Valid load indicator */}
      {isValidLoad && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 2,
            borderColor: '#3498db',
            borderRadius: 2,
            zIndex: 5,
          }}
        />
      )}

      {/* Dropped flag indicator */}
      {cell.droppedFlag && !cell.unit && (
        <Text style={{ fontSize: Math.max(size * 0.4, 14), zIndex: 3 }}>🚩</Text>
      )}

      {/* Unit piece */}
      {cell.unit && (
        <Piece unit={cell.unit} isVisible={isVisible} size={size} />
      )}
    </Pressable>
  );
});
