import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Unit, Player } from '../game/types';
import { getUnitImage } from '../game/unitImages';

interface Props {
  unit: Unit;
  viewingPlayer: Player;
  size: number;
}

export default function UnitPiece({ unit, viewingPlayer, size }: Props) {
  const isOwn = unit.player === viewingPlayer;
  const isRevealed = unit.isRevealed;
  const showTrue = isOwn || isRevealed;

  const imageSource = showTrue
    ? getUnitImage(unit.player, unit.type)
    : getUnitImage(unit.player, 'blank');

  const totalCargo = unit.cargo.length;
  const hasFlag = unit.carryingFlag;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="contain"
      />
      {totalCargo > 0 && (
        <View style={styles.cargoBadge}>
          <Text style={styles.cargoText}>{totalCargo}</Text>
        </View>
      )}
      {hasFlag && (
        <View style={styles.flagBadge}>
          <Text style={styles.flagText}>F</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cargoBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cargoText: {
    color: '#FFD700',
    fontSize: 9,
    fontWeight: 'bold',
  },
  flagBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    backgroundColor: 'rgba(220,0,0,0.85)',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
