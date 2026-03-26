import { Piece, Position, BoardState } from '../types/game';
import { getUnitDef, isFootUnit, isNavalUnit, isAircraftUnit } from '../constants/units';
import { getTransportCapacity } from '../constants/transport';
import { getAdjacent, getTerrain, getPiece, isLandOrIsland, isSeaTerrain } from '../utils/boardHelpers';

// Count soldiers in cargo (recursively - soldiers inside nested ships count)
function countTotalSoldiers(piece: Piece): number {
  let count = 0;
  for (const c of piece.cargo) {
    if (isFootUnit(c.unitName)) count++;
    // Soldiers inside nested transports also count toward parent capacity
    count += countTotalSoldiers(c);
  }
  return count;
}

function countMines(piece: Piece): number {
  return piece.cargo.filter(c =>
    c.unitName === 'Land mine' || c.unitName === 'Naval mine'
  ).length;
}

function countShips(piece: Piece): number {
  return piece.cargo.filter(c => isNavalUnit(c.unitName)).length;
}

function countPlanes(piece: Piece): number {
  return piece.cargo.filter(c => isAircraftUnit(c.unitName)).length;
}

function hasFlagInCargo(piece: Piece): boolean {
  for (const c of piece.cargo) {
    if (c.carryingFlag) return true;
    if (hasFlagInCargo(c)) return true;
  }
  return false;
}

// Check if a unit can be loaded onto a transport
export function canLoad(
  transport: Piece,
  cargoUnit: Piece
): boolean {
  const capacity = getTransportCapacity(transport.unitName);
  if (!capacity) return false;

  const cargoName = cargoUnit.unitName;
  const cargoDef = getUnitDef(cargoName);

  // Check what type of unit this is and if there's capacity
  if (isFootUnit(cargoName)) {
    // Count total soldiers (including those inside nested transports)
    const currentSoldiers = countTotalSoldiers(transport);
    const flagSlots = hasFlagInCargo(transport) ? 1 : 0;
    const incomingSoldierCount = 1 + countTotalSoldiers(cargoUnit);
    const incomingFlagSlot = cargoUnit.carryingFlag ? 1 : 0;

    if (capacity.flagOccupiesSlot) {
      if (currentSoldiers + flagSlots + incomingSoldierCount + incomingFlagSlot > capacity.maxSoldiers) {
        return false;
      }
    } else {
      if (currentSoldiers + incomingSoldierCount > capacity.maxSoldiers) {
        return false;
      }
    }
    return true;
  }

  if (cargoName === 'Land mine' || cargoName === 'Naval mine') {
    if (!capacity.allowedMineTypes.includes(cargoName)) return false;
    return countMines(transport) < capacity.maxMines;
  }

  if (isNavalUnit(cargoName)) {
    if (!capacity.allowedShipTypes.includes(cargoName)) return false;
    if (countShips(transport) >= capacity.maxAdditionalShips) return false;

    // Special rule: when loading a ship (e.g., Life Raft) onto M7,
    // the ship's soldiers count toward the parent's total
    const totalSoldiersAfterLoad = countTotalSoldiers(transport) + countTotalSoldiers(cargoUnit);
    const flagSlots = (hasFlagInCargo(transport) ? 1 : 0) + (hasFlagInCargo(cargoUnit) ? 1 : 0);
    if (capacity.flagOccupiesSlot) {
      if (totalSoldiersAfterLoad + flagSlots > capacity.maxSoldiers) return false;
    } else {
      if (totalSoldiersAfterLoad > capacity.maxSoldiers) return false;
    }
    return true;
  }

  if (isAircraftUnit(cargoName)) {
    if (!capacity.allowedPlaneTypes.includes(cargoName)) return false;
    return countPlanes(transport) < capacity.maxAdditionalPlanes;
  }

  return false;
}

// Get adjacent positions from which units can be loaded onto the transport at pos
export function getLoadablePositions(
  board: BoardState,
  transportPos: Position
): Position[] {
  const transport = getPiece(board, transportPos);
  if (!transport) return [];

  const capacity = getTransportCapacity(transport.unitName);
  if (!capacity) return [];

  return getAdjacent(transportPos).filter(adj => {
    const piece = getPiece(board, adj);
    if (!piece) return false;
    if (piece.player !== transport.player) return false;

    // Check terrain adjacency rules: loading between adjacent land/sea is allowed
    return canLoad(transport, piece);
  });
}

// Get valid unload target positions for a specific cargo item
export function getUnloadTargets(
  board: BoardState,
  transportPos: Position,
  cargoIndex: number
): Position[] {
  const transport = getPiece(board, transportPos);
  if (!transport || cargoIndex < 0 || cargoIndex >= transport.cargo.length) return [];

  const cargoUnit = transport.cargo[cargoIndex];
  const cargoDef = getUnitDef(cargoUnit.unitName);

  return getAdjacent(transportPos).filter(adj => {
    // Cell must be empty
    if (getPiece(board, adj)) return false;

    const terrain = getTerrain(board, adj);

    // Check terrain compatibility for the unloaded unit
    if (cargoDef.moveTerrain === 'immobile') {
      // Mines can be placed on appropriate terrain
      if (cargoUnit.unitName === 'Land mine') return terrain === 'L' || terrain === 'I';
      if (cargoUnit.unitName === 'Naval mine') return terrain === 'S';
      return false;
    }

    return (cargoDef.moveTerrain as string[]).includes(terrain);
  });
}
