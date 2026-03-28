import {
  Unit, Position, Action, ActionKind, GameState, UnitType,
  TerrainType, BackForthEntry, Player,
} from "./types";
import {
  MAP_DATA, BOARD_SIZE, UNIT_DEFS,
  isFootUnit, isNavalUnit, isAirUnit, isMineUnit,
  isSea, isLandOrIsland,
} from "./constants";

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function terrain(row: number, col: number): TerrainType {
  return MAP_DATA[row][col];
}

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

function isBackForthBlocked(
  unitId: string,
  from: Position,
  to: Position,
  backForthMap: Record<string, BackForthEntry>,
): boolean {
  const entry = backForthMap[unitId];
  if (!entry) return false;
  if (posEq(entry.prevPos, to) && entry.count >= 2) return true;
  return false;
}

/** Can this unit type exist on this terrain? */
function canUnitBeOnTerrain(unitType: UnitType, t: TerrainType): boolean {
  return UNIT_DEFS[unitType].canMoveOn.includes(t);
}

/** Is this a cross-terrain attack? (land->sea or sea->land) */
function isCrossTerrainAttack(fromTerrain: TerrainType, toTerrain: TerrainType): boolean {
  const fromSea = isSea(fromTerrain);
  const toSea = isSea(toTerrain);
  const fromLand = isLandOrIsland(fromTerrain);
  const toLand = isLandOrIsland(toTerrain);
  return (fromSea && toLand) || (fromLand && toSea);
}

export function getValidMoves(state: GameState, pos: Position): Action[] {
  const unit = state.board[pos.row][pos.col];
  if (!unit || unit.player !== state.currentPlayer) return [];
  if (UNIT_DEFS[unit.type].isImmobile) return [];

  const actions: Action[] = [];
  const def = UNIT_DEFS[unit.type];

  if (def.unlimitedRange) {
    // Planes: sweep in 4 cardinal directions, stop at first occupied cell
    for (const [dr, dc] of DIRS) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      while (inBounds(r, c)) {
        const target = { row: r, col: c };
        if (state.board[r][c] !== null) break; // blocked by any piece
        if (canUnitBeOnTerrain(unit.type, terrain(r, c))) {
          if (!isBackForthBlocked(unit.id, pos, target, state.backForthMap)) {
            actions.push({ kind: "move", from: pos, to: target });
          }
        }
        r += dr;
        c += dc;
      }
    }
  } else {
    // Non-planes: 1 square in 4 directions
    for (const [dr, dc] of DIRS) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (!inBounds(r, c)) continue;
      const target = { row: r, col: c };
      const t = terrain(r, c);

      if (state.board[r][c] === null) {
        // Empty cell: check terrain compatibility
        if (canUnitBeOnTerrain(unit.type, t)) {
          if (!isBackForthBlocked(unit.id, pos, target, state.backForthMap)) {
            actions.push({ kind: "move", from: pos, to: target });
          }
        }
      }
    }
  }

  return actions;
}

export function getValidAttacks(state: GameState, pos: Position): Action[] {
  const unit = state.board[pos.row][pos.col];
  if (!unit || unit.player !== state.currentPlayer) return [];
  if (UNIT_DEFS[unit.type].isImmobile) return [];

  const actions: Action[] = [];
  const def = UNIT_DEFS[unit.type];

  if (def.unlimitedRange) {
    // Planes: can attack the first enemy found in each cardinal direction (if clear path)
    for (const [dr, dc] of DIRS) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      while (inBounds(r, c)) {
        const occupant = state.board[r][c];
        if (occupant !== null) {
          if (occupant.player !== unit.player) {
            // Check no cross-terrain attack
            const fromT = terrain(pos.row, pos.col);
            const toT = terrain(r, c);
            if (!isCrossTerrainAttack(fromT, toT)) {
              actions.push({ kind: "attack", from: pos, to: { row: r, col: c } });
            }
          }
          break; // blocked
        }
        r += dr;
        c += dc;
      }
    }
  } else {
    // Non-planes: attack adjacent enemies
    for (const [dr, dc] of DIRS) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (!inBounds(r, c)) continue;

      const occupant = state.board[r][c];
      if (occupant && occupant.player !== unit.player) {
        // No marine attacks (land->sea or sea->land)
        const fromT = terrain(pos.row, pos.col);
        const toT = terrain(r, c);
        if (!isCrossTerrainAttack(fromT, toT)) {
          actions.push({ kind: "attack", from: pos, to: { row: r, col: c } });
        }
      }
    }
  }

  return actions;
}

