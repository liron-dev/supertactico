import { Position, BoardCell } from '../types/board';
import { BOARD_ROWS, BOARD_COLS } from '../types/game';
import { UnitInstance } from '../types/unit';
import { getUnitDefinition } from '../constants/units';

const DIRECTIONS = [
  { row: -1, col: 0 },  // up
  { row: 1, col: 0 },   // down
  { row: 0, col: -1 },  // left
  { row: 0, col: 1 },   // right
];

/**
 * Get all valid movement positions for a plane.
 * Planes can move unlimited distance in any orthogonal direction,
 * but their path must be completely clear (no pieces of either side).
 * They can move to any terrain type.
 */
export function getPlaneMoveCells(
  pos: Position,
  board: BoardCell[][],
  unit: UnitInstance,
): Position[] {
  const validCells: Position[] = [];
  const def = getUnitDefinition(unit.type);

  for (const dir of DIRECTIONS) {
    let r = pos.row + dir.row;
    let c = pos.col + dir.col;

    while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
      const cell = board[r][c];

      if (cell.unit) {
        // Path blocked by any unit. Cannot fly over.
        // But can attack an enemy unit at this position (handled separately in attack logic)
        break;
      }

      // Check terrain validity for the plane
      if (def.moveTerrain.includes(cell.terrain)) {
        validCells.push({ row: r, col: c });
      }

      r += dir.row;
      c += dir.col;
    }
  }

  return validCells;
}

/**
 * Get cells where a plane can attack (enemy units at the end of a clear path).
 */
export function getPlaneAttackCells(
  pos: Position,
  board: BoardCell[][],
  unit: UnitInstance,
): Position[] {
  const attackCells: Position[] = [];

  for (const dir of DIRECTIONS) {
    let r = pos.row + dir.row;
    let c = pos.col + dir.col;

    while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
      const cell = board[r][c];

      if (cell.unit) {
        // First unit encountered in this direction
        if (cell.unit.owner !== unit.owner) {
          // Can only attack if on the same terrain category (no marine attacks)
          const attackerTerrain = board[pos.row][pos.col].terrain;
          const defenderTerrain = cell.terrain;
          const attackerOnLand = attackerTerrain === 'L' || attackerTerrain === 'I';
          const defenderOnLand = defenderTerrain === 'L' || defenderTerrain === 'I';
          const attackerOnSea = attackerTerrain === 'S';
          const defenderOnSea = defenderTerrain === 'S';

          // No marine attacks: can't attack across land/sea boundary
          if ((attackerOnLand && defenderOnLand) || (attackerOnSea && defenderOnSea)) {
            attackCells.push({ row: r, col: c });
          }
        }
        break; // blocked by this unit either way
      }

      r += dir.row;
      c += dir.col;
    }
  }

  return attackCells;
}
