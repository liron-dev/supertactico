import { Position } from '../types/board';
import { BOARD_ROWS, BOARD_COLS } from '../types/game';

const DIRECTIONS = [
  { row: -1, col: 0 },  // up
  { row: 1, col: 0 },   // down
  { row: 0, col: -1 },  // left
  { row: 0, col: 1 },   // right
];

export function getOrthogonalNeighbors(pos: Position): Position[] {
  return DIRECTIONS
    .map(d => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(p => p.row >= 0 && p.row < BOARD_ROWS && p.col >= 0 && p.col < BOARD_COLS);
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr + dc) === 1;
}
