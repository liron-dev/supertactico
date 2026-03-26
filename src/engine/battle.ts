import { Piece, BattleResult } from '../types/game';
import { getUnitDef, isFootUnit, canCaptureFlag } from '../constants/units';
import { ATTACKER_PRIORITY, UNIT_VICTORIES } from '../constants/battle';

export function resolveBattle(attacker: Piece, defender: Piece): BattleResult {
  const atkDef = getUnitDef(attacker.unitName);
  const defDef = getUnitDef(defender.unitName);
  const atkName = attacker.unitName;
  const defName = defender.unitName;

  let winner: 'attacker' | 'defender' | 'both_die' = 'both_die';

  // 1. Check attacker-priority special cases
  const atkPriority = ATTACKER_PRIORITY.find(
    ap => ap.attacker === atkName && ap.defender === defName
  );
  if (atkPriority) {
    winner = 'attacker';
  }
  // Also check reverse (defender would win if roles reversed, but they're the defender)
  else {
    // 2. Both have numeric ranks: compare ranks
    if (atkDef.rank !== null && defDef.rank !== null) {
      if (atkDef.rank > defDef.rank) winner = 'attacker';
      else if (atkDef.rank < defDef.rank) winner = 'defender';
      else winner = 'both_die';
    }
    // 3. Check unit_victories for the attacker
    else if (UNIT_VICTORIES[atkName]) {
      const atkVictories = UNIT_VICTORIES[atkName];
      if (atkVictories.defeats.includes('All')) {
        // Mines beat everything except exceptions
        if (atkVictories.except && atkVictories.except.includes(defName)) {
          winner = 'defender';
        } else {
          winner = 'attacker';
        }
      } else if (atkVictories.defeats.includes(defName)) {
        winner = 'attacker';
      } else {
        // Check if defender beats attacker
        winner = checkDefenderWins(atkName, defName);
      }
    }
    // 4. Check unit_victories for the defender
    else {
      winner = checkDefenderWins(atkName, defName);
    }
  }

  const isMineDefender = defName === 'Land mine' || defName === 'Naval mine';
  const isMineAttacker = atkName === 'Land mine' || atkName === 'Naval mine';
  const isFlagDefender = defName === 'Flag';
  const isFlagAttacker = atkName === 'Flag';

  // Determine flag effects
  let flagCaptured = false;
  let flagDropped = false;
  let flagReturned = false;

  if (isFlagDefender && winner === 'attacker' && canCaptureFlag(atkName)) {
    flagCaptured = true;
  }

  // When a flag carrier is defeated on land, flag drops
  if (attacker.carryingFlag && winner === 'defender') {
    flagDropped = true;
  }
  if (defender.carryingFlag && winner === 'attacker') {
    flagDropped = true;
  }

  // Check for life raft escape
  let lifeRaftEscape: Piece | null = null;
  if (winner === 'attacker') {
    // Defender lost - check if defender is a ship with a life raft
    lifeRaftEscape = findLifeRaftInCargo(defender);
  } else if (winner === 'defender' || winner === 'both_die') {
    // Attacker lost (or both die) - check attacker's ship (rare, but possible in theory)
    // Actually, the attacker is the one moving into the defender's cell
    // Life raft escape only applies to the defeated ship
    if (winner === 'defender') {
      lifeRaftEscape = findLifeRaftInCargo(attacker);
    }
  }

  // Check for flag return (ship sunk at sea without life raft carrying the flag)
  // This is handled at a higher level based on terrain

  return {
    attacker,
    defender,
    winner,
    attackerSurvives: winner === 'attacker',
    defenderSurvives: winner === 'defender',
    flagCaptured,
    flagDropped,
    flagReturned: false, // determined by caller based on context
    lifeRaftEscape,
    mineStays: (isMineDefender && winner === 'defender') || (isMineAttacker && winner === 'attacker'),
  };
}

function checkDefenderWins(atkName: string, defName: string): 'attacker' | 'defender' | 'both_die' {
  if (UNIT_VICTORIES[defName]) {
    const defVictories = UNIT_VICTORIES[defName];
    if (defVictories.defeats.includes('All')) {
      if (defVictories.except && defVictories.except.includes(atkName)) {
        return 'attacker';
      }
      return 'defender';
    }
    if (defVictories.defeats.includes(atkName)) {
      return 'defender';
    }
  }
  // If no specific rule found, both die (shouldn't normally happen with complete rules)
  return 'both_die';
}

function findLifeRaftInCargo(piece: Piece): Piece | null {
  for (const c of piece.cargo) {
    if (c.unitName === 'Life Raft') return c;
  }
  return null;
}
