import { BoardState, Player } from '../types/game';
import { getIslandCells } from '../constants/map';
import { isFootUnit, isMobileUnit } from '../constants/units';

// Check if a player has won by returning the enemy flag to their own island
export function checkVictory(board: BoardState): Player | null {
  // Check if any foot soldier carrying the enemy flag is on their own island
  for (const player of ['yellow', 'blue'] as Player[]) {
    const islandCells = getIslandCells(player);

    for (const cell of islandCells) {
      const piece = board[cell.row][cell.col].piece;
      if (
        piece &&
        piece.player === player &&
        piece.carryingFlag &&
        isFootUnit(piece.unitName)
      ) {
        return player;
      }
    }
  }

  return null;
}

// Check if a player has any mobile units left (alternative loss condition)
export function hasAnyMobileUnits(board: BoardState, player: Player): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.piece && cell.piece.player === player) {
        if (isMobileUnit(cell.piece.unitName)) return true;
      }
    }
  }
  return false;
}
