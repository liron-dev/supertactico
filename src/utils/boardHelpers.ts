import { Position, BoardState, CellTerrain, Piece } from '../types/game';
import { BOARD_ROWS, BOARD_COLS } from '../constants/map';
import { isFootUnit } from '../constants/units';

export const DIRECTIONS: Position[] = [
  { row: -1, col: 0 }, // up
  { row: 1, col: 0 },  // down
  { row: 0, col: -1 }, // left
  { row: 0, col: 1 },  // right
];

export function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_ROWS && pos.col >= 0 && pos.col < BOARD_COLS;
}

export function getAdjacent(pos: Position): Position[] {
  return DIRECTIONS.map(d => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(isInBounds);
}

export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function getTerrain(board: BoardState, pos: Position): CellTerrain {
  return board[pos.row][pos.col].terrain;
}

export function getPiece(board: BoardState, pos: Position): Piece | null {
  return board[pos.row][pos.col].piece;
}

export function isSeaTerrain(t: CellTerrain): boolean {
  return t === 'S';
}

export function isLandOrIsland(t: CellTerrain): boolean {
  return t === 'L' || t === 'I';
}

// Count total pieces nested recursively inside a piece's cargo
export function countNestedCargo(piece: Piece): number {
  let count = 0;
  for (const c of piece.cargo) {
    count += 1 + countNestedCargo(c);
  }
  return count;
}

// Get all soldiers (foot units) recursively in cargo, including nested
export function countSoldiersInCargo(piece: Piece): number {
  let count = 0;
  for (const c of piece.cargo) {
    if (isFootUnit(c.unitName)) {
      count += 1;
    }
    count += countSoldiersInCargo(c);
  }
  return count;
}

// Check if any piece in cargo (recursively) is carrying the enemy flag
export function hasEnemyFlagInCargo(piece: Piece): boolean {
  if (piece.carryingFlag) return true;
  for (const c of piece.cargo) {
    if (hasEnemyFlagInCargo(c)) return true;
  }
  return false;
}

// Deep clone a piece (including cargo)
export function clonePiece(piece: Piece): Piece {
  return {
    ...piece,
    cargo: piece.cargo.map(clonePiece),
  };
}

// Deep clone the board
export function cloneBoard(board: BoardState): BoardState {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      piece: cell.piece ? clonePiece(cell.piece) : null,
    }))
  );
}
