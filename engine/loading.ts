import { UnitInstance, UnitName, Coord } from "./types";
import { getUnitDef, isFootUnit, isShip, isAircraft } from "./constants";

export interface CargoStats {
  soldiers: number;
  mines: number;
  ships: number;
  planes: number;
  hasFlag: boolean;
}

export function getCargoStats(unit: UnitInstance): CargoStats {
  let soldiers = 0, mines = 0, ships = 0, planes = 0, hasFlag = false;
  for (const c of unit.cargo) {
    if (isFootUnit(c.name)) {
      soldiers++;
      if (c.carryingFlag) hasFlag = true;
    } else if (c.name === "Land mine" || c.name === "Naval mine") {
      mines++;
    } else if (isShip(c.name)) {
      ships++;
      const nested = getCargoStats(c);
      soldiers += nested.soldiers;
      if (nested.hasFlag) hasFlag = true;
    } else if (isAircraft(c.name)) {
      planes++;
    }
  }
  return { soldiers, mines, ships, planes, hasFlag };
}

export function canLoadUnit(transport: UnitInstance, cargo: UnitInstance): boolean {
  const cap = getUnitDef(transport.name).transportCapacity;
  if (!cap) return false;
  const stats = getCargoStats(transport);

  if (cargo.carryingFlag && !cap.allowsFlag) return false;

  if (isFootUnit(cargo.name)) {
    return stats.soldiers + 1 <= cap.maxSoldiers;
  }
  if (cargo.name === "Land mine" || cargo.name === "Naval mine") {
    return stats.mines < cap.maxMines && cap.allowedMines.includes(cargo.name as UnitName);
  }
  if (isShip(cargo.name)) {
    if (stats.ships >= cap.maxShips) return false;
    if (!cap.allowedShips.includes(cargo.name as UnitName)) return false;
    const nestedStats = getCargoStats(cargo);
    if (stats.soldiers + nestedStats.soldiers > cap.maxSoldiers) return false;
    if (nestedStats.hasFlag && !cap.allowsFlag) return false;
    return true;
  }
  if (isAircraft(cargo.name)) {
    return stats.planes < cap.maxPlanes && cap.allowedPlanes.includes(cargo.name as UnitName);
  }
  return false;
}

export function getLoadableAdjacentUnits(
  board: { unit: UnitInstance | null; terrain: string }[][],
  transport: UnitInstance, transportRow: number, transportCol: number
): Coord[] {
  const results: Coord[] = [];
  const dirs: Coord[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = transportRow + dr, nc = transportCol + dc;
    if (nr < 0 || nr >= 20 || nc < 0 || nc >= 20) continue;
    const cell = board[nr][nc];
    if (!cell.unit || cell.unit.owner !== transport.owner) continue;
    if (canLoadUnit(transport, cell.unit)) results.push([nr, nc]);
  }
  return results;
}

export function getUnloadTargets(
  board: { unit: UnitInstance | null; terrain: string }[][],
  cargoUnit: UnitInstance, transportRow: number, transportCol: number
): Coord[] {
  const results: Coord[] = [];
  const def = getUnitDef(cargoUnit.name);
  const dirs: Coord[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = transportRow + dr, nc = transportCol + dc;
    if (nr < 0 || nr >= 20 || nc < 0 || nc >= 20) continue;
    const cell = board[nr][nc];
    if (cell.unit !== null) continue;
    if (def.moveTerrain.includes(cell.terrain as any) || def.startTerrain.includes(cell.terrain as any)) {
      results.push([nr, nc]);
    }
  }
  return results;
}
