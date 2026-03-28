import {
  GameState,
  PieceId,
  Piece,
  UnitType,
  CombatResult,
  LifeRaftEscapeState,
  TerrainType,
  Position,
} from "../types";
import {
  COMBAT_RANK,
  FOOT_UNITS,
  NAVAL_SHIPS,
  AIRCRAFT,
} from "../constants/units";
import { BOARD_ROWS, BOARD_COLS } from "../constants/map";
import { isSea, isGround } from "./mapParser";

const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function canAttack(
  state: GameState,
  attackerId: PieceId,
  targetRow: number,
  targetCol: number
): boolean {
  const attacker = state.piecesById[attackerId];
  if (!attacker || !attacker.isAlive) return false;

  const cell = state.grid[targetRow][targetCol];
  if (!cell.pieceId) return false;

  const defender = state.piecesById[cell.pieceId];
  if (defender.owner === attacker.owner) return false;

  // Marine attack restriction: no Sea <-> Ground attacks
  const aTerrain = state.grid[attacker.row][attacker.col].terrain;
  const dTerrain = state.grid[targetRow][targetCol].terrain;
  if (isSea(aTerrain) && isGround(dTerrain)) return false;
  if (isGround(aTerrain) && isSea(dTerrain)) return false;

  // Aircraft check adjacency differently (they can attack from range)
  if (AIRCRAFT.includes(attacker.type)) return true;

  // Normal adjacency check
  const dr = Math.abs(attacker.row - targetRow);
  const dc = Math.abs(attacker.col - targetCol);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

// Special units that certain attackers always beat
const COMMANDO_BEATS: UnitType[] = [
  UnitType.NavySeal,
  UnitType.NavalMine,
  UnitType.LandMine,
  UnitType.Flag,
  UnitType.FighterPlane,
  UnitType.ReconPlane,
];

const NAVY_SEAL_BEATS: UnitType[] = [
  UnitType.NavalMine,
  UnitType.FighterPlane,
  UnitType.ReconPlane,
  UnitType.Flag,
];

export function resolveCombat(
  attacker: Piece,
  defender: Piece
): CombatResult {
  const result: CombatResult = {
    winner: "attacker",
    attackerDies: false,
    defenderDies: false,
    flagCaptured: false,
    flagDropped: false,
    flagReturnedToOwner: false,
    lifeRaftEscape: null,
  };

  const aType = attacker.type;
  const dType = defender.type;

  // === Special attacker-priority rules ===
  if (aType === UnitType.Commando && dType === UnitType.RavAluf) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }
  if (aType === UnitType.NavySeal && dType === UnitType.M7Ship) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }
  if (aType === UnitType.NavySeal && dType === UnitType.RavAluf) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }

  // === Mine rules (defender is mine) ===
  if (dType === UnitType.LandMine) {
    if (aType === UnitType.Commando) {
      result.winner = "attacker";
      result.defenderDies = true;
      return result;
    }
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }
  if (dType === UnitType.NavalMine) {
    if (
      aType === UnitType.NavySeal ||
      aType === UnitType.Commando ||
      aType === UnitType.M7Ship
    ) {
      result.winner = "attacker";
      result.defenderDies = true;
      return result;
    }
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }

  // === Attacker is mine (rare but possible if mine somehow attacks) ===
  if (aType === UnitType.LandMine || aType === UnitType.NavalMine) {
    // Mines can't attack (immobile), but handle defensively
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }

  // === Flag rules ===
  if (dType === UnitType.Flag) {
    // Flag "defeats" Navy Seal, Fighter Plane, Recon Plane (they can't capture it)
    if (
      aType === UnitType.NavySeal ||
      aType === UnitType.FighterPlane ||
      aType === UnitType.ReconPlane
    ) {
      result.winner = "defender";
      result.attackerDies = true;
      return result;
    }
    // Commando can capture flag
    if (aType === UnitType.Commando) {
      result.winner = "attacker";
      result.defenderDies = true;
      result.flagCaptured = true;
      return result;
    }
    // Any foot soldier can capture flag
    if (FOOT_UNITS.includes(aType)) {
      result.winner = "attacker";
      result.defenderDies = true;
      result.flagCaptured = true;
      return result;
    }
    // Ships can capture flag too (transported soldier captures)
    result.winner = "attacker";
    result.defenderDies = true;
    result.flagCaptured = true;
    return result;
  }

  // === Commando special victories ===
  if (aType === UnitType.Commando && COMMANDO_BEATS.includes(dType)) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }

  // === Navy Seal special victories ===
  if (aType === UnitType.NavySeal && NAVY_SEAL_BEATS.includes(dType)) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }

  // === Ship combat ===
  if (aType === UnitType.M7Ship) {
    const m7Beats = [
      UnitType.M4Ship,
      UnitType.PatrolShip,
      UnitType.LifeRaft,
      UnitType.FighterPlane,
      UnitType.ReconPlane,
      UnitType.NavalMine,
    ];
    if (m7Beats.includes(dType)) {
      result.winner = "attacker";
      result.defenderDies = true;
      return result;
    }
  }
  if (aType === UnitType.M4Ship) {
    const m4Beats = [
      UnitType.PatrolShip,
      UnitType.LifeRaft,
      UnitType.FighterPlane,
      UnitType.ReconPlane,
    ];
    if (m4Beats.includes(dType)) {
      result.winner = "attacker";
      result.defenderDies = true;
      return result;
    }
  }
  if (aType === UnitType.PatrolShip && dType === UnitType.LifeRaft) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }

  // === Life Raft beats planes ===
  if (
    aType === UnitType.LifeRaft &&
    (dType === UnitType.FighterPlane || dType === UnitType.ReconPlane)
  ) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }

  // === Fighter Plane beats Recon Plane ===
  if (aType === UnitType.FighterPlane && dType === UnitType.ReconPlane) {
    result.winner = "attacker";
    result.defenderDies = true;
    return result;
  }

  // === Reverse: defender special rules (when defender would beat attacker) ===
  // Check if defender type would beat attacker type if roles reversed
  if (dType === UnitType.M7Ship) {
    const m7Beats = [
      UnitType.M4Ship,
      UnitType.PatrolShip,
      UnitType.LifeRaft,
      UnitType.FighterPlane,
      UnitType.ReconPlane,
      UnitType.NavalMine,
    ];
    if (m7Beats.includes(aType)) {
      result.winner = "defender";
      result.attackerDies = true;
      return result;
    }
  }
  if (dType === UnitType.M4Ship) {
    const m4Beats = [
      UnitType.PatrolShip,
      UnitType.LifeRaft,
      UnitType.FighterPlane,
      UnitType.ReconPlane,
    ];
    if (m4Beats.includes(aType)) {
      result.winner = "defender";
      result.attackerDies = true;
      return result;
    }
  }
  if (dType === UnitType.PatrolShip && aType === UnitType.LifeRaft) {
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }
  if (
    dType === UnitType.LifeRaft &&
    (aType === UnitType.FighterPlane || aType === UnitType.ReconPlane)
  ) {
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }
  if (dType === UnitType.FighterPlane && aType === UnitType.ReconPlane) {
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }
  // Defender Commando/NavySeal special cases
  if (dType === UnitType.Commando && aType === UnitType.RavAluf) {
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }
  if (
    dType === UnitType.NavySeal &&
    (aType === UnitType.M7Ship || aType === UnitType.RavAluf)
  ) {
    result.winner = "defender";
    result.attackerDies = true;
    return result;
  }

  // === Ranked combat (foot soldiers) ===
  const aRank = COMBAT_RANK[aType];
  const dRank = COMBAT_RANK[dType];
  if (aRank !== undefined && dRank !== undefined) {
    if (aRank > dRank) {
      result.winner = "attacker";
      result.defenderDies = true;
      return result;
    }
    if (dRank > aRank) {
      result.winner = "defender";
      result.attackerDies = true;
      return result;
    }
    // Equal rank: both die
    result.winner = "draw";
    result.attackerDies = true;
    result.defenderDies = true;
    return result;
  }

  // === Same type tie (ships, etc.) ===
  if (aType === dType) {
    result.winner = "draw";
    result.attackerDies = true;
    result.defenderDies = true;
    return result;
  }

  // Fallback: attacker wins (shouldn't reach here normally)
  result.winner = "attacker";
  result.defenderDies = true;
  return result;
}

