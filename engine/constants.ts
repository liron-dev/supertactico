import { UnitDefinition, UnitName, UnitCategory } from "./types";

export const BOARD_ROWS = 20;
export const BOARD_COLS = 20;

export const UNIT_DEFINITIONS: UnitDefinition[] = [
  // Foot units (ranked, descending)
  { name: "Rav Aluf", category: "foot", rank: 10, count: 1, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Aluf", category: "foot", rank: 9, count: 1, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Sgan Aluf", category: "foot", rank: 8, count: 2, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Rav Seren", category: "foot", rank: 7, count: 3, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Seren", category: "foot", rank: 6, count: 3, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Segen", category: "foot", rank: 5, count: 4, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Rav Samal", category: "foot", rank: 4, count: 4, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Samal", category: "foot", rank: 3, count: 5, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Rav Turai", category: "foot", rank: 2, count: 5, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Commando", category: "foot", rank: 1, count: 1, mobile: true, startTerrain: ["L", "I"], moveTerrain: ["L", "I"], transportCapacity: null },
  { name: "Navy Seal", category: "foot", rank: 0, count: 1, mobile: true, startTerrain: ["L", "I", "S"], moveTerrain: ["L", "I", "S"], transportCapacity: null },
  // Naval ships
  { name: "M7 Ship", category: "ship", rank: null, count: 2, mobile: true, startTerrain: ["S"], moveTerrain: ["S"], transportCapacity: { maxSoldiers: 4, maxMines: 1, allowedMines: ["Land mine", "Naval mine"], maxShips: 1, allowedShips: ["Patrol Ship", "Life Raft"], maxPlanes: 1, allowedPlanes: ["Reconnaissance Plane"], allowsFlag: true, flagOccupiesSlot: true } },
  { name: "M4 Ship", category: "ship", rank: null, count: 2, mobile: true, startTerrain: ["S"], moveTerrain: ["S"], transportCapacity: { maxSoldiers: 4, maxMines: 1, allowedMines: ["Land mine", "Naval mine"], maxShips: 1, allowedShips: ["Patrol Ship", "Life Raft"], maxPlanes: 0, allowedPlanes: [], allowsFlag: true, flagOccupiesSlot: true } },
  { name: "Patrol Ship", category: "ship", rank: null, count: 4, mobile: true, startTerrain: ["S"], moveTerrain: ["S"], transportCapacity: { maxSoldiers: 4, maxMines: 1, allowedMines: ["Land mine", "Naval mine"], maxShips: 0, allowedShips: [], maxPlanes: 0, allowedPlanes: [], allowsFlag: true, flagOccupiesSlot: true } },
  { name: "Life Raft", category: "ship", rank: null, count: 3, mobile: true, startTerrain: ["S"], moveTerrain: ["S"], transportCapacity: { maxSoldiers: 2, maxMines: 0, allowedMines: [], maxShips: 0, allowedShips: [], maxPlanes: 0, allowedPlanes: [], allowsFlag: true, flagOccupiesSlot: true } },
  // Aircraft
  { name: "Fighter Plane", category: "aircraft", rank: null, count: 2, mobile: true, startTerrain: ["S"], moveTerrain: ["S", "L", "I"], transportCapacity: { maxSoldiers: 5, maxMines: 1, allowedMines: ["Land mine", "Naval mine"], maxShips: 0, allowedShips: [], maxPlanes: 0, allowedPlanes: [], allowsFlag: false, flagOccupiesSlot: false } },
  { name: "Reconnaissance Plane", category: "aircraft", rank: null, count: 2, mobile: true, startTerrain: ["S"], moveTerrain: ["S", "L", "I"], transportCapacity: { maxSoldiers: 2, maxMines: 1, allowedMines: ["Land mine", "Naval mine"], maxShips: 0, allowedShips: [], maxPlanes: 0, allowedPlanes: [], allowsFlag: false, flagOccupiesSlot: false } },
  // Immobile units
  { name: "Land mine", category: "immobile", rank: null, count: 3, mobile: false, startTerrain: ["L", "I"], moveTerrain: [], transportCapacity: null },
  { name: "Naval mine", category: "immobile", rank: null, count: 3, mobile: false, startTerrain: ["S", "L", "I"], moveTerrain: [], transportCapacity: null },
  { name: "Flag", category: "immobile", rank: null, count: 1, mobile: false, startTerrain: ["L"], moveTerrain: [], transportCapacity: null },
];

export function getUnitDef(name: UnitName): UnitDefinition {
  return UNIT_DEFINITIONS.find((u) => u.name === name)!;
}

export function getUnitCategory(name: UnitName): UnitCategory {
  return getUnitDef(name).category;
}

export function isFootUnit(name: UnitName): boolean {
  return getUnitDef(name).category === "foot";
}

export function isShip(name: UnitName): boolean {
  return getUnitDef(name).category === "ship";
}

export function isAircraft(name: UnitName): boolean {
  return getUnitDef(name).category === "aircraft";
}

export function isImmobile(name: UnitName): boolean {
  return getUnitDef(name).category === "immobile";
}

export const SHIP_HIERARCHY: UnitName[] = ["Life Raft", "Patrol Ship", "M4 Ship", "M7 Ship"];

export function getShipStrength(name: UnitName): number {
  return SHIP_HIERARCHY.indexOf(name);
}
