import {
  GameState,
  Piece,
  UnitType,
  Player,
  GamePhase,
  TerrainType,
} from "../types";
import { getTerrainForUnit, SETUP_ROWS, UNIT_COUNTS } from "../constants/units";
import { BOARD_ROWS, BOARD_COLS } from "../constants/map";

let nextId = 1;
function generateId(): string {
  return `p_${nextId++}`;
}

export function resetIdCounter(): void {
  nextId = 1;
}

export function canPlacePiece(
  state: GameState,
  unitType: UnitType,
  owner: Player,
  row: number,
  col: number
): boolean {
  const phase = state.currentPhase;
  if (
    (owner === Player.Yellow && phase !== GamePhase.YellowSetup) ||
    (owner === Player.Blue && phase !== GamePhase.BlueSetup)
  ) {
    return false;
  }

  if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS)
    return false;

  const bounds = SETUP_ROWS[owner];
  if (row < bounds.min || row > bounds.max) return false;

  const cell = state.grid[row][col];
  if (cell.pieceId !== null) return false;

  const allowedTerrain = getTerrainForUnit(unitType);
  if (!allowedTerrain.includes(cell.terrain)) return false;

  return true;
}

export function placePiece(
  state: GameState,
  unitType: UnitType,
  owner: Player,
  row: number,
  col: number
): GameState {
  const id = generateId();
  const piece: Piece = {
    id,
    type: unitType,
    owner,
    row,
    col,
    carriedPieceIds: [],
    carriedByPieceId: null,
    isCarryingEnemyFlag: false,
    isAlive: true,
  };

  const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
  newGrid[row][col] = { ...newGrid[row][col], pieceId: id };

  return {
    ...state,
    grid: newGrid,
    piecesById: { ...state.piecesById, [id]: piece },
  };
}

export function getPlacedCounts(
  state: GameState,
  owner: Player
): Record<UnitType, number> {
  const counts = {} as Record<UnitType, number>;
  for (const ut of Object.values(UnitType)) {
    counts[ut] = 0;
  }
  for (const piece of Object.values(state.piecesById)) {
    if (piece.owner === owner && piece.isAlive) {
      counts[piece.type]++;
    }
  }
  return counts;
}

export function getRemainingToPlace(
  state: GameState,
  owner: Player
): Record<UnitType, number> {
  const placed = getPlacedCounts(state, owner);
  const remaining = {} as Record<UnitType, number>;
  for (const ut of Object.values(UnitType)) {
    remaining[ut] = UNIT_COUNTS[ut] - (placed[ut] || 0);
  }
  return remaining;
}

export function validateSetupComplete(
  state: GameState,
  player: Player
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const remaining = getRemainingToPlace(state, player);

  for (const [ut, count] of Object.entries(remaining)) {
    if (count > 0) {
      errors.push(`${count} ${ut} still need to be placed`);
    }
  }

  // Check island has 3 empty spaces
  const bounds = SETUP_ROWS[player];
  let islandCells = 0;
  let islandOccupied = 0;
  for (let r = bounds.min; r <= bounds.max; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (state.grid[r][c].terrain === TerrainType.Island) {
        islandCells++;
        if (state.grid[r][c].pieceId !== null) {
          islandOccupied++;
        }
      }
    }
  }
  const islandEmpty = islandCells - islandOccupied;
  if (islandEmpty < 3) {
    errors.push(
      `Must leave at least 3 empty spaces on your island (currently ${islandEmpty})`
    );
  }

  // Check viable path to flag (not completely surrounded by mines)
  const flagPiece = Object.values(state.piecesById).find(
    (p) => p.type === UnitType.Flag && p.owner === player && p.isAlive
  );
  if (flagPiece) {
    if (!hasViablePathToFlag(state, flagPiece)) {
      errors.push("Flag must have a viable attack path (not fully blocked by mines)");
    }
  } else {
    errors.push("Flag has not been placed");
  }

  return { valid: errors.length === 0, errors };
}

function hasViablePathToFlag(state: GameState, flagPiece: Piece): boolean {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of directions) {
    const nr = flagPiece.row + dr;
    const nc = flagPiece.col + dc;
    if (nr < 0 || nr >= BOARD_ROWS || nc < 0 || nc >= BOARD_COLS) continue;
    const adjCell = state.grid[nr][nc];
    if (adjCell.pieceId === null) return true;
    const adjPiece = state.piecesById[adjCell.pieceId];
    if (
      adjPiece.type !== UnitType.LandMine &&
      adjPiece.type !== UnitType.NavalMine
    ) {
      return true;
    }
  }
  return false;
}

export function finalizeSetup(state: GameState): GameState {
  if (state.currentPhase === GamePhase.YellowSetup) {
    return { ...state, currentPhase: GamePhase.BlueSetup, currentPlayer: Player.Blue };
  }
  return {
    ...state,
    currentPhase: GamePhase.YellowTurn,
    currentPlayer: Player.Yellow,
  };
}
