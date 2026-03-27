import { Unit, Position, Action, GameState } from './types';
import { MAP_DATA, UNIT_DEFS, TransportCapacity, NAVAL_UNIT_TYPES } from './constants';

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 20 && col >= 0 && col < 20;
}

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function unitCanStandOn(unit: Unit, row: number, col: number): boolean {
  const terrain = MAP_DATA[row][col];
  const def = UNIT_DEFS[unit.type];
  if (terrain === 'L') return def.canLand;
  if (terrain === 'I') return def.canIsland;
  if (terrain === 'S') return def.canSea;
  return false;
}

/**
 * Get all valid move targets for the unit at `pos`.
 * Returns positions the unit can move to (empty cells) and attack (enemy cells).
 */
export function getValidMoves(state: GameState, pos: Position): Action[] {
  const unit = state.board[pos.row][pos.col];
  if (!unit || unit.player !== state.currentPlayer) return [];
  if (UNIT_DEFS[unit.type].isImmobile) return [];

  const actions: Action[] = [];
  const def = UNIT_DEFS[unit.type];

  if (def.unlimitedRange) {
    // Planes: BFS in 4 directions; stop at first piece in each direction
    for (const [dr, dc] of DIRS) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      while (inBounds(r, c)) {
        const occupant = state.board[r][c];
        if (occupant !== null) {
          // Can attack enemy (plane attacks adjacent-ish, but plane range is unlimited)
          // Planes attack by moving to an enemy's square
          if (occupant.player !== unit.player) {
            actions.push({ kind: 'attack', from: pos, to: { row: r, col: c } });
          }
          break; // Any piece blocks further travel
        }
        actions.push({ kind: 'move', from: pos, to: { row: r, col: c } });
        r += dr;
        c += dc;
      }
    }
    return actions;
  }

  // Regular units: 1 step in any of 4 directions
  for (const [dr, dc] of DIRS) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (!inBounds(r, c)) continue;
    if (!unitCanStandOn(unit, r, c)) continue;

    // Back-and-forth check
    const bfEntry = state.backForthMap[unit.id];
    if (bfEntry && bfEntry.prevPos.row === r && bfEntry.prevPos.col === c && bfEntry.count >= 2) {
      continue;
    }

    const occupant = state.board[r][c];
    if (occupant === null) {
      actions.push({ kind: 'move', from: pos, to: { row: r, col: c } });
    } else if (occupant.player !== unit.player) {
      // Can only attack from correct terrain (no marine attacks)
      const fromTerrain = MAP_DATA[pos.row][pos.col];
      const toTerrain = MAP_DATA[r][c];
      // Both must be on compatible terrain - can't attack from sea to land or vice versa
      const crossTerrain =
        (fromTerrain === 'S' && (toTerrain === 'L' || toTerrain === 'I')) ||
        ((fromTerrain === 'L' || fromTerrain === 'I') && toTerrain === 'S');
      if (!crossTerrain) {
        actions.push({ kind: 'attack', from: pos, to: { row: r, col: c } });
      }
    }
    // Friendly-occupied: skip
  }

  return actions;
}

/**
 * Get all valid load actions for the transport unit at `transportPos`.
 * Adjacent units (including cross-terrain) can be loaded if capacity permits.
 */
export function getValidLoads(state: GameState, transportPos: Position): Action[] {
  const transport = state.board[transportPos.row][transportPos.col];
  if (!transport || transport.player !== state.currentPlayer) return [];
  const def = UNIT_DEFS[transport.type];
  if (!def.transport) return [];

  const actions: Action[] = [];

  for (const [dr, dc] of DIRS) {
    const r = transportPos.row + dr;
    const c = transportPos.col + dc;
    if (!inBounds(r, c)) continue;

    const candidate = state.board[r][c];
    if (!candidate) continue;
    // Can load own units OR enemy flag (carried by own soldier auto-includes it)
    if (candidate.player !== transport.player) continue;

    if (canLoad(transport, candidate, def.transport)) {
      actions.push({ kind: 'load', from: transportPos, to: { row: r, col: c } });
    }
  }

  return actions;
}

/**
 * Check if `candidate` can be loaded onto `transport` given current cargo.
 */
export function canLoad(transport: Unit, candidate: Unit, cap: TransportCapacity): boolean {
  const cargo = transport.cargo;
  const type = candidate.type;

  // Count current cargo by category
  const soldierCount = cargo.filter(u =>
    UNIT_DEFS[u.type].category === 'foot'
  ).length;
  const mineCount = cargo.filter(u =>
    u.type === 'Land mine' || u.type === 'Naval mine'
  ).length;
  const shipCount = cargo.filter(u => NAVAL_UNIT_TYPES.has(u.type)).length;
  const planeCount = cargo.filter(u =>
    UNIT_DEFS[u.type].category === 'air'
  ).length;

  const def = UNIT_DEFS[type];

  if (def.category === 'foot') {
    // A soldier carrying the flag counts as 1 unit (flag comes along)
    const flagOccupies = candidate.carryingFlag && cap.allowsFlag ? 1 : 0;
    return soldierCount + flagOccupies < cap.maxSoldiers;
  }

  if (type === 'Land mine' || type === 'Naval mine') {
    return mineCount < cap.maxMines && cap.allowedMines.includes(type);
  }

  if (NAVAL_UNIT_TYPES.has(type)) {
    if (!cap.allowedShips.includes(type)) return false;
    if (shipCount >= cap.maxShips) return false;
    // Critical: Life Raft must be empty to be loaded onto another ship
    if (candidate.cargo.length > 0) return false;
    return true;
  }

  if (def.category === 'air') {
    return planeCount < cap.maxPlanes && cap.allowedPlanes.includes(type);
  }

  return false;
}

/**
 * Get all valid unload actions for the transport unit at `transportPos`.
 */
export function getValidUnloads(state: GameState, transportPos: Position): Action[] {
  const transport = state.board[transportPos.row][transportPos.col];
  if (!transport || transport.player !== state.currentPlayer) return [];
  if (transport.cargo.length === 0) return [];

  const actions: Action[] = [];

  for (const cargoUnit of transport.cargo) {
    for (const [dr, dc] of DIRS) {
      const r = transportPos.row + dr;
      const c = transportPos.col + dc;
      if (!inBounds(r, c)) continue;
      if (state.board[r][c] !== null) continue;

      // Check if cargo unit can stand on this terrain
      const terrain = MAP_DATA[r][c];
      const cargoDef = UNIT_DEFS[cargoUnit.type];
      const canStand =
        (terrain === 'L' && cargoDef.canLand) ||
        (terrain === 'I' && cargoDef.canIsland) ||
        (terrain === 'S' && cargoDef.canSea);

      if (canStand) {
        actions.push({
          kind: 'unload',
          from: transportPos,
          to: { row: r, col: c },
          cargoUnit,
        });
      }
    }
  }

  return actions;
}

/**
 * Get all valid actions for the selected unit at `pos`.
 */
export function getAllValidActions(state: GameState, pos: Position): Action[] {
  const unit = state.board[pos.row][pos.col];
  if (!unit || unit.player !== state.currentPlayer) return [];

  const moves = getValidMoves(state, pos);
  const loads = getValidLoads(state, pos);
  const unloads = getValidUnloads(state, pos);

  return [...moves, ...loads, ...unloads];
}
