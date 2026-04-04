import React from 'react';
import { View, Image, Text } from 'react-native';
import { Player, UnitInstance, totalCargoCount } from '../../types/unit';
import { getUnitImage, getBlankImage } from '../../utils/imageMap';

interface PieceProps {
  unit: UnitInstance;
  isVisible: boolean; // Whether the current player can see this piece
  size: number;
}

export default function Piece({ unit, isVisible, size }: PieceProps) {
  const imageSource = isVisible
    ? getUnitImage(unit.type, unit.owner)
    : getBlankImage(unit.owner);

  const cargoTotal = totalCargoCount(unit.cargo);
  const imgSize = size * 0.88;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={imageSource}
        style={{ width: imgSize, height: imgSize, borderRadius: imgSize * 0.12 }}
        resizeMode="contain"
      />
      {/* Cargo count badge */}
      {cargoTotal > 0 && isVisible && (
        <View
          className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full items-center justify-center"
          style={{ width: size * 0.32, height: size * 0.32, minWidth: 14, minHeight: 14 }}
        >
          <Text
            className="text-white font-bold"
            style={{ fontSize: Math.max(size * 0.2, 8) }}
          >
            {cargoTotal}
          </Text>
        </View>
      )}
      {/* Hidden piece cargo indicator - show count on blank */}
      {cargoTotal > 0 && !isVisible && (
        <View
          className="absolute items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Text
            className="text-white font-bold"
            style={{ fontSize: Math.max(size * 0.35, 12) }}
          >
            {cargoTotal}
          </Text>
        </View>
      )}
      {/* Flag carrier indicator */}
      {unit.carryingEnemyFlag && isVisible && (
        <View
          className="absolute -bottom-0.5 -right-0.5 bg-amber-400 rounded-full items-center justify-center"
          style={{ width: size * 0.28, height: size * 0.28, minWidth: 12, minHeight: 12 }}
        >
          <Text style={{ fontSize: Math.max(size * 0.18, 7) }}>🚩</Text>
        </View>
      )}
    </View>
  );
}
