import { UnitTypeName } from '../types/unit';

export type BattleResult = 'attacker_wins' | 'defender_wins' | 'both_die';

// Special rules where the attacker always wins regardless of rank
const ATTACKER_PRIORITY: [UnitTypeName, UnitTypeName][] = [
  ['Commando', 'Rav Aluf'],
  ['Navy Seal', 'M7 Ship'],
  ['Navy Seal', 'Rav Aluf'],
];

// Units that a given unit defeats (when it's involved in combat in either role)
const UNIT_DEFEATS: Partial<Record<UnitTypeName, UnitTypeName[]>> = {
  'Commando': ['Navy Seal', 'Naval mine', 'Land mine', 'Flag', 'Fighter Plane', 'Reconnaissance Plane'],
  'Navy Seal': ['Naval mine', 'Fighter Plane', 'Reconnaissance Plane', 'Flag'],
  'Fighter Plane': ['Reconnaissance Plane'],
  'M7 Ship': ['M4 Ship', 'Patrol Ship', 'Life Raft', 'Fighter Plane', 'Reconnaissance Plane', 'Naval mine'],
  'M4 Ship': ['Patrol Ship', 'Life Raft', 'Fighter Plane', 'Reconnaissance Plane'],
  'Patrol Ship': ['Life Raft'],
  'Life Raft': ['Fighter Plane', 'Reconnaissance Plane'],
  'Flag': ['Navy Seal', 'Fighter Plane', 'Reconnaissance Plane'],
};

// Mine special rules
const LAND_MINE_IMMUNE: UnitTypeName[] = ['Commando'];
const NAVAL_MINE_IMMUNE: UnitTypeName[] = ['Navy Seal', 'Commando', 'M7 Ship'];

/**
 * Resolve a battle between two units.
 * The battle rules follow this priority:
 * 1. Attacker-priority specials (Commando->Rav Aluf, Navy Seal->M7/Rav Aluf)
 * 2. Mine defense (Land mine beats all except Commando, Naval mine beats all except Navy Seal/Commando/M7)
 * 3. Unit-specific victory tables
 * 4. Ranked comparison (higher wins, equal = both die)
 */
export function resolveBattleResult(
  attackerType: UnitTypeName,
  defenderType: UnitTypeName,
): BattleResult {
  // 1. Check attacker-priority specials
  for (const [atk, def] of ATTACKER_PRIORITY) {
    if (attackerType === atk && defenderType === def) {
      return 'attacker_wins';
    }
  }

  // Check reverse: if defender would win via attacker-priority when roles reversed
  // (this handles cases like Rav Aluf attacking Commando - Rav Aluf wins by rank)

  // 2. Mine defense
  if (defenderType === 'Land mine') {
    return LAND_MINE_IMMUNE.includes(attackerType) ? 'attacker_wins' : 'defender_wins';
  }
  if (defenderType === 'Naval mine') {
    return NAVAL_MINE_IMMUNE.includes(attackerType) ? 'attacker_wins' : 'defender_wins';
  }
  // Attacker is a mine (mines can't attack, but handle for completeness)
  if (attackerType === 'Land mine') {
    return LAND_MINE_IMMUNE.includes(defenderType) ? 'defender_wins' : 'attacker_wins';
  }
  if (attackerType === 'Naval mine') {
    return NAVAL_MINE_IMMUNE.includes(defenderType) ? 'defender_wins' : 'attacker_wins';
  }

  // 3. Check unit-specific victory tables
  const attackerDefeats = UNIT_DEFEATS[attackerType];
  if (attackerDefeats?.includes(defenderType)) {
    return 'attacker_wins';
  }
  const defenderDefeats = UNIT_DEFEATS[defenderType];
  if (defenderDefeats?.includes(attackerType)) {
    return 'defender_wins';
  }

  // 4. Ranked comparison
  const attackerRank = getRank(attackerType);
  const defenderRank = getRank(defenderType);

  if (attackerRank !== null && defenderRank !== null) {
    if (attackerRank > defenderRank) return 'attacker_wins';
    if (attackerRank < defenderRank) return 'defender_wins';
    return 'both_die';
  }

  // Same non-ranked type = both die
  if (attackerType === defenderType) return 'both_die';

  // Fallback: both die (should not happen with complete tables)
  return 'both_die';
}

function getRank(type: UnitTypeName): number | null {
  const ranks: Partial<Record<UnitTypeName, number>> = {
    'Rav Aluf': 10,
    'Aluf': 9,
    'Sgan Aluf': 8,
    'Rav Seren': 7,
    'Seren': 6,
    'Segen': 5,
    'Rav Samal': 4,
    'Samal': 3,
    'Rav Turai': 2,
    'Commando': 1,
    'Navy Seal': 0,
  };
  return ranks[type] ?? null;
}

/**
 * Check if a foot unit (not Navy Seal) can capture the flag.
 */
export function canCaptureFlag(unitType: UnitTypeName): boolean {
  const def = UNIT_DEFEATS[unitType];
  // Foot units (not Navy Seal) capture the flag by defeating it
  // Actually, any foot unit except Navy Seal can capture the flag
  return unitType !== 'Navy Seal' &&
    unitType !== 'Fighter Plane' &&
    unitType !== 'Reconnaissance Plane' &&
    !['M7 Ship', 'M4 Ship', 'Patrol Ship', 'Life Raft'].includes(unitType) &&
    !['Land mine', 'Naval mine', 'Flag'].includes(unitType);
}
