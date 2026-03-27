import { Unit, Position, Player, UnitType, GameState } from './types';
import { MAP_DATA, UNIT_DEFS, SETUP_ROWS, ISLAND_CELLS_BY_PLAYER } from './constants';

/**
 * Returns all valid board positions where the player can place the given unit type.
 */
export function getValidPlacements(
  state: GameState,
  unitType: UnitType,
  player: Player,
): Position[] {
  const [minRow, maxRow] = SETUP_ROWS[player];
  const def = UNIT_DEFS[unitType];
  const islandCells = ISLAND_CELLS_BY_PLAYER[player];

  // How many island cells are already occupied?
  const islandOccupied = islandCells.filter(
    ({ row, col }) => state.board[row][col] !== null,
  ).length;
  const islandFull = islandOccupied >= islandCells.length - 3;

  const valid: Position[] = [];

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = 0; col < 20; col++) {
      if (state.board[row][col] !== null) continue; // occupied

      const terrain = MAP_DATA[row][col];
      let canPlace = false;

      if (terrain === 'L' && def.canLand) canPlace = true;
      if (terrain === 'I' && def.canIsland) {
        if (!islandFull) canPlace = true;
        // If island is full (<=3 open), don't place here
        else canPlace = false;
      }
      if (terrain === 'S' && def.canSea) canPlace = true;

      if (canPlace) valid.push({ row, col });
    }
  }

  return valid;
}

/**
 * Validates that the player's setup is complete and legal.
 */
export function validateSetupCompletion(
  state: GameState,
  player: Player,
): { valid: boolean; error?: string } {
  // Check all units placed
  if (state.unplacedUnits[player].length > 0) {
    return { valid: false, error: `${state.unplacedUnits[player].length} units still unplaced` };
  }

  // Check island has >=3 empty spaces
  const islandCells = ISLAND_CELLS_BY_PLAYER[player];
  const islandEmpty = islandCells.filter(
    ({ row, col }) => state.board[row][col] === null,
  ).length;
  if (islandEmpty < 3) {
    return { valid: false, error: 'Island must have at least 3 empty spaces for enemy invasion' };
  }

  // Check flag has at least one accessible non-mine neighbor
  const [minRow, maxRow] = SETUP_ROWS[player];
  let flagPos: Position | null = null;
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = 0; col < 20; col++) {
      if (state.board[row][col]?.type === 'Flag' && state.board[row][col]?.player === player) {
        flagPos = { row, col };
      }
    }
  }

  if (!flagPos) {
    return { valid: false, error: 'Flag must be placed' };
  }

  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  let hasViablePath = false;
  for (const [dr, dc] of dirs) {
    const r = flagPos.row + dr;
    const c = flagPos.col + dc;
    if (r < minRow || r > maxRow || c < 0 || c >= 20) continue;
    const terrain = MAP_DATA[r][c];
    if (terrain !== 'L' && terrain !== 'I') continue;
    const occupant = state.board[r][c];
    if (!occupant || (occupant.type !== 'Land mine' && occupant.type !== 'Naval mine')) {
      hasViablePath = true;
      break;
    }
  }

  if (!hasViablePath) {
    return { valid: false, error: 'Flag must have at least one accessible path (cannot be surrounded by mines)' };
  }

  return { valid: true };
}

/**
 * Creates the initial set of unplaced units for both players.
 */
export function createInitialUnits(player: Player): Unit[] {
  const units: Unit[] = [];
  const allTypes: UnitType[] = [
    'Rav Aluf','Aluf','Sgan Aluf','Rav Seren','Seren',
    'Segen','Rav Samal','Samal','Rav Turai','Commando','Navy Seal',
    'M7 Ship','M4 Ship','Patrol Ship','Life Raft',
    'Fighter Plane','Reconnaissance Plane',
    'Land mine','Naval mine','Flag',
  ];

  for (const type of allTypes) {
    const count = UNIT_DEFS[type].count;
    for (let i = 0; i < count; i++) {
      units.push({
        id: `${player}-${type}-${i}`,
        type,
        player,
        cargo: [],
        isRevealed: false,
        carryingFlag: false,
      });
    }
  }

  return units;
}
