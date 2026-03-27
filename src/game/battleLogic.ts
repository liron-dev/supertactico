import { Unit, Position, BattleResult } from './types';
import { FOOT_RANKS, NAVAL_RANKS, FLAG_CAPTURERS } from './constants';

function isFootUnit(type: Unit['type']): boolean {
  return FOOT_RANKS[type] !== undefined;
}

function isNavalUnit(type: Unit['type']): boolean {
  return NAVAL_RANKS[type] !== undefined;
}

function isPlane(type: Unit['type']): boolean {
  return type === 'Fighter Plane' || type === 'Reconnaissance Plane';
}

function isMine(type: Unit['type']): boolean {
  return type === 'Land mine' || type === 'Naval mine';
}

/**
 * Core battle resolution. Returns a BattleResult describing who wins and side-effects.
 * Rules applied in strict priority order per rules.txt.
 */
export function resolveBattle(
  attacker: Unit,
  defender: Unit,
  attackerPos: Position,
  defenderPos: Position,
): BattleResult {
  const base = { attacker, defender, attackerPos, defenderPos };

  // ── 1. Commando as attacker ──────────────────────────────────────────────
  if (attacker.type === 'Commando') {
    const commandoDefeats = new Set([
      'Land mine', 'Naval mine', 'Rav Aluf', 'Navy Seal',
      'Fighter Plane', 'Reconnaissance Plane', 'Flag',
    ]);
    if (commandoDefeats.has(defender.type)) {
      if (defender.type === 'Flag') {
        return { ...base, winner: 'attacker', flagDropped: false };
      }
      return { ...base, winner: 'attacker' };
    }
    // Commando vs other foot: rank comparison
    if (isFootUnit(defender.type)) {
      const aRank = FOOT_RANKS[attacker.type]!;
      const dRank = FOOT_RANKS[defender.type]!;
      if (aRank > dRank) return { ...base, winner: 'attacker' };
      if (dRank > aRank) return { ...base, winner: 'defender' };
      return { ...base, winner: 'both_die' };
    }
    return { ...base, winner: 'both_die' };
  }

  // ── 2. Navy Seal as attacker (attacker-priority rules) ───────────────────
  if (attacker.type === 'Navy Seal') {
    // Beats M7 Ship (only when attacking)
    if (defender.type === 'M7 Ship') return { ...base, winner: 'attacker' };
    // Beats Rav Aluf (only when attacking)
    if (defender.type === 'Rav Aluf') return { ...base, winner: 'attacker' };
    // Always beats Naval mine, planes, Flag
    if (defender.type === 'Naval mine' || isPlane(defender.type)) {
      return { ...base, winner: 'attacker' };
    }
    if (defender.type === 'Flag') {
      return { ...base, winner: 'attacker', flagDropped: false };
    }
    // Land mine beats Navy Seal
    if (defender.type === 'Land mine') return { ...base, winner: 'defender' };
    // Navy Seal rank 0 vs other foot: loses
    if (isFootUnit(defender.type)) {
      return { ...base, winner: 'defender' };
    }
    // Navy Seal vs naval (non-M7): naval wins? Navy Seal loses to ships
    if (isNavalUnit(defender.type)) return { ...base, winner: 'defender' };
    return { ...base, winner: 'both_die' };
  }

  // ── 3. Land mine as defender ─────────────────────────────────────────────
  if (defender.type === 'Land mine') {
    // Only Commando can beat mines (handled above)
    return { ...base, winner: 'defender' };
  }

  // ── 4. Naval mine as defender ────────────────────────────────────────────
  if (defender.type === 'Naval mine') {
    // Exceptions: Navy Seal (handled above), Commando (handled above), M7 Ship
    if (attacker.type === 'M7 Ship') return { ...base, winner: 'attacker' };
    return { ...base, winner: 'defender' };
  }

  // ── 5. Flag as defender ──────────────────────────────────────────────────
  if (defender.type === 'Flag') {
    // Planes cannot capture flag → flag "repels" them (Navy Seal handled above in block 2)
    if (isPlane(attacker.type)) {
      return { ...base, winner: 'defender' };
    }
    // Any other foot unit captures flag
    if (FLAG_CAPTURERS.has(attacker.type)) {
      return { ...base, winner: 'attacker', flagDropped: false };
    }
    return { ...base, winner: 'both_die' };
  }

  // ── 6. Foot vs Foot ──────────────────────────────────────────────────────
  if (isFootUnit(attacker.type) && isFootUnit(defender.type)) {
    const aRank = FOOT_RANKS[attacker.type]!;
    const dRank = FOOT_RANKS[defender.type]!;
    if (aRank > dRank) return { ...base, winner: 'attacker' };
    if (dRank > aRank) return { ...base, winner: 'defender' };
    return { ...base, winner: 'both_die' };
  }

  // ── 7. Ship vs Ship ──────────────────────────────────────────────────────
  if (isNavalUnit(attacker.type) && isNavalUnit(defender.type)) {
    const aRank = NAVAL_RANKS[attacker.type]!;
    const dRank = NAVAL_RANKS[defender.type]!;
    if (aRank > dRank) return { ...base, winner: 'attacker' };
    if (dRank > aRank) return { ...base, winner: 'defender' };
    return { ...base, winner: 'both_die' };
  }

  // ── 8. Ship vs Plane ─────────────────────────────────────────────────────
  if (isNavalUnit(attacker.type) && isPlane(defender.type)) {
    return { ...base, winner: 'attacker' };
  }
  if (isPlane(attacker.type) && isNavalUnit(defender.type)) {
    return { ...base, winner: 'defender' };
  }

  // ── 9. Fighter Plane vs Recon Plane ──────────────────────────────────────
  if (attacker.type === 'Fighter Plane' && defender.type === 'Reconnaissance Plane') {
    return { ...base, winner: 'attacker' };
  }
  if (attacker.type === 'Reconnaissance Plane' && defender.type === 'Fighter Plane') {
    return { ...base, winner: 'defender' };
  }

  // ── 10. Foot vs Ship/Plane ────────────────────────────────────────────────
  // Foot attacking a ship: ship wins (foot can't be on sea to attack ships,
  // but just in case via transport, ship rank takes over)
  if (isFootUnit(attacker.type) && isNavalUnit(defender.type)) {
    // Strength of attacked transported unit = transporting unit's strength
    return { ...base, winner: 'defender' };
  }

  // ── Default ──────────────────────────────────────────────────────────────
  return { ...base, winner: 'both_die' };
}

