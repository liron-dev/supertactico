import {
  GameState,
  PieceId,
  Piece,
  Position,
  UnitType,
} from "../types";
import {
  TRANSPORT_CAPACITIES,
  FOOT_UNITS,
  NAVAL_SHIPS,
  AIRCRAFT,
  getTerrainForUnit,
} from "../constants/units";
import { BOARD_ROWS, BOARD_COLS } from "../constants/map";

function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

interface CargoCount {
  soldiers: number;
  mines: number;
  ships: number;
  planes: number;
  hasFlag: boolean;
}

function getCargoCount(
  piecesById: Record<string, Piece>,
  transportId: PieceId
): CargoCount {
  const transport = piecesById[transportId];
  const counts: CargoCount = {
    soldiers: 0,
    mines: 0,
    ships: 0,
    planes: 0,
    hasFlag: false,
  };

  for (const id of transport.carriedPieceIds) {
    const p = piecesById[id];
    if (!p.isAlive) continue;

    if (FOOT_UNITS.includes(p.type)) {
      counts.soldiers++;
      if (p.isCarryingEnemyFlag) counts.hasFlag = true;
    } else if (
      p.type === UnitType.LandMine ||
      p.type === UnitType.NavalMine
    ) {
      counts.mines++;
    } else if (NAVAL_SHIPS.includes(p.type)) {
      counts.ships++;
    } else if (AIRCRAFT.includes(p.type)) {
      counts.planes++;
    } else if (p.type === UnitType.Flag) {
      counts.hasFlag = true;
    }
  }

  return counts;
}

export function canLoad(
  state: GameState,
  transportId: PieceId,
  cargoId: PieceId
): boolean {
  const transport = state.piecesById[transportId];
  const cargo = state.piecesById[cargoId];
  if (!transport || !cargo || !transport.isAlive || !cargo.isAlive) return false;
  if (cargo.carriedByPieceId !== null) return false;

  // Must be adjacent
  const tPos = { row: transport.row, col: transport.col };
  const cPos = { row: cargo.row, col: cargo.col };
  if (!isAdjacent(tPos, cPos)) return false;

  // Can only transport own units (except enemy flag, which is carried by a soldier)
  if (cargo.owner !== transport.owner && cargo.type !== UnitType.Flag) return false;

  const capacity = TRANSPORT_CAPACITIES[transport.type];
  if (!capacity) return false;

  const counts = getCargoCount(state.piecesById, transportId);

  // Check capacity by cargo type
  if (FOOT_UNITS.includes(cargo.type)) {
    if (counts.soldiers >= capacity.maxSoldiers) return false;
  } else if (
    cargo.type === UnitType.LandMine ||
    cargo.type === UnitType.NavalMine
  ) {
    if (counts.mines >= capacity.maxMines) return false;
    if (!capacity.allowedMineTypes.includes(cargo.type)) return false;
  } else if (NAVAL_SHIPS.includes(cargo.type)) {
    if (counts.ships >= capacity.maxShips) return false;
    if (!capacity.allowedShipTypes.includes(cargo.type)) return false;
    // Ship being loaded must be empty
    if (cargo.carriedPieceIds.length > 0) return false;
  } else if (AIRCRAFT.includes(cargo.type)) {
    if (counts.planes >= capacity.maxPlanes) return false;
    if (!capacity.allowedPlaneTypes.includes(cargo.type)) return false;
  } else if (cargo.type === UnitType.Flag) {
    if (!capacity.canCarryFlag || counts.hasFlag) return false;
  }

  return true;
}

export function loadPiece(
  state: GameState,
  transportId: PieceId,
  cargoId: PieceId
): GameState {
  const transport = state.piecesById[transportId];
  const cargo = state.piecesById[cargoId];

  const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
  // Remove cargo from its cell
  newGrid[cargo.row][cargo.col] = {
    ...newGrid[cargo.row][cargo.col],
    pieceId: null,
  };

  const newPiecesById = { ...state.piecesById };
  newPiecesById[transportId] = {
    ...transport,
    carriedPieceIds: [...transport.carriedPieceIds, cargoId],
  };
  newPiecesById[cargoId] = {
    ...cargo,
    carriedByPieceId: transportId,
    row: transport.row,
    col: transport.col,
  };

  return {
    ...state,
    grid: newGrid,
    piecesById: newPiecesById,
  };
}

export function canUnload(
  state: GameState,
  transportId: PieceId,
  cargoId: PieceId,
  target: Position
): boolean {
  const transport = state.piecesById[transportId];
  const cargo = state.piecesById[cargoId];
  if (!transport || !cargo) return false;
  if (!transport.carriedPieceIds.includes(cargoId)) return false;

  if (
    target.row < 0 ||
    target.row >= BOARD_ROWS ||
    target.col < 0 ||
    target.col >= BOARD_COLS
  )
    return false;

  const tPos = { row: transport.row, col: transport.col };
  if (!isAdjacent(tPos, target)) return false;

  const targetCell = state.grid[target.row][target.col];
  if (targetCell.pieceId !== null) return false;

  // Check terrain compatibility for the cargo unit
  const terrain = targetCell.terrain;
  const allowed = getTerrainForUnit(cargo.type);
  if (!allowed.includes(terrain)) return false;

  return true;
}

export function unloadPiece(
  state: GameState,
  transportId: PieceId,
  cargoId: PieceId,
  target: Position
): GameState {
  const transport = state.piecesById[transportId];
  const cargo = state.piecesById[cargoId];

  const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
  newGrid[target.row][target.col] = {
    ...newGrid[target.row][target.col],
    pieceId: cargoId,
  };

  const newPiecesById = { ...state.piecesById };
  newPiecesById[transportId] = {
    ...transport,
    carriedPieceIds: transport.carriedPieceIds.filter((id) => id !== cargoId),
  };
  newPiecesById[cargoId] = {
    ...cargo,
    carriedByPieceId: null,
    row: target.row,
    col: target.col,
  };

  return {
    ...state,
    grid: newGrid,
    piecesById: newPiecesById,
  };
}

export function getLoadableTargets(
  state: GameState,
  transportId: PieceId
): PieceId[] {
  const transport = state.piecesById[transportId];
  if (!transport) return [];

  const targets: PieceId[] = [];
  const directions: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of directions) {
    const r = transport.row + dr;
    const c = transport.col + dc;
    if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) continue;
    const cell = state.grid[r][c];
    if (cell.pieceId && canLoad(state, transportId, cell.pieceId)) {
      targets.push(cell.pieceId);
    }
  }

  return targets;
}

export function getUnloadPositions(
  state: GameState,
  transportId: PieceId,
  cargoId: PieceId
): Position[] {
  const transport = state.piecesById[transportId];
  if (!transport) return [];

  const positions: Position[] = [];
  const directions: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of directions) {
    const target = { row: transport.row + dr, col: transport.col + dc };
    if (canUnload(state, transportId, cargoId, target)) {
      positions.push(target);
    }
  }

  return positions;
}
