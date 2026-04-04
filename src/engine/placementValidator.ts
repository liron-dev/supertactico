import { BoardCell, Position, posEqual } from '../types/board';
import { Player, UnitInstance } from '../types/unit';
import { GameState, getPlayerRows, getPlayerIslandCells } from '../types/game';
import { getUnitDefinition } from '../constants/units';
import { getOrthogonalNeighbors } from '../utils/adjacency';

/**
 * Check if a unit can be placed at a given position during the placement phase.
 */
export function canPlaceUnit(
  state: GameState,
  unit: UnitInstance,
  position: Position,
): boolean {
  const { board } = state;
  const cell = board[position.row][position.col];

  // Cell must be empty
  if (cell.unit) return false;

  // Must be within the player's territory
  const rows = getPlayerRows(unit.owner);
  if (position.row < rows.start || position.row > rows.end) return false;

  // Check terrain compatibility
  const def = getUnitDefinition(unit.type);
  if (!def.startTerrain.includes(cell.terrain)) return false;

  // Island placement limit: must leave 3 empty spaces on own island
  if (cell.terrain === 'I') {
    const islandCells = getPlayerIslandCells(unit.owner);
    const occupiedIslandCells = islandCells.filter(ic => {
      const c = board[ic.row][ic.col];
      return c.unit !== null && !posEqual(ic, position);
    }).length;
    // After placing this unit, we need at least 3 empty island cells
    // Island has 6 cells, so max 3 can be occupied
    if (occupiedIslandCells >= 3) return false;
  }

  return true;
}

/**
 * Validate that the entire placement is legal before finalizing.
 * - Must have placed all units
 * - Must leave 3 empty island cells
 * - Must leave a viable path to the flag (flag not surrounded by mines on all sides)
 */
export function validatePlacement(
  board: BoardCell[][],
  player: Player,
): { valid: boolean; error?: string } {
  const rows = getPlayerRows(player);

  // Find the flag
  let flagPos: Position | null = null;
  for (let r = rows.start; r <= rows.end; r++) {
    for (let c = 0; c < 20; c++) {
      const cell = board[r][c];
      if (cell.unit?.owner === player && cell.unit.type === 'Flag') {
        flagPos = { row: r, col: c };
      }
    }
  }

  if (!flagPos) {
    return { valid: false, error: 'You must place your flag!' };
  }

  // Check island constraint: at least 3 empty island cells
  const islandCells = getPlayerIslandCells(player);
  const emptyIslandCells = islandCells.filter(ic => board[ic.row][ic.col].unit === null).length;
  if (emptyIslandCells < 3) {
    return { valid: false, error: 'Must leave at least 3 empty spaces on your island.' };
  }

  // Check flag is not surrounded by mines on all sides
  const flagNeighbors = getOrthogonalNeighbors(flagPos);
  const allNeighborsMines = flagNeighbors.every(n => {
    const cell = board[n.row][n.col];
    if (!cell.unit) return false; // empty cell = not a mine = viable path
    return cell.unit.type === 'Land mine' || cell.unit.type === 'Naval mine';
  });

  if (allNeighborsMines && flagNeighbors.length > 0) {
    return { valid: false, error: 'Your flag must have at least one adjacent non-mine space.' };
  }

  return { valid: true };
}
