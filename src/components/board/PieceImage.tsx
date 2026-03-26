import React from 'react';
import { Image, View, Text } from 'react-native';
import { Piece, Player } from '../../types/game';
import { getPieceImage, getBlankImage } from '../../assets/images';

interface PieceImageProps {
  piece: Piece;
  viewingPlayer: Player;
  size: number;
}

export default React.memo(function PieceImage({ piece, viewingPlayer, size }: PieceImageProps) {
  const isOwn = piece.player === viewingPlayer;
  const imageSource = isOwn
    ? getPieceImage(piece.unitName, piece.player)
    : getBlankImage(piece.player);

  const cargoCount = piece.cargo.length;
  const showCargoCount = cargoCount > 0 && isOwn;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Image
        source={imageSource}
        style={{ width: size, height: size, borderRadius: size * 0.12 }}
        resizeMode="cover"
      />
      {showCargoCount && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: '#ef4444',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {cargoCount}
          </Text>
        </View>
      )}
      {piece.carryingFlag && isOwn && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            left: -2,
            backgroundColor: '#f59e0b',
            borderRadius: 6,
            width: 14,
            height: 14,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 8 }}>🚩</Text>
        </View>
      )}
    </View>
  );
});
