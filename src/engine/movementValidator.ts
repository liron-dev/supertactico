import { BoardCell, Position, posKey, isLandOrIsland, isSea } from '../types/board';
import { GameState } from '../types/game';
import { UnitInstance } from '../types/unit';
import { getUnitDefinition } from '../constants/units';
import { getOrthogonalNeighbors } from '../utils/adjacency';
import { getPlaneMoveCells } from '../utils/pathfinding';

/**
 * Get all valid move destinations for a unit at the given position.
 */
export function getValidMoves(
  state: GameState,
  pos: Position,
): Position[] {
  const cell = state.board[pos.row][pos.col];
  if (!cell.unit) return [];

  const unit = cell.unit;
  const def = getUnitDefinition(unit.type);

  // Immobile units can't move
  if (def.isImmobile) return [];

  // Aircraft (planes) have unlimited range along clear paths
  if (def.category === 'aircraft') {
    const moves = getPlaneMoveCells(pos, state.board, unit);
    return filterByOscillation(moves, unit.id, pos, state);
  }

  // Standard units: move 1 square orthogonally
  const neighbors = getOrthogonalNeighbors(pos);
  const validMoves: Position[] = [];

  for (const n of neighbors) {
    const targetCell = state.board[n.row][n.col];

    // Must be empty
    if (targetCell.unit) continue;

    // Must be valid terrain for this unit
    if (!def.moveTerrain.includes(targetCell.terrain)) continue;

    validMoves.push(n);
  }

  return filterByOscillation(validMoves, unit.id, pos, state);
}

/**
 * Filter out moves that would violate the back-and-forth (oscillation) rule.
 * A unit may move at most twice back-and-forth between the same two spaces.
 */
function filterByOscillation(
  moves: Position[],
  unitId: string,
  currentPos: Position,
  state: GameState,
): Position[] {
  const history = state.moveHistory[unitId] || [];
  if (history.length < 3) return moves;

  // Check the last 3 moves for an A->B->A->B pattern
  const last3 = history.slice(-3);
  // If last 3 moves form: ?->A, A->B, B->A (the unit is at A now)
  // Then moving back to B would be the 3rd back-and-forth, which is blocked
  if (last3.length === 3) {
    const posA = last3[0].to;
    const posB = last3[1].to;
    const posC = last3[2].to;

    // Check if it's an oscillation: A, B, A pattern in the "to" positions
    // and current position is the last "to"
    const fromKey = posKey(currentPos);
    const aKey = posKey(last3[0].from);
    const bKey = posKey(posA);

    // Detect: ...moved from X to Y, then Y to X, then X to Y...
    // If last moves were: ..., from->posA, posA->posB, posB->posA
    // and posA == last3[0].from == currentPos, then moving to posB is blocked
    if (
      posKey(posA) === posKey(last3[2].to) && // oscillation target
      posKey(last3[1].from) === posKey(posA) &&
      posKey(last3[1].to) === posKey(posB) &&
      posKey(last3[2].from) === posKey(posB) &&
      posKey(last3[2].to) === posKey(posA)
    ) {
      // Block moving back to posB
      return moves.filter(m => posKey(m) !== posKey(posB));
    }
  }

  return moves;
}

/**
 * Get cells where a unit can attack (adjacent enemy units).
 * Respects no-marine-attack rule.
 */
export function getValidAttacks(
  state: GameState,
  pos: Position,
): Position[] {
  const cell = state.board[pos.row][pos.col];
  if (!cell.unit) return [];

  const unit = cell.unit;
  const def = getUnitDefinition(unit.type);

  // Immobile units can't attack
  if (def.isImmobile) return [];

  // For planes, attacks are at the end of clear paths (handled specially)
  if (def.category === 'aircraft') {
    const { getPlaneAttackCells } = require('../utils/pathfinding');
    return getPlaneAttackCells(pos, state.board, unit);
  }

  // Standard units: attack adjacent enemy units
  const neighbors = getOrthogonalNeighbors(pos);
  const validAttacks: Position[] = [];
  const unitTerrain = cell.terrain;

  for (const n of neighbors) {
    const targetCell = state.board[n.row][n.col];

    // Must have an enemy unit
    if (!targetCell.unit || targetCell.unit.owner === unit.owner) continue;

    // No marine attacks: cannot attack across land/sea boundary
    const attackerOnLand = isLandOrIsland(unitTerrain);
    const defenderOnLand = isLandOrIsland(targetCell.terrain);
    const attackerOnSea = isSea(unitTerrain);
    const defenderOnSea = isSea(targetCell.terrain);

    if (attackerOnLand && defenderOnLand) {
      validAttacks.push(n);
    } else if (attackerOnSea && defenderOnSea) {
      validAttacks.push(n);
    }
    // else: marine attack, not allowed
  }

  return validAttacks;
}

/**
 * Check if a unit can pick up a dropped enemy flag by moving to its cell.
 */
export function getValidFlagPickups(
  state: GameState,
  pos: Position,
): Position[] {
  const cell = state.board[pos.row][pos.col];
  if (!cell.unit) return [];

  const unit = cell.unit;

  // Only foot units (not Navy Seal) can pick up the flag
  if (unit.category !== 'foot' || unit.type === 'Navy Seal') return [];

  const neighbors = getOrthogonalNeighbors(pos);
  const pickups: Position[] = [];

  for (const n of neighbors) {
    const targetCell = state.board[n.row][n.col];
    // Cell must have a dropped enemy flag and be empty of units
    if (targetCell.droppedFlag && targetCell.droppedFlag !== unit.owner && !targetCell.unit) {
      const def = getUnitDefinition(unit.type);
      if (def.moveTerrain.includes(targetCell.terrain)) {
        pickups.push(n);
      }
    }
  }

  return pickups;
}