export function getValidLoads(state: GameState, pos: Position): Action[] {
  const unit = state.board[pos.row][pos.col];
  if (!unit || unit.player !== state.currentPlayer) return [];

  const def = UNIT_DEFS[unit.type];
  if (!def.transport) return [];

  const actions: Action[] = [];
  const cap = def.transport;

  for (const [dr, dc] of DIRS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (!inBounds(r, c)) continue;

    const candidate = state.board[r][c];
    if (!candidate || candidate.player !== unit.player) continue;

    if (canLoadUnit(unit, candidate, cap)) {
      actions.push({ kind: "load", from: pos, to: { row: r, col: c } });
    }
  }

  return actions;
}

function canLoadUnit(
  transport: Unit,
  candidate: Unit,
  cap: NonNullable<typeof UNIT_DEFS[UnitType]["transport"]>,
): boolean {
  const cType = candidate.type;
  const cDef = UNIT_DEFS[cType];

  // Count current cargo by type
  let soldierCount = 0;
  let mineCount = 0;
  let shipCount = 0;
  let planeCount = 0;
  let hasFlag = false;

  for (const c of transport.cargo) {
    if (isFootUnit(c.type)) {
      soldierCount++;
      if (c.carryingFlag) hasFlag = true;
    } else if (isMineUnit(c.type)) {
      mineCount++;
    } else if (isNavalUnit(c.type)) {
      shipCount++;
    } else if (isAirUnit(c.type)) {
      planeCount++;
    } else if (c.type === "Flag") {
      hasFlag = true;
    }
  }

  // Check if candidate is a foot soldier (or Navy Seal)
  if (isFootUnit(cType)) {
    // A soldier carrying enemy flag counts as 1 soldier slot, but flag also takes a slot
    const flagSlots = candidate.carryingFlag && cap.allowsFlag ? 1 : 0;
    if (soldierCount + 1 + flagSlots > cap.maxSoldiers) return false;
    if (candidate.carryingFlag && !cap.allowsFlag) return false;
    return true;
  }

  // Check mines
  if (isMineUnit(cType)) {
    if (mineCount >= cap.maxMines) return false;
    if (!cap.allowedMines.includes(cType)) return false;
    return true;
  }

  // Check ships
  if (isNavalUnit(cType)) {
    if (shipCount >= cap.maxShips) return false;
    if (!cap.allowedShips.includes(cType)) return false;
    // Critical rule: ship must be EMPTY to be loaded onto another ship
    if (candidate.cargo.length > 0) return false;
    return true;
  }

  // Check planes
  if (isAirUnit(cType)) {
    if (planeCount >= cap.maxPlanes) return false;
    if (!cap.allowedPlanes.includes(cType)) return false;
    return true;
  }

  return false;
}

export function getValidUnloads(state: GameState, pos: Position): Action[] {
  const unit = state.board[pos.row][pos.col];
  if (!unit || unit.player !== state.currentPlayer) return [];
  if (unit.cargo.length === 0) return [];

  const actions: Action[] = [];

  for (const cargoUnit of unit.cargo) {
    for (const [dr, dc] of DIRS) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (!inBounds(r, c)) continue;
      if (state.board[r][c] !== null) continue;

      const t = terrain(r, c);
      const cDef = UNIT_DEFS[cargoUnit.type];

      // Check terrain compatibility for the unloaded unit
      if (cDef.canMoveOn.includes(t) || (cDef.isImmobile && cDef.canStartOn.includes(t))) {
        actions.push({
          kind: "unload",
          from: pos,
          to: { row: r, col: c },
          cargoUnitId: cargoUnit.id,
        });
      }
    }
  }

  return actions;
}

export function getAllValidActions(state: GameState, pos: Position): Action[] {
  return [
    ...getValidMoves(state, pos),
    ...getValidAttacks(state, pos),
    ...getValidLoads(state, pos),
    ...getValidUnloads(state, pos),
  ];
}

/** Get valid sea cells adjacent to a position (for Life Raft escape) */
export function getAdjacentSeaCells(board: (Unit | null)[][], pos: Position): Position[] {
  const cells: Position[] = [];
  for (const [dr, dc] of DIRS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (inBounds(r, c) && isSea(terrain(r, c)) && board[r][c] === null) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

/** Get all land cells (not island) that are empty - for flag replacement */
export function getEmptyLandCells(board: (Unit | null)[][]): Position[] {
  const cells: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (terrain(r, c) === "L" && board[r][c] === null) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}