function destroyPieceAndCargo(
  piecesById: Record<string, Piece>,
  pieceId: PieceId
): Record<string, Piece> {
  const piece = piecesById[pieceId];
  if (!piece) return piecesById;

  let updated = { ...piecesById };
  // Recursively destroy all carried pieces
  for (const carriedId of piece.carriedPieceIds) {
    updated = destroyPieceAndCargo(updated, carriedId);
  }
  updated[pieceId] = { ...piece, isAlive: false, carriedPieceIds: [] };
  return updated;
}

function findLifeRaft(
  piecesById: Record<string, Piece>,
  shipId: PieceId
): Piece | null {
  const ship = piecesById[shipId];
  for (const carriedId of ship.carriedPieceIds) {
    const carried = piecesById[carriedId];
    if (carried.type === UnitType.LifeRaft && carried.isAlive) {
      return carried;
    }
  }
  return null;
}

export function applyCombatResult(
  state: GameState,
  attackerId: PieceId,
  defenderId: PieceId,
  result: CombatResult
): GameState {
  const attacker = state.piecesById[attackerId];
  const defender = state.piecesById[defenderId];
  let newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
  let newPiecesById = { ...state.piecesById };
  let newState = { ...state };

  if (result.winner === "draw") {
    // Both die
    newPiecesById = destroyPieceAndCargo(newPiecesById, attackerId);
    newPiecesById = destroyPieceAndCargo(newPiecesById, defenderId);
    newGrid[attacker.row][attacker.col] = {
      ...newGrid[attacker.row][attacker.col],
      pieceId: null,
    };
    newGrid[defender.row][defender.col] = {
      ...newGrid[defender.row][defender.col],
      pieceId: null,
    };

    // Handle flag drop
    if (attacker.isCarryingEnemyFlag && isGround(newGrid[attacker.row][attacker.col].terrain)) {
      // Drop flag on attacker's position (flag stays on land)
      // We need to find the flag piece and resurrect it
      const flagPiece = findCarriedFlag(newPiecesById, attackerId);
      if (flagPiece) {
        newPiecesById[flagPiece.id] = {
          ...flagPiece,
          isAlive: true,
          row: attacker.row,
          col: attacker.col,
          carriedByPieceId: null,
        };
        newGrid[attacker.row][attacker.col] = {
          ...newGrid[attacker.row][attacker.col],
          pieceId: flagPiece.id,
        };
      }
    }
  } else if (result.winner === "attacker") {
    // Defender dies
    const hasLifeRaft =
      NAVAL_SHIPS.includes(defender.type) &&
      findLifeRaft(newPiecesById, defenderId) !== null;

    if (hasLifeRaft && defender.carriedPieceIds.length > 0) {
      // Life raft escape scenario
      const raft = findLifeRaft(newPiecesById, defenderId)!;
      const soldiers = defender.carriedPieceIds
        .filter((id) => {
          const p = newPiecesById[id];
          return FOOT_UNITS.includes(p.type) && p.isAlive && id !== raft.id;
        });

      newState.pendingLifeRaftEscape = {
        lifeRaftId: raft.id,
        sunkShipPosition: { row: defender.row, col: defender.col },
        maxEscapees: 2,
        eligibleSoldierIds: soldiers.slice(0, 2),
      };
    }

    newPiecesById = destroyPieceAndCargo(newPiecesById, defenderId);
    newGrid[defender.row][defender.col] = {
      ...newGrid[defender.row][defender.col],
      pieceId: null,
    };

    // Move attacker to defender's position (unless defender was a mine)
    if (
      defender.type !== UnitType.LandMine &&
      defender.type !== UnitType.NavalMine
    ) {
      newGrid[attacker.row][attacker.col] = {
        ...newGrid[attacker.row][attacker.col],
        pieceId: null,
      };
      newGrid[defender.row][defender.col] = {
        ...newGrid[defender.row][defender.col],
        pieceId: attackerId,
      };
      newPiecesById[attackerId] = {
        ...newPiecesById[attackerId],
        row: defender.row,
        col: defender.col,
      };
      // Update carried pieces positions
      for (const cId of attacker.carriedPieceIds) {
        newPiecesById[cId] = {
          ...newPiecesById[cId],
          row: defender.row,
          col: defender.col,
        };
      }
    }

    // Handle flag capture
    if (result.flagCaptured) {
      newPiecesById[attackerId] = {
        ...newPiecesById[attackerId],
        isCarryingEnemyFlag: true,
      };
    }
  } else {
    // Defender wins
    newPiecesById = destroyPieceAndCargo(newPiecesById, attackerId);
    newGrid[attacker.row][attacker.col] = {
      ...newGrid[attacker.row][attacker.col],
      pieceId: null,
    };

    // Handle flag drop when flag carrier dies on land
    if (attacker.isCarryingEnemyFlag) {
      const terrain = newGrid[attacker.row][attacker.col].terrain;
      if (isGround(terrain)) {
        const flagPiece = findCarriedFlag(state.piecesById, attackerId);
        if (flagPiece) {
          newPiecesById[flagPiece.id] = {
            ...flagPiece,
            isAlive: true,
            row: attacker.row,
            col: attacker.col,
            carriedByPieceId: null,
          };
          newGrid[attacker.row][attacker.col] = {
            ...newGrid[attacker.row][attacker.col],
            pieceId: flagPiece.id,
          };
        }
      } else if (isSea(terrain)) {
        // Flag returns to original owner for re-placement
        newState.pendingFlagReturn = attacker.owner === "yellow" ? "blue" : "yellow" as any;
      }
    }

    // Mine stays in place (defender doesn't move)
  }

  return {
    ...newState,
    grid: newGrid,
    piecesById: newPiecesById,
  };
}

function findCarriedFlag(
  piecesById: Record<string, Piece>,
  carrierId: PieceId
): Piece | null {
  const carrier = piecesById[carrierId];
  for (const id of carrier.carriedPieceIds) {
    const p = piecesById[id];
    if (p.type === UnitType.Flag) return p;
  }
  return null;
}