/**
 * Compute life raft escape details for a defeated ship that carries a life raft.
 * Returns the life raft and up to 2 passengers (preferring flag-carrying soldier).
 */
export function computeLifeRaftEscape(
  ship: Unit,
  board: (Unit | null)[][],
  shipPos: Position,
): { lifeRaft: Unit; passengers: Unit[]; adjacentCells: Position[] } | null {
  const lifeRaft = ship.cargo.find(u => u.type === 'Life Raft');
  if (!lifeRaft) return null;

  // Find adjacent sea cells
  const { row, col } = shipPos;
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  const adjacentCells: Position[] = [];
  for (const [dr, dc] of dirs) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 20 && c >= 0 && c < 20 && board[r][c] === null) {
      // Life raft can only go to sea cells
      adjacentCells.push({ row: r, col: c });
    }
  }

  // Collect up to 2 passengers from ship's cargo (exclude the life raft itself)
  // Prefer soldiers carrying the flag
  const otherCargo = ship.cargo.filter(u => u.type !== 'Life Raft');
  const flagCarrier = otherCargo.find(u => u.carryingFlag);
  let passengers: Unit[] = [];
  if (flagCarrier) {
    passengers.push(flagCarrier);
    const extra = otherCargo.find(u => u !== flagCarrier && u.type !== 'Flag');
    if (extra) passengers.push(extra);
  } else {
    passengers = otherCargo.slice(0, 2);
  }

  return { lifeRaft, passengers, adjacentCells };
}
