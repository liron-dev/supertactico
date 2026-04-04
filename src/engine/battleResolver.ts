import { BoardCell, Position } from '../types/board';
import { Player, UnitInstance } from '../types/unit';
import { resolveBattleResult, canCaptureFlag, BattleResult } from '../constants/battleRules';
import { getOrthogonalNeighbors } from '../utils/adjacency';

export interface BattleOutcome {
  result: BattleResult;
  attackerSurvives: boolean;
  defenderSurvives: boolean;
  // If attacker won against a flag, the attacker captures it
  flagCaptured: boolean;
  // If a flag carrier is defeated on land, the flag drops at their position
  flagDroppedAt: Position | null;
  flagDroppedOwner: Player | null;
  // If a ship carrying flag is defeated at sea without life raft, flag returns to owner
  flagReturnedTo: Player | null;
  // Life raft escape opportunity
  lifeRaftEscape: {
    raft: UnitInstance;
    availableSoldiers: UnitInstance[];
    maxEscapees: number;
    adjacentSeaCells: Position[];
  } | null;
  // All cargo destroyed with the defeated unit
  cargoDestroyed: UnitInstance[];
  // Whether the defender is a mine (stays in place if it wins)
  defenderIsMine: boolean;
}

/**
 * Resolve a complete battle including all side effects.
 */
export function resolveBattle(
  attacker: UnitInstance,
  defender: UnitInstance,
  attackerPos: Position,
  defenderPos: Position,
  board: BoardCell[][],
): BattleOutcome {
  const result = resolveBattleResult(attacker.type, defender.type);
  const defenderIsMine = defender.type === 'Land mine' || defender.type === 'Naval mine';

  const outcome: BattleOutcome = {
    result,
    attackerSurvives: result === 'attacker_wins',
    defenderSurvives: result === 'defender_wins',
    flagCaptured: false,
    flagDroppedAt: null,
    flagDroppedOwner: null,
    flagReturnedTo: null,
    lifeRaftEscape: null,
    cargoDestroyed: [],
    defenderIsMine,
  };

  if (result === 'attacker_wins') {
    handleAttackerWins(outcome, attacker, defender, attackerPos, defenderPos, board);
  } else if (result === 'defender_wins') {
    handleDefenderWins(outcome, attacker, defender, attackerPos, defenderPos, board);
  } else {
    // both_die
    handleBothDie(outcome, attacker, defender, attackerPos, defenderPos, board);
  }

  return outcome;
}

function handleAttackerWins(
  outcome: BattleOutcome,
  attacker: UnitInstance,
  defender: UnitInstance,
  attackerPos: Position,
  defenderPos: Position,
  board: BoardCell[][],
) {
  // Check if attacker captured the flag
  if (defender.type === 'Flag' && canCaptureFlag(attacker.type)) {
    outcome.flagCaptured = true;
  }

  // Destroy defender's cargo recursively
  outcome.cargoDestroyed = collectAllCargo(defender);

  // Check for life raft escape from defeated transport
  checkLifeRaftEscape(outcome, defender, defenderPos, board);

  // If defender was carrying the enemy flag
  if (defender.carryingEnemyFlag) {
    const defenderTerrain = board[defenderPos.row][defenderPos.col].terrain;
    if (defenderTerrain === 'L' || defenderTerrain === 'I') {
      // Flag drops at the defender's position on land
      outcome.flagDroppedAt = defenderPos;
      outcome.flagDroppedOwner = attacker.owner; // The flag belongs to the attacker's side (it's the enemy flag of defender)
    }
    // If defender is at sea and has no life raft with flag, it's handled in cargo check
  }

  // Check if any cargo soldier was carrying the enemy flag (ship defeated at sea)
  if (!outcome.flagDroppedAt && !outcome.flagCaptured) {
    checkFlagInCargo(outcome, defender, defenderPos, board);
  }
}

function handleDefenderWins(
  outcome: BattleOutcome,
  attacker: UnitInstance,
  defender: UnitInstance,
  attackerPos: Position,
  defenderPos: Position,
  board: BoardCell[][],
) {
  // Destroy attacker's cargo recursively
  outcome.cargoDestroyed = collectAllCargo(attacker);

  // If attacker was carrying the enemy flag on land, flag drops at attacker's position
  if (attacker.carryingEnemyFlag) {
    const attackerTerrain = board[attackerPos.row][attackerPos.col].terrain;
    if (attackerTerrain === 'L' || attackerTerrain === 'I') {
      outcome.flagDroppedAt = attackerPos;
      outcome.flagDroppedOwner = defender.owner; // The flag belongs to defender's side
    }
  }
}

