import { Position, isLandOrIsland, isSea } from '../types/board';
import { UnitInstance } from '../types/unit';
import { GameState } from '../types/game';
import { getTransportCapacity } from '../constants/transportRules';
import { getUnitDefinition, isFootUnit } from '../constants/units';
import { isAdjacent, getOrthogonalNeighbors } from '../utils/adjacency';

/**
 * Get valid carrier positions where the selected unit can be loaded onto.
 */
export function getValidLoadTargets(
  state: GameState,
  unitPos: Position,
): Position[] {
  const cell = state.board[unitPos.row][unitPos.col];
  if (!cell.unit) return [];

  const unit = cell.unit;
  const neighbors = getOrthogonalNeighbors(unitPos);
  const targets: Position[] = [];

  for (const n of neighbors) {
    const targetCell = state.board[n.row][n.col];
    if (!targetCell.unit) continue;

    // Must be a friendly transport
    if (targetCell.unit.owner !== unit.owner) continue;

    if (canLoadUnit(unit, targetCell.unit)) {
      targets.push(n);
    }
  }

  return targets;
}

/**
 * Check if a unit can be loaded onto a carrier.
 */
export function canLoadUnit(unit: UnitInstance, carrier: UnitInstance): boolean {
  const capacity = getTransportCapacity(carrier.type);
  if (!capacity) return false;

  const unitDef = getUnitDefinition(unit.type);

  // Check if the unit is a foot soldier
  if (unitDef.category === 'foot') {
    // Check soldier capacity
    if (carrier.cargo.soldiers.length >= capacity.maxSoldiers) return false;

    // If unit is carrying the enemy flag, check if the carrier allows flags
    if (unit.carryingEnemyFlag && !capacity.allowsFlag) return false;

    return true;
  }

  // Check if the unit is a mine
  if (unitDef.category === 'immobile' && (unit.type === 'Land mine' || unit.type === 'Naval mine')) {
    if (carrier.cargo.mines.length >= capacity.maxMines) return false;
    if (!capacity.allowedMineTypes.includes(unit.type)) return false;
    return true;
  }

  // Check if the unit is a ship (Patrol Ship or Life Raft loading onto M7/M4)
  if (unitDef.category === 'naval') {
    if (capacity.maxShips === 0) return false;
    if (carrier.cargo.ship !== null) return false;
    if (!capacity.allowedShipTypes.includes(unit.type)) return false;

    // A Life Raft must be empty before being loaded onto another ship
    if (unit.type === 'Life Raft' || unit.type === 'Patrol Ship') {
      const hasAnyCargo =
        unit.cargo.soldiers.length > 0 ||
        unit.cargo.mines.length > 0 ||
        unit.cargo.ship !== null ||
        unit.cargo.plane !== null;
      if (hasAnyCargo) return false;
    }

    return true;
  }

  // Check if the unit is a plane (Reconnaissance Plane loading onto M7)
  if (unitDef.category === 'aircraft') {
    if (capacity.maxPlanes === 0) return false;
    if (carrier.cargo.plane !== null) return false;
    if (!capacity.allowedPlaneTypes.includes(unit.type)) return false;
    return true;
  }

  return false;
}

/**
 * Get valid positions where cargo can be unloaded from a carrier.
 */
export function getValidUnloadTargets(
  state: GameState,
  carrierPos: Position,
  cargoUnit: UnitInstance,
): Position[] {
  const carrier = state.board[carrierPos.row][carrierPos.col].unit;
  if (!carrier) return [];

  const neighbors = getOrthogonalNeighbors(carrierPos);
  const targets: Position[] = [];
  const cargoDef = getUnitDefinition(cargoUnit.type);

  for (const n of neighbors) {
    const targetCell = state.board[n.row][n.col];

    // Must be empty
    if (targetCell.unit) continue;

    // Must be valid terrain for the unloaded unit
    if (!cargoDef.moveTerrain.includes(targetCell.terrain) &&
        !cargoDef.startTerrain.includes(targetCell.terrain)) continue;

    targets.push(n);
  }

  return targets;
}

/**
 * Get all cargo items that can be unloaded from a carrier.
 */
export function getUnloadableItems(carrier: UnitInstance): UnitInstance[] {
  const items: UnitInstance[] = [];
  items.push(...carrier.cargo.soldiers);
  items.push(...carrier.cargo.mines);
  if (carrier.cargo.ship) items.push(carrier.cargo.ship);
  if (carrier.cargo.plane) items.push(carrier.cargo.plane);
  return items;
}
