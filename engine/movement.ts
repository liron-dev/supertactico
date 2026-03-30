import { Cell, UnitInstance, MoveRecord, Coord, TerrainType } from "./types";
import { getUnitDef, isAircraft, isImmobile } from "./constants";
import { isInBounds, getTerrain } from "./map";
import { BOARD_ROWS, BOARD_COLS } from "./constants";

const DIRECTIONS: Coord[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function canUnitEnterTerrain(unitName: string, terrain: TerrainType): boolean {
  const def = getUnitDef(unitName as any);
  return def.moveTerrain.includes(terrain);
}

function isBackAndForthBlocked(history: MoveRecord[], unitId: string, from: Coord, to: Coord): boolean {
  const unitMoves = history.filter((m) => m.unitId === unitId);
  // Count oscillations: individual moves between our two cells (in either direction)
  let count = 0;
  for (const m of unitMoves) {
    const matchForward = m.from[0] === from[0] && m.from[1] === from[1] && m.to[0] === to[0] && m.to[1] === to[1];
    const matchBackward = m.from[0] === to[0] && m.from[1] === to[1] && m.to[0] === from[0] && m.to[1] === from[1];
    if (matchForward || matchBackward) count++;
  }
  // "twice at most back-and-forth" = 4 individual moves between same 2 squares
  return count >= 4;
}

export function getValidMoves(
  board: Cell[][],
  unit: UnitInstance,
  row: number,
  col: number,
  moveHistory: MoveRecord[]
): Coord[] {
  const def = getUnitDef(unit.name);
  if (!def.mobile || isImmobile(unit.name)) return [];

  if (isAircraft(unit.name)) {
    return getPlaneValidMoves(board, unit, row, col, moveHistory);
  }

  const moves: Coord[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (!isInBounds(nr, nc)) continue;
    const targetCell = board[nr][nc];
    if (targetCell.unit !== null) continue;
    if (!canUnitEnterTerrain(unit.name, targetCell.terrain)) continue;
    if (isBackAndForthBlocked(moveHistory, unit.id, [row, col], [nr, nc])) continue;
    moves.push([nr, nc]);
  }
  return moves;
}

function getPlaneValidMoves(
  board: Cell[][],
  unit: UnitInstance,
  row: number,
  col: number,
  moveHistory: MoveRecord[]
): Coord[] {
  const moves: Coord[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    let nr = row + dr;
    let nc = col + dc;
    while (isInBounds(nr, nc)) {
      const cell = board[nr][nc];
      if (cell.unit !== null) break; // blocked, can't fly over any piece
      if (canUnitEnterTerrain(unit.name, cell.terrain)) {
        if (!isBackAndForthBlocked(moveHistory, unit.id, [row, col], [nr, nc])) {
          moves.push([nr, nc]);
        }
      }
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

export function getValidAttackTargets(
  board: Cell[][],
  unit: UnitInstance,
  row: number,
  col: number
): Coord[] {
  const def = getUnitDef(unit.name);
  if (!def.mobile) return [];

  const targets: Coord[] = [];
  const unitTerrain = board[row][col].terrain;

  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (!isInBounds(nr, nc)) continue;
    const targetCell = board[nr][nc];
    if (!targetCell.unit) continue;
    if (targetCell.unit.owner === unit.owner) continue;

    // No marine attacks: cannot attack across sea ↔ land/island boundary
    const targetTerrain = targetCell.terrain;
    const unitOnSea = unitTerrain === "S";
    const targetOnSea = targetTerrain === "S";
    const unitOnLand = unitTerrain === "L" || unitTerrain === "I";
    const targetOnLand = targetTerrain === "L" || targetTerrain === "I";
    if ((unitOnSea && targetOnLand) || (unitOnLand && targetOnSea)) continue;

    targets.push([nr, nc]);
  }
  return targets;
}
