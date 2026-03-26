import { BoardState, Player, Position, CellTerrain } from '../types/game';
import { getUnitDef } from '../constants/units';
import { getSetupZone, getIslandCells, BOARD_COLS } from '../constants/map';
import { getAdjacent, getTerrain, getPiece } from '../utils/boardHelpers';

// Check if a piece can be placed at a position during setup
export function isValidPlacement(
  board: BoardState,
  unitName: string,
  position: Position,
  player: Player
): boolean {
  const zone = getSetupZone(player);

  // Must be in player's setup zone
  if (position.row < zone.startRow || position.row > zone.endRow) return false;

  // Cell must be empty
  if (board[position.row][position.col].piece) return false;

  const terrain = getTerrain(board, position);
  const def = getUnitDef(unitName);

  // Check terrain compatibility for starting position
  return def.startTerrain.includes(terrain);
}

// Validate that setup is complete and follows all rules
export function validateSetup(
  board: BoardState,
  player: Player
): { valid: boolean; reason?: string } {
  const zone = getSetupZone(player);

  // Check island has 3 empty spaces
  const islandCells = getIslandCells(player);
  const emptyIslandCells = islandCells.filter(
    cell => !board[cell.row][cell.col].piece
  );
  if (emptyIslandCells.length < 3) {
    return {
      valid: false,
      reason: 'You must leave at least 3 empty spaces on your island for the enemy to invade.',
    };
  }

  // Find the flag
  let flagPos: Position | null = null;
  for (let r = zone.startRow; r <= zone.endRow; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c].piece;
      if (piece && piece.player === player && piece.unitName === 'Flag') {
        flagPos = { row: r, col: c };
      }
    }
  }

  if (!flagPos) {
    return { valid: false, reason: 'You must place your Flag on the board.' };
  }

  // Flag must not be surrounded by mines on all sides
  const flagAdj = getAdjacent(flagPos);
  const accessibleAdj = flagAdj.filter(adj => {
    const terrain = getTerrain(board, adj);
    if (terrain === 'S') return false; // Sea is not walkable for land units
    const piece = getPiece(board, adj);
    if (!piece) return true; // Empty cell = accessible
    if (piece.unitName === 'Land mine' || piece.unitName === 'Naval mine') return false;
    return true; // Other pieces can be moved later
  });

  if (accessibleAdj.length === 0) {
    return {
      valid: false,
      reason: 'Your Flag must have a viable path - you cannot surround it with mines on all sides.',
    };
  }

  return { valid: true };
}

// Get all valid placement cells for a given unit type during setup
export function getValidPlacementCells(
  board: BoardState,
  unitName: string,
  player: Player
): Position[] {
  const zone = getSetupZone(player);
  const cells: Position[] = [];

  for (let r = zone.startRow; r <= zone.endRow; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const pos = { row: r, col: c };
      if (isValidPlacement(board, unitName, pos, player)) {
        cells.push(pos);
      }
    }
  }

  return cells;
}
