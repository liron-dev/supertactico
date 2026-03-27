import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Unit, Position, Player } from '../game/types';
import { MAP_DATA } from '../game/constants';
import UnitPiece from './UnitPiece';

interface Props {
  row: number;
  col: number;
  unit: Unit | null;
  viewingPlayer: Player;
  isSelected: boolean;
  isValidMove: boolean;
  isValidAttack: boolean;
  isValidLoad: boolean;
  isValidUnload: boolean;
  isValidSetup: boolean;
  onPress: (pos: Position) => void;
  cellSize: number;
}

const TERRAIN_COLORS = {
  S: '#1a3a5c',
  L: '#2d5a1b',
  I: '#b8860b',
};

const TERRAIN_BORDER_COLORS = {
  S: '#0d2236',
  L: '#1a3610',
  I: '#8a6200',
};

export default function Cell({
  row, col, unit, viewingPlayer,
  isSelected, isValidMove, isValidAttack, isValidLoad, isValidUnload, isValidSetup,
  onPress, cellSize,
}: Props) {
  const terrain = MAP_DATA[row][col];
  const bgColor = TERRAIN_COLORS[terrain];
  const borderColor = TERRAIN_BORDER_COLORS[terrain];

  const handlePress = () => onPress({ row, col });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
    >
      {/* Highlight overlays */}
      {isSelected && (
        <View style={[styles.overlay, styles.selectedOverlay]} />
      )}
      {isValidMove && !isSelected && (
        <View style={[styles.overlay, styles.moveOverlay]} />
      )}
      {isValidAttack && (
        <View style={[styles.overlay, styles.attackOverlay]} />
      )}
      {isValidLoad && (
        <View style={[styles.overlay, styles.loadOverlay]} />
      )}
      {isValidUnload && (
        <View style={[styles.overlay, styles.unloadOverlay]} />
      )}
      {isValidSetup && (
        <View style={[styles.overlay, styles.setupOverlay]} />
      )}

      {/* Unit piece */}
      {unit && (
        <View style={styles.unitContainer}>
          <UnitPiece unit={unit} viewingPlayer={viewingPlayer} size={cellSize - 2} />
        </View>
      )}

      {/* Selected ring */}
      {isSelected && <View style={[styles.selectedRing, { borderColor: '#FFD700' }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  selectedOverlay: {
    backgroundColor: 'rgba(255,215,0,0.25)',
  },
  moveOverlay: {
    backgroundColor: 'rgba(0,200,80,0.35)',
  },
  attackOverlay: {
    backgroundColor: 'rgba(220,30,30,0.4)',
  },
  loadOverlay: {
    backgroundColor: 'rgba(60,130,255,0.4)',
  },
  unloadOverlay: {
    backgroundColor: 'rgba(150,80,255,0.4)',
  },
  setupOverlay: {
    backgroundColor: 'rgba(0,220,100,0.25)',
  },
  unitContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
  },
});
