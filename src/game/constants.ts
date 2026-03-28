import { TerrainType, UnitDef, UnitType, Position, Player } from "./types";

// 20x20 board transcribed from map.txt (0-indexed, row 0 = top)
export const MAP_DATA: TerrainType[][] = [
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","L","L","S","S","L","S","S","L","S","S","S","S"],
  ["S","S","S","S","S","L","S","S","L","L","S","S","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","L","L","L","L","L","S","L","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","I","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","I","I","S","S","S","L","L","L","L","L","L","L","L","S","S","S","S","S"],
  ["S","S","I","I","I","S","S","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","L","L","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","L","L","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","S","S","S","S"],
  ["S","S","I","I","I","S","S","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","I","I","S","S","S","L","L","L","L","L","L","L","L","S","S","S","S","S"],
  ["S","S","I","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","S","S","S","L","L","L","L","L","S","L","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","L","S","S","L","L","S","S","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","S","S","S","L","L","S","S","L","S","S","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S"],
];

export const BOARD_SIZE = 20;

// Blue setup rows: top 9 rows (0-8), Yellow setup rows: bottom 9 rows (11-19)
export const BLUE_SETUP_ROWS: [number, number] = [0, 8];
export const YELLOW_SETUP_ROWS: [number, number] = [11, 19];

// Island cells (from map inspection)
export const BLUE_ISLAND_CELLS: Position[] = [
  { row: 5, col: 2 },
  { row: 6, col: 2 }, { row: 6, col: 3 },
  { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 },
];

export const YELLOW_ISLAND_CELLS: Position[] = [
  { row: 12, col: 2 }, { row: 12, col: 3 }, { row: 12, col: 4 },
  { row: 13, col: 2 }, { row: 13, col: 3 },
  { row: 14, col: 2 },
];

export const FOOT_RANKS: Partial<Record<UnitType, number>> = {
  "Rav Aluf": 10,
  "Aluf": 9,
  "Sgan Aluf": 8,
  "Rav Seren": 7,
  "Seren": 6,
  "Segen": 5,
  "Rav Samal": 4,
  "Samal": 3,
  "Rav Turai": 2,
  "Commando": 1,
  "Navy Seal": 0,
};

