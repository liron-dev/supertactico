import { Position, Player, UnitType, GameState, Unit } from "./types";
import {
  MAP_DATA, BOARD_SIZE, UNIT_DEFS,
  BLUE_SETUP_ROWS, YELLOW_SETUP_ROWS,
  BLUE_ISLAND_CELLS, YELLOW_ISLAND_CELLS,
  MIN_EMPTY_ISLAND_CELLS,
  isMineUnit,
} from "./constants";

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getSetupRows(player: Player): [number, number] {
  return player === "blue" ? BLUE_SETUP_ROWS : YELLOW_SETUP_ROWS;
}

function getIslandCells(player: Player): Position[] {
  return player === "blue" ? BLUE_ISLAND_CELLS : YELLOW_ISLAND_CELLS;
}

export function getValidPlacements(
  state: GameState,
  unitType: UnitType,
  player: Player,
): Position[] {
  const [minRow, maxRow] = getSetupRows(player);
  const def = UNIT_DEFS[unitType];
  const validCells: Position[] = [];

  // Count how many island cells are occupied
  const islandCells = getIslandCells(player);
  let occupiedIslandCount = 0;
  for (const cell of islandCells) {
    if (state.board[cell.row][cell.col] !== null) {
      occupiedIslandCount++;
    }
  }
  const maxIslandOccupied = islandCells.length - MIN_EMPTY_ISLAND_CELLS;

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (state.board[r][c] !== null) continue;

      const terrain = MAP_DATA[r][c];
      if (!def.canStartOn.includes(terrain)) continue;

      // Check island capacity
      if (terrain === "I") {
        if (occupiedIslandCount >= maxIslandOccupied) continue;
      }

      validCells.push({ row: r, col: c });
    }
  }

  return validCells;
}

export interface SetupValidation {
  valid: boolean;
  errors: string[];
}

export function validateSetupCompletion(
  state: GameState,
  player: Player,
): SetupValidation {
  const errors: string[] = [];

  // Check all units placed
  if (state.unplacedUnits[player].length > 0) {
    const remaining = state.unplacedUnits[player].length;
    errors.push(`${remaining} unit(s) still need to be placed.`);
  }

  // Check island has enough empty cells
  const islandCells = getIslandCells(player);
  let emptyIslandCount = 0;
  for (const cell of islandCells) {
    if (state.board[cell.row][cell.col] === null) {
      emptyIslandCount++;
    }
  }
  if (emptyIslandCount < MIN_EMPTY_ISLAND_CELLS) {
    errors.push(
      `Must leave at least ${MIN_EMPTY_ISLAND_CELLS} empty spaces on your island (currently ${emptyIslandCount} empty).`,
    );
  }

  // Check flag is not completely surrounded by mines
  const flagPos = findFlagPosition(state, player);
  if (flagPos) {
    const allNeighborsMines = areAllNeighborsMines(state, flagPos);
    if (allNeighborsMines) {
      errors.push("Your flag cannot be surrounded by mines on all sides. Leave a viable attack path.");
    }
  } else if (state.unplacedUnits[player].length === 0) {
    errors.push("Flag must be placed on the board.");
  }

  return { valid: errors.length === 0, errors };
}

function findFlagPosition(state: GameState, player: Player): Position | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const unit = state.board[r][c];
      if (unit && unit.type === "Flag" && unit.player === player) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function areAllNeighborsMines(state: GameState, pos: Position): boolean {
  let accessibleNeighbors = 0;
  let mineNeighbors = 0;

  for (const [dr, dc] of DIRS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (!inBounds(r, c)) continue;

    const t = MAP_DATA[r][c];
    // Only count land/island neighbors as accessible (flag is on land)
    if (t === "L" || t === "I") {
      accessibleNeighbors++;
      const unit = state.board[r][c];
      if (unit && isMineUnit(unit.type)) {
        mineNeighbors++;
      }
    }
  }

  // If all accessible neighbors are mines, the flag is surrounded
  return accessibleNeighbors > 0 && mineNeighbors === accessibleNeighbors;
}
