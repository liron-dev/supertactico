import { UnitInstance, UnitName, BattleResult, BattleOutcome, TerrainType, Player, Coord } from "./types";
import { getUnitDef, isFootUnit, isShip, isAircraft, isImmobile, getShipStrength } from "./constants";
import { getAdjacentCells, getTerrain } from "./map";

const COMMANDO_DEFEATS: Set<UnitName> = new Set([
  "Navy Seal", "Naval mine", "Land mine", "Flag", "Fighter Plane", "Reconnaissance Plane",
]);

const NAVY_SEAL_DEFEATS: Set<UnitName> = new Set([
  "Naval mine", "Fighter Plane", "Reconnaissance Plane", "Flag",
]);

const FLAG_BEATS: Set<UnitName> = new Set([
  "Navy Seal", "Fighter Plane", "Reconnaissance Plane",
]);

function determineBattleOutcome(attacker: UnitInstance, defender: UnitInstance): BattleOutcome {
  const atkName = attacker.name;
  const defName = defender.name;
  const atkDef = getUnitDef(atkName);
  const defDef = getUnitDef(defName);

  // 1. Special attacker-priority rules
  if (atkName === "Commando" && defName === "Rav Aluf") return "attacker_wins";
  if (atkName === "Navy Seal" && defName === "M7 Ship") return "attacker_wins";
  if (atkName === "Navy Seal" && defName === "Rav Aluf") return "attacker_wins";

  // 2. Commando specials
  if (atkName === "Commando" && COMMANDO_DEFEATS.has(defName)) return "attacker_wins";
  if (defName === "Commando" && COMMANDO_DEFEATS.has(atkName)) return "defender_wins";

  // 3. Navy Seal specials
  if (atkName === "Navy Seal" && NAVY_SEAL_DEFEATS.has(defName)) return "attacker_wins";
  if (defName === "Navy Seal" && NAVY_SEAL_DEFEATS.has(atkName)) return "defender_wins";

  // 4. Land mine
  if (defName === "Land mine") return "defender_wins";
  if (atkName === "Land mine") return "attacker_wins";

  // 5. Naval mine
  if (defName === "Naval mine") {
    if (atkName === "M7 Ship") return "attacker_wins";
    return "defender_wins";
  }
  if (atkName === "Naval mine") {
    if (defName === "M7 Ship") return "defender_wins";
    return "attacker_wins";
  }

  // 6. Flag combat
  if (defName === "Flag") {
    if (FLAG_BEATS.has(atkName)) return "defender_wins";
    if (isFootUnit(atkName)) return "attacker_wins";
    return "attacker_wins";
  }
  if (atkName === "Flag") {
    if (FLAG_BEATS.has(defName)) return "attacker_wins";
    return "defender_wins";
  }

  // 7. Ship hierarchy
  if (isShip(atkName) && isShip(defName)) {
    const atkStr = getShipStrength(atkName);
    const defStr = getShipStrength(defName);
    if (atkStr > defStr) return "attacker_wins";
    if (defStr > atkStr) return "defender_wins";
    return "both_die";
  }

  // 8. Ships beat planes
  if (isShip(atkName) && isAircraft(defName)) return "attacker_wins";
  if (isAircraft(atkName) && isShip(defName)) return "defender_wins";

  // 9. Plane vs plane
  if (atkName === "Fighter Plane" && defName === "Reconnaissance Plane") return "attacker_wins";
  if (atkName === "Reconnaissance Plane" && defName === "Fighter Plane") return "defender_wins";
  if (isAircraft(atkName) && isAircraft(defName)) return "both_die";

  // 10. Ranked foot combat
  if (atkDef.rank !== null && defDef.rank !== null) {
    if (atkDef.rank > defDef.rank) return "attacker_wins";
    if (defDef.rank > atkDef.rank) return "defender_wins";
    return "both_die";
  }

  // 11. Cross-category fallbacks
  if (isShip(atkName) && isFootUnit(defName)) return "attacker_wins";
  if (isFootUnit(atkName) && isShip(defName)) return "defender_wins";
  if (isFootUnit(atkName) && isAircraft(defName)) return "defender_wins";
  if (isAircraft(atkName) && isFootUnit(defName)) return "attacker_wins";

  return "both_die";
}

function findLifeRaftInCargo(unit: UnitInstance): UnitInstance | null {
  for (const c of unit.cargo) {
    if (c.name === "Life Raft") return c;
  }
  return null;
}

function getSoldiersInCargo(unit: UnitInstance): UnitInstance[] {
  return unit.cargo.filter((c) => isFootUnit(c.name));
}

export function resolveBattle(
  attacker: UnitInstance,
  defender: UnitInstance,
  attackerTerrain: TerrainType,
  defenderTerrain: TerrainType,
  defenderCoord?: Coord
): BattleResult {
  const outcome = determineBattleOutcome(attacker, defender);

  let flagDropped: [number, number] | null = null;
  let flagReturned: Player | null = null;
  let lifeRaftEscape: BattleResult["lifeRaftEscape"] = null;

  // Flag drop: when a unit carrying flag dies on land (rule viii — winner stays, flag drops)
  if (outcome === "attacker_wins" && defender.carryingFlag) {
    if (defenderTerrain === "L" || defenderTerrain === "I") {
      flagDropped = defenderCoord || null;
    }
  }
  if (outcome === "defender_wins" && attacker.carryingFlag) {
    if (attackerTerrain === "L" || attackerTerrain === "I") {
      // Flag drops at attacker's position (handled by store with attacker coord)
      flagDropped = null; // store handles this since we don't have attacker coord here
    }
  }

  // When a transport ship is defeated, check for life raft escape and flag return
  const defeatedShip =
    outcome === "attacker_wins" ? defender :
    outcome === "both_die" ? defender : null;

  if (defeatedShip && isShip(defeatedShip.name) && defeatedShip.cargo.length > 0) {
    const raft = findLifeRaftInCargo(defeatedShip);

    if (raft) {
      const raftSoldiers = getSoldiersInCargo(raft);
      const shipSoldiers = getSoldiersInCargo(defeatedShip);
      const allEligible = [...shipSoldiers, ...raftSoldiers];

      const adjSeaCells: Coord[] = defenderCoord
        ? getAdjacentCells(defenderCoord[0], defenderCoord[1]).filter(
            ([r, c]) => getTerrain(r, c) === "S"
          )
        : [];

      if (allEligible.length > 0 && adjSeaCells.length > 0) {
        lifeRaftEscape = {
          raft,
          maxEscapees: 2,
          eligibleSoldiers: allEligible,
          adjacentSeaCells: adjSeaCells,
        };
      }
    } else {
      // No life raft — check if ship was carrying flag via a soldier
      const flagCarrier = defeatedShip.cargo.find((c) => c.carryingFlag);
      if (flagCarrier && defenderTerrain === "S") {
        flagReturned = flagCarrier.owner === "yellow" ? "blue" : "yellow";
      }
    }
  }

  return { attacker, defender, outcome, flagDropped, flagReturned, lifeRaftEscape };
}

export function canAttack(attackerCoord: Coord, defenderCoord: Coord): boolean {
  const atkTerrain = getTerrain(attackerCoord[0], attackerCoord[1]);
  const defTerrain = getTerrain(defenderCoord[0], defenderCoord[1]);
  const atkSea = atkTerrain === "S";
  const defSea = defTerrain === "S";
  const atkLand = atkTerrain === "L" || atkTerrain === "I";
  const defLand = defTerrain === "L" || defTerrain === "I";
  if ((atkSea && defLand) || (atkLand && defSea)) return false;
  return true;
}
