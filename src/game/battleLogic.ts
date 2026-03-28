import { Unit, UnitType, BattleResult } from "./types";
import { FOOT_RANKS, NAVAL_RANKS, isFootUnit, isNavalUnit, isAirUnit } from "./constants";

/**
 * Resolve a battle between attacker and defender.
 * The resolution follows a strict priority order to handle all special cases.
 */
export function resolveBattle(attacker: Unit, defender: Unit): BattleResult {
  const aType = attacker.type;
  const dType = defender.type;

  const base = { attacker, defender };

  // Step 1: Commando attacking
  if (aType === "Commando") {
    if (dType === "Rav Aluf") return { ...base, winner: "attacker" };
    if (dType === "Navy Seal") return { ...base, winner: "attacker" };
    if (dType === "Land mine") return { ...base, winner: "attacker" };
    if (dType === "Naval mine") return { ...base, winner: "attacker" };
    if (dType === "Fighter Plane") return { ...base, winner: "attacker" };
    if (dType === "Reconnaissance Plane") return { ...base, winner: "attacker" };
    if (dType === "Flag") return { ...base, winner: "attacker" };
    // Commando vs other foot units: compare ranks (Commando rank=1)
    if (isFootUnit(dType)) return resolveByFootRank(base, aType, dType);
    // Commando vs ships: Commando has no naval capability, both die
    return { ...base, winner: "both_die" };
  }

  // Step 2: Navy Seal attacking
  if (aType === "Navy Seal") {
    if (dType === "M7 Ship") return { ...base, winner: "attacker" };
    if (dType === "Rav Aluf") return { ...base, winner: "attacker" };
    if (dType === "Naval mine") return { ...base, winner: "attacker" };
    if (dType === "Fighter Plane") return { ...base, winner: "attacker" };
    if (dType === "Reconnaissance Plane") return { ...base, winner: "attacker" };
    if (dType === "Flag") return { ...base, winner: "attacker" };
    if (dType === "Land mine") return { ...base, winner: "defender" };
    // Navy Seal vs other foot: compare ranks (Navy Seal rank=0, loses to all)
    if (isFootUnit(dType)) return resolveByFootRank(base, aType, dType);
    // Navy Seal vs other ships (M4, Patrol, Life Raft): Navy Seal loses
    if (isNavalUnit(dType)) return { ...base, winner: "defender" };
    return { ...base, winner: "both_die" };
  }

  // Step 3: Defender is Land mine (attacker is NOT Commando)
  if (dType === "Land mine") {
    return { ...base, winner: "defender" };
  }

  // Step 4: Defender is Naval mine (attacker is NOT Navy Seal, Commando, or M7)
  if (dType === "Naval mine") {
    if (aType === "M7 Ship") return { ...base, winner: "attacker" };
    return { ...base, winner: "defender" };
  }

  // Step 5: Defender is Flag
  if (dType === "Flag") {
    // Foot units (not Navy Seal, already handled above) capture the flag
    if (isFootUnit(aType)) return { ...base, winner: "attacker" };
    // Planes lose to flag
    if (isAirUnit(aType)) return { ...base, winner: "defender" };
    // Ships: shouldn't normally happen (ships can't move onto land where flag is)
    // but if somehow it does, attacker wins
    return { ...base, winner: "attacker" };
  }

  // Step 6: Foot vs Foot (both are foot units, neither is Commando/Navy Seal at this point)
  if (isFootUnit(aType) && isFootUnit(dType)) {
    return resolveByFootRank(base, aType, dType);
  }

  // Step 7: Foot vs Naval or vice versa
  if (isFootUnit(aType) && isNavalUnit(dType)) {
    // Foot soldier shouldn't attack ships at sea (blocked by movement logic)
    // but if adjacent, both die as a fallback
    return { ...base, winner: "both_die" };
  }
  if (isNavalUnit(aType) && isFootUnit(dType)) {
    return { ...base, winner: "both_die" };
  }

  // Step 8: Ship vs Ship
  if (isNavalUnit(aType) && isNavalUnit(dType)) {
    return resolveByNavalRank(base, aType, dType);
  }

  // Step 9: Ship vs Plane (ship wins per unit_victories - all ships beat all planes)
  if (isNavalUnit(aType) && isAirUnit(dType)) {
    return { ...base, winner: "attacker" };
  }
  if (isAirUnit(aType) && isNavalUnit(dType)) {
    return { ...base, winner: "defender" };
  }

  // Step 10: Plane vs Plane
  if (isAirUnit(aType) && isAirUnit(dType)) {
    if (aType === "Fighter Plane" && dType === "Reconnaissance Plane") {
      return { ...base, winner: "attacker" };
    }
    if (aType === "Reconnaissance Plane" && dType === "Fighter Plane") {
      return { ...base, winner: "defender" };
    }
    // Same type = both die
    return { ...base, winner: "both_die" };
  }

  // Step 11: Foot vs Plane
  if (isFootUnit(aType) && isAirUnit(dType)) {
    // Per unit_victories, planes lose to most things
    return { ...base, winner: "attacker" };
  }
  if (isAirUnit(aType) && isFootUnit(dType)) {
    return { ...base, winner: "defender" };
  }

  // Fallback: both die
  return { ...base, winner: "both_die" };
}

function resolveByFootRank(
  base: { attacker: Unit; defender: Unit },
  aType: UnitType,
  dType: UnitType,
): BattleResult {
  const aRank = FOOT_RANKS[aType] ?? 0;
  const dRank = FOOT_RANKS[dType] ?? 0;
  if (aRank > dRank) return { ...base, winner: "attacker" };
  if (dRank > aRank) return { ...base, winner: "defender" };
  return { ...base, winner: "both_die" };
}

function resolveByNavalRank(
  base: { attacker: Unit; defender: Unit },
  aType: UnitType,
  dType: UnitType,
): BattleResult {
  const aRank = NAVAL_RANKS[aType] ?? 0;
  const dRank = NAVAL_RANKS[dType] ?? 0;
  if (aRank > dRank) return { ...base, winner: "attacker" };
  if (dRank > aRank) return { ...base, winner: "defender" };
  return { ...base, winner: "both_die" };
}
