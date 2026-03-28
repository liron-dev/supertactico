import { Piece, Player, PieceId } from "../types";
import { getPieceImageUri, getBlankImageUri } from "./assets";

export interface VisiblePieceData {
  imageUri: string;
  stackSize: number;
  isRevealed: boolean;
}

export function getVisiblePieceData(
  piece: Piece,
  viewingPlayer: Player,
  piecesById: Record<PieceId, Piece>
): VisiblePieceData {
  const isOwn = piece.owner === viewingPlayer;
  const stackSize = getTotalStackSize(piece, piecesById);

  if (isOwn) {
    return {
      imageUri: getPieceImageUri(piece.owner, piece.type),
      stackSize,
      isRevealed: true,
    };
  }

  return {
    imageUri: getBlankImageUri(piece.owner),
    stackSize,
    isRevealed: false,
  };
}

function getTotalStackSize(
  piece: Piece,
  piecesById: Record<PieceId, Piece>
): number {
  let count = 0;
  for (const id of piece.carriedPieceIds) {
    const carried = piecesById[id];
    if (carried && carried.isAlive) {
      count += 1 + getTotalStackSize(carried, piecesById);
    }
  }
  return count;
}
