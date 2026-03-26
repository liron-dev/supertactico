import React from 'react';
import { Pressable, View } from 'react-native';
import { CellState, Player, Position } from '../../types/game';
import PieceImage from './PieceImage';

interface CellProps {
  cell: CellState;
  row: number;
  col: number;
  size: number;
  viewingPlayer: Player;
  isSelected: boolean;
  isValidMove: boolean;
  isValidAttack: boolean;
  isLoadTarget: boolean;
  isSetupValid: boolean;
  onPress: (pos: Position) => void;
}

const TERRAIN_COLORS: Record<string, string> = {
  S: '#1e4d7a',   // Sea - deep blue
  L: '#3d6b35',   // Land - forest green
  I: '#9e7c3d',   // Island - sandy brown
};

const TERRAIN_COLORS_ALT: Record<string, string> = {
  S: '#1a4470',
  L: '#356030',
  I: '#8f7038',
};

export default React.memo(function Cell({
  cell,
  row,
  col,
  size,
  viewingPlayer,
  isSelected,
  isValidMove,
  isValidAttack,
  isLoadTarget,
  isSetupValid,
  onPress,
}: CellProps) {
  const isAltCell = (row + col) % 2 === 0;
  const bgColor = isAltCell
    ? TERRAIN_COLORS[cell.terrain]
    : TERRAIN_COLORS_ALT[cell.terrain];

  let borderColor = 'transparent';
  let borderWidth = 1;
  let overlayColor = 'transparent';

  if (isSelected) {
    borderColor = '#fbbf24';
    borderWidth = 2;
  } else if (isValidAttack) {
    overlayColor = 'rgba(239, 68, 68, 0.4)';
    borderColor = '#ef4444';
  } else if (isValidMove || isSetupValid) {
    overlayColor = 'rgba(34, 197, 94, 0.3)';
    borderColor = '#22c55e';
  } else if (isLoadTarget) {
    overlayColor = 'rgba(59, 130, 246, 0.35)';
    borderColor = '#3b82f6';
  }

  const pieceSize = size * 0.85;

  return (
    <Pressable
      onPress={() => onPress({ row, col })}
      style={({ hovered }: any) => ({
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderWidth,
        borderColor: hovered && borderColor === 'transparent' ? 'rgba(255,255,255,0.25)' : borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      })}
    >
      {overlayColor !== 'transparent' && (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: overlayColor,
          }}
        />
      )}
      {/* Valid move dot */}
      {(isValidMove || isSetupValid) && !cell.piece && (
        <View
          style={{
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: size * 0.125,
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
          }}
        />
      )}
      {cell.piece && (
        <PieceImage
          piece={cell.piece}
          viewingPlayer={viewingPlayer}
          size={pieceSize}
        />
      )}
    </Pressable>
  );
});