function handleBothDie(
  outcome: BattleOutcome,
  attacker: UnitInstance,
  defender: UnitInstance,
  attackerPos: Position,
  defenderPos: Position,
  board: BoardCell[][],
) {
  // Both destroyed with all cargo
  outcome.cargoDestroyed = [...collectAllCargo(attacker), ...collectAllCargo(defender)];

  // Check for dropped flags
  if (attacker.carryingEnemyFlag) {
    const attackerTerrain = board[attackerPos.row][attackerPos.col].terrain;
    if (attackerTerrain === 'L' || attackerTerrain === 'I') {
      outcome.flagDroppedAt = attackerPos;
      outcome.flagDroppedOwner = defender.owner;
    }
  }
  if (defender.carryingEnemyFlag) {
    const defenderTerrain = board[defenderPos.row][defenderPos.col].terrain;
    if (defenderTerrain === 'L' || defenderTerrain === 'I') {
      // If attacker also dropped a flag, this is a very edge case
      // Both flags drop at their respective positions
      if (!outcome.flagDroppedAt) {
        outcome.flagDroppedAt = defenderPos;
        outcome.flagDroppedOwner = attacker.owner;
      }
    }
  }
}

/**
 * Check if a defeated transport had a life raft for escape.
 */
function checkLifeRaftEscape(
  outcome: BattleOutcome,
  defeatedUnit: UnitInstance,
  defenderPos: Position,
  board: BoardCell[][],
) {
  const defenderTerrain = board[defenderPos.row][defenderPos.col].terrain;
  if (defenderTerrain !== 'S') return; // Only at sea

  // Check if the defeated ship has a life raft in cargo
  const raft = defeatedUnit.cargo.ship;
  if (!raft || raft.type !== 'Life Raft') return;

  // Get available soldiers from the defeated ship's cargo
  const availableSoldiers = defeatedUnit.cargo.soldiers.filter(s => s.category === 'foot');

  if (availableSoldiers.length === 0) return;

  // Find adjacent empty sea cells for the raft
  const adjacentSeaCells = getOrthogonalNeighbors(defenderPos).filter(n => {
    const cell = board[n.row][n.col];
    return cell.terrain === 'S' && !cell.unit;
  });

  if (adjacentSeaCells.length === 0) return; // No escape route

  outcome.lifeRaftEscape = {
    raft,
    availableSoldiers,
    maxEscapees: 2, // Life raft can carry up to 2 soldiers (or 1 soldier + flag)
    adjacentSeaCells,
  };
}

/**
 * Check if any soldier in the cargo was carrying the enemy flag.
 * If so, and the transport is defeated at sea without life raft escape for the flag,
 * the flag returns to its original owner.
 */
function checkFlagInCargo(
  outcome: BattleOutcome,
  defeatedUnit: UnitInstance,
  pos: Position,
  board: BoardCell[][],
) {
  const terrain = board[pos.row][pos.col].terrain;
  if (terrain !== 'S') return;

  // Search cargo for a soldier carrying the enemy flag
  const flagCarrier = findFlagCarrierInCargo(defeatedUnit);
  if (!flagCarrier) return;

  // If there's a life raft escape, the flag carrier might escape
  if (outcome.lifeRaftEscape) return; // Will be handled during escape

  // Flag returns to its original owner
  // The flag belongs to the opponent of the defeated unit's owner
  // (the defeated unit was carrying the ENEMY flag, so the flag owner is the opponent)
  outcome.flagReturnedTo = flagCarrier.owner === defeatedUnit.owner
    ? defeatedUnit.owner // shouldn't happen normally
    : defeatedUnit.owner; // The enemy flag belongs to the defeatedUnit's opponent
  // Wait - the soldier carrying the flag is on the same team as the defeated ship.
  // The soldier's carryingEnemyFlag means it's carrying the OTHER team's flag.
  // So the flag belongs to the opponent of the soldier's owner.
  const flagBelongsTo = flagCarrier.owner === 'yellow' ? 'blue' : 'yellow';
  outcome.flagReturnedTo = flagBelongsTo;
}

function findFlagCarrierInCargo(unit: UnitInstance): UnitInstance | null {
  for (const soldier of unit.cargo.soldiers) {
    if (soldier.carryingEnemyFlag) return soldier;
  }
  // Check nested ship cargo
  if (unit.cargo.ship) {
    const found = findFlagCarrierInCargo(unit.cargo.ship);
    if (found) return found;
  }
  return null;
}

/**
 * Recursively collect all cargo units (for destruction).
 */
function collectAllCargo(unit: UnitInstance): UnitInstance[] {
  const all: UnitInstance[] = [];
  for (const s of unit.cargo.soldiers) {
    all.push(s);
    all.push(...collectAllCargo(s));
  }
  for (const m of unit.cargo.mines) {
    all.push(m);
  }
  if (unit.cargo.ship) {
    all.push(unit.cargo.ship);
    all.push(...collectAllCargo(unit.cargo.ship));
  }
  if (unit.cargo.plane) {
    all.push(unit.cargo.plane);
    all.push(...collectAllCargo(unit.cargo.plane));
  }
  return all;
}