export const NAVAL_RANKS: Partial<Record<UnitType, number>> = {
  "M7 Ship": 4,
  "M4 Ship": 3,
  "Patrol Ship": 2,
  "Life Raft": 1,
};

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  "Rav Aluf": {
    type: "Rav Aluf", count: 1, category: "foot", footRank: 10,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Aluf": {
    type: "Aluf", count: 1, category: "foot", footRank: 9,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Sgan Aluf": {
    type: "Sgan Aluf", count: 2, category: "foot", footRank: 8,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Rav Seren": {
    type: "Rav Seren", count: 3, category: "foot", footRank: 7,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Seren": {
    type: "Seren", count: 3, category: "foot", footRank: 6,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Segen": {
    type: "Segen", count: 4, category: "foot", footRank: 5,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Rav Samal": {
    type: "Rav Samal", count: 4, category: "foot", footRank: 4,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Samal": {
    type: "Samal", count: 5, category: "foot", footRank: 3,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Rav Turai": {
    type: "Rav Turai", count: 5, category: "foot", footRank: 2,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Commando": {
    type: "Commando", count: 1, category: "foot", footRank: 1,
    canStartOn: ["L", "I"], canMoveOn: ["L", "I"],
    isImmobile: false, unlimitedRange: false,
  },
  "Navy Seal": {
    type: "Navy Seal", count: 1, category: "foot", footRank: 0,
    canStartOn: ["L", "I", "S"], canMoveOn: ["L", "I", "S"],
    isImmobile: false, unlimitedRange: false,
  },
  "M7 Ship": {
    type: "M7 Ship", count: 2, category: "naval", navalRank: 4,
    canStartOn: ["S"], canMoveOn: ["S"],
    isImmobile: false, unlimitedRange: false,
    transport: {
      maxSoldiers: 4, allowsFlag: true,
      maxMines: 1, allowedMines: ["Land mine", "Naval mine"],
      maxShips: 1, allowedShips: ["Patrol Ship", "Life Raft"],
      maxPlanes: 1, allowedPlanes: ["Reconnaissance Plane"],
    },
  },
  "M4 Ship": {
    type: "M4 Ship", count: 2, category: "naval", navalRank: 3,
    canStartOn: ["S"], canMoveOn: ["S"],
    isImmobile: false, unlimitedRange: false,
    transport: {
      maxSoldiers: 4, allowsFlag: true,
      maxMines: 1, allowedMines: ["Land mine", "Naval mine"],
      maxShips: 1, allowedShips: ["Patrol Ship", "Life Raft"],
      maxPlanes: 0, allowedPlanes: [],
    },
  },
  "Patrol Ship": {
    type: "Patrol Ship", count: 4, category: "naval", navalRank: 2,
    canStartOn: ["S"], canMoveOn: ["S"],
    isImmobile: false, unlimitedRange: false,
    transport: {
      maxSoldiers: 4, allowsFlag: true,
      maxMines: 1, allowedMines: ["Land mine", "Naval mine"],
      maxShips: 0, allowedShips: [],
      maxPlanes: 0, allowedPlanes: [],
    },
  },
  "Life Raft": {
    type: "Life Raft", count: 3, category: "naval", navalRank: 1,
    canStartOn: ["S"], canMoveOn: ["S"],
    isImmobile: false, unlimitedRange: false,
    transport: {
      maxSoldiers: 2, allowsFlag: true,
      maxMines: 0, allowedMines: [],
      maxShips: 0, allowedShips: [],
      maxPlanes: 0, allowedPlanes: [],
    },
  },
  "Fighter Plane": {
    type: "Fighter Plane", count: 2, category: "air",
    canStartOn: ["S"], canMoveOn: ["S", "L", "I"],
    isImmobile: false, unlimitedRange: true,
    transport: {
      maxSoldiers: 5, allowsFlag: false,
      maxMines: 1, allowedMines: ["Land mine", "Naval mine"],
      maxShips: 0, allowedShips: [],
      maxPlanes: 0, allowedPlanes: [],
    },
  },
  "Reconnaissance Plane": {
    type: "Reconnaissance Plane", count: 2, category: "air",
    canStartOn: ["S"], canMoveOn: ["S", "L", "I"],
    isImmobile: false, unlimitedRange: true,
    transport: {
      maxSoldiers: 2, allowsFlag: false,
      maxMines: 1, allowedMines: ["Land mine", "Naval mine"],
      maxShips: 0, allowedShips: [],
      maxPlanes: 0, allowedPlanes: [],
    },
  },
  "Land mine": {
    type: "Land mine", count: 3, category: "mine",
    canStartOn: ["L", "I"], canMoveOn: [],
    isImmobile: true, unlimitedRange: false,
  },
  "Naval mine": {
    type: "Naval mine", count: 3, category: "mine",
    canStartOn: ["S", "L", "I"], canMoveOn: [],
    isImmobile: true, unlimitedRange: false,
  },
  "Flag": {
    type: "Flag", count: 1, category: "flag",
    canStartOn: ["L"], canMoveOn: [],
    isImmobile: true, unlimitedRange: false,
  },
};

// All unit types in setup panel order
export const UNIT_ORDER: UnitType[] = [
  "Rav Aluf", "Aluf", "Sgan Aluf", "Rav Seren", "Seren",
  "Segen", "Rav Samal", "Samal", "Rav Turai", "Commando", "Navy Seal",
  "M7 Ship", "M4 Ship", "Patrol Ship", "Life Raft",
  "Fighter Plane", "Reconnaissance Plane",
  "Land mine", "Naval mine", "Flag",
];

// Total units per player: 1+1+2+3+3+4+4+5+5+1+1 + 2+2+4+3 + 2+2 + 3+3+1 = 52
export const TOTAL_UNITS_PER_PLAYER = 52;

// How many island cells must remain empty during setup
export const MIN_EMPTY_ISLAND_CELLS = 3;

export function isFootUnit(type: UnitType): boolean {
  return UNIT_DEFS[type].category === "foot";
}

export function isNavalUnit(type: UnitType): boolean {
  return UNIT_DEFS[type].category === "naval";
}

export function isAirUnit(type: UnitType): boolean {
  return UNIT_DEFS[type].category === "air";
}

export function isMineUnit(type: UnitType): boolean {
  return UNIT_DEFS[type].category === "mine";
}

export function isSea(terrain: TerrainType): boolean {
  return terrain === "S";
}

export function isLandOrIsland(terrain: TerrainType): boolean {
  return terrain === "L" || terrain === "I";
}

export function isIsland(terrain: TerrainType): boolean {
  return terrain === "I";
}

export function getOpponent(player: Player): Player {
  return player === "yellow" ? "blue" : "yellow";
}
