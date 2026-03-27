import { TerrainType, UnitType, Position, Player } from './types';

// ── Map data (0-indexed, row 0 = map.txt line 1) ──────────────────────────────
export const MAP_DATA: TerrainType[][] = [
  // Row 0 (line 1)
  ['S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
  // Row 1 (line 2)
  ['S','S','S','S','S','S','S','S','L','L','S','S','L','S','S','L','S','S','S','S'],
  // Row 2 (line 3)
  ['S','S','S','S','S','L','S','S','L','L','S','S','L','L','L','L','L','L','S','S'],
  // Row 3 (line 4)
  ['S','S','S','S','S','L','L','L','L','L','S','L','L','L','L','L','L','L','S','S'],
  // Row 4 (line 5)
  ['S','S','S','S','S','S','L','L','L','L','L','L','L','L','L','L','L','S','S','S'],
  // Row 5 (line 6)
  ['S','S','I','S','S','S','L','L','L','L','L','L','L','L','L','L','L','S','S','S'],
  // Row 6 (line 7)
  ['S','S','I','I','S','S','S','L','L','L','L','L','L','L','L','S','S','S','S','S'],
  // Row 7 (line 8)
  ['S','S','I','I','I','S','S','L','L','L','L','L','L','L','L','L','L','S','S','S'],
  // Row 8 (line 9)
  ['S','S','S','S','S','S','S','L','L','L','L','L','L','L','L','L','S','S','S','S'],
  // Row 9 (line 10) - middle
  ['S','S','S','S','S','S','S','S','S','S','S','S','S','L','L','L','S','S','S','S'],
  // Row 10 (line 11) - middle
  ['S','S','S','S','S','S','S','S','S','S','S','S','S','L','L','L','S','S','S','S'],
  // Row 11 (line 12)
  ['S','S','S','S','S','S','S','L','L','L','L','L','L','L','L','L','S','S','S','S'],
  // Row 12 (line 13)
  ['S','S','I','I','I','S','S','L','L','L','L','L','L','L','L','L','L','S','S','S'],
  // Row 13 (line 14)
  ['S','S','I','I','S','S','S','L','L','L','L','L','L','L','L','S','S','S','S','S'],
  // Row 14 (line 15)
  ['S','S','I','S','S','S','L','L','L','L','L','L','L','L','L','L','L','S','S','S'],
  // Row 15 (line 16)
  ['S','S','S','S','S','S','L','L','L','L','L','L','L','L','L','L','L','S','S','S'],
  // Row 16 (line 17)
  ['S','S','S','S','S','L','L','L','L','L','S','L','L','L','L','L','L','L','S','S'],
  // Row 17 (line 18)
  ['S','S','S','S','S','L','S','S','L','L','S','S','L','L','L','L','L','L','S','S'],
  // Row 18 (line 19)
  ['S','S','S','S','S','S','S','S','L','L','S','S','L','S','S','L','S','S','S','S'],
  // Row 19 (line 20)
  ['S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S','S'],
];

// ── Island cells (0-indexed) ────────────────────────────────────────────────
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

export const ISLAND_CELLS_BY_PLAYER: Record<Player, Position[]> = {
  blue: BLUE_ISLAND_CELLS,
  yellow: YELLOW_ISLAND_CELLS,
};

// ── Setup rows (0-indexed, inclusive) ───────────────────────────────────────
export const SETUP_ROWS: Record<Player, [number, number]> = {
  blue: [0, 8],
  yellow: [11, 19],
};

// ── Unit ranks ───────────────────────────────────────────────────────────────
export const FOOT_RANKS: Partial<Record<UnitType, number>> = {
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

export const NAVAL_RANKS: Partial<Record<UnitType, number>> = {
  'M7 Ship': 4,
  'M4 Ship': 3,
  'Patrol Ship': 2,
  'Life Raft': 1,
};

// ── Unit definitions ─────────────────────────────────────────────────────────
export interface TransportCapacity {
  maxSoldiers: number;   // foot units (not mines, ships, planes)
  allowsFlag: boolean;
  maxMines: number;
  allowedMines: UnitType[];
  maxShips: number;
  allowedShips: UnitType[];
  maxPlanes: number;
  allowedPlanes: UnitType[];
}

export interface UnitDef {
  count: number;
  category: 'foot' | 'naval' | 'air' | 'immobile';
  canLand: boolean;
  canSea: boolean;
  canIsland: boolean;
  isImmobile: boolean;
  unlimitedRange: boolean; // planes
  transport?: TransportCapacity;
  hebrewName: string;
}

export const UNIT_DEFS: Record<UnitType, UnitDef> = {
  'Rav Aluf':    { count:1,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'רב אלוף' },
  'Aluf':        { count:1,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'אלוף' },
  'Sgan Aluf':   { count:2,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'סגן אלוף' },
  'Rav Seren':   { count:3,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'רב סרן' },
  'Seren':       { count:3,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'סרן' },
  'Segen':       { count:4,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'סגן' },
  'Rav Samal':   { count:4,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'רב סמל' },
  'Samal':       { count:5,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'סמל' },
  'Rav Turai':   { count:5,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'רב טוראי' },
  'Commando':    { count:1,  category:'foot',     canLand:true,  canSea:false, canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'קומנדו' },
  'Navy Seal':   { count:1,  category:'foot',     canLand:true,  canSea:true,  canIsland:true,  isImmobile:false, unlimitedRange:false, hebrewName:'חייל ים' },
  'M7 Ship':     {
    count:2,  category:'naval',    canLand:false, canSea:true,  canIsland:false, isImmobile:false, unlimitedRange:false, hebrewName:'ספינת M7',
    transport: { maxSoldiers:4, allowsFlag:true, maxMines:1, allowedMines:['Land mine','Naval mine'], maxShips:1, allowedShips:['Patrol Ship','Life Raft'], maxPlanes:1, allowedPlanes:['Reconnaissance Plane'] },
  },
  'M4 Ship':     {
    count:2,  category:'naval',    canLand:false, canSea:true,  canIsland:false, isImmobile:false, unlimitedRange:false, hebrewName:'ספינת M4',
    transport: { maxSoldiers:4, allowsFlag:true, maxMines:1, allowedMines:['Land mine','Naval mine'], maxShips:1, allowedShips:['Patrol Ship','Life Raft'], maxPlanes:0, allowedPlanes:[] },
  },
  'Patrol Ship': {
    count:4,  category:'naval',    canLand:false, canSea:true,  canIsland:false, isImmobile:false, unlimitedRange:false, hebrewName:'ספינת סיור',
    transport: { maxSoldiers:4, allowsFlag:true, maxMines:1, allowedMines:['Land mine','Naval mine'], maxShips:0, allowedShips:[], maxPlanes:0, allowedPlanes:[] },
  },
  'Life Raft':   {
    count:3,  category:'naval',    canLand:false, canSea:true,  canIsland:false, isImmobile:false, unlimitedRange:false, hebrewName:'רפסודת הצלה',
    transport: { maxSoldiers:2, allowsFlag:true, maxMines:0, allowedMines:[], maxShips:0, allowedShips:[], maxPlanes:0, allowedPlanes:[] },
  },
  'Fighter Plane': {
    count:2,  category:'air',      canLand:false, canSea:true,  canIsland:true,  isImmobile:false, unlimitedRange:true,  hebrewName:'מטוס קרב',
    transport: { maxSoldiers:5, allowsFlag:false, maxMines:1, allowedMines:['Land mine','Naval mine'], maxShips:0, allowedShips:[], maxPlanes:0, allowedPlanes:[] },
  },
  'Reconnaissance Plane': {
    count:2,  category:'air',      canLand:false, canSea:true,  canIsland:true,  isImmobile:false, unlimitedRange:true,  hebrewName:'מטוס סיור',
    transport: { maxSoldiers:2, allowsFlag:false, maxMines:1, allowedMines:['Land mine','Naval mine'], maxShips:0, allowedShips:[], maxPlanes:0, allowedPlanes:[] },
  },
  'Land mine':   { count:3,  category:'immobile', canLand:true,  canSea:false, canIsland:true,  isImmobile:true,  unlimitedRange:false, hebrewName:'מוקש יבשה' },
  'Naval mine':  { count:3,  category:'immobile', canLand:false, canSea:true,  canIsland:false, isImmobile:true,  unlimitedRange:false, hebrewName:'מוקש ים' },
  'Flag':        { count:1,  category:'immobile', canLand:true,  canSea:false, canIsland:false, isImmobile:true,  unlimitedRange:false, hebrewName:'דגל' },
};

// Ordered unit list for setup UI display
export const FOOT_UNITS: UnitType[] = [
  'Rav Aluf','Aluf','Sgan Aluf','Rav Seren','Seren',
  'Segen','Rav Samal','Samal','Rav Turai','Commando','Navy Seal',
];

export const NAVAL_UNITS: UnitType[] = ['M7 Ship','M4 Ship','Patrol Ship','Life Raft'];
export const AIR_UNITS: UnitType[] = ['Fighter Plane','Reconnaissance Plane'];
export const IMMOBILE_UNITS: UnitType[] = ['Land mine','Naval mine','Flag'];

export const ALL_UNIT_TYPES: UnitType[] = [
  ...FOOT_UNITS, ...NAVAL_UNITS, ...AIR_UNITS, ...IMMOBILE_UNITS,
];

// ── Helper: is foot unit (can carry flag) ────────────────────────────────────
export const FOOT_UNIT_TYPES: Set<UnitType> = new Set(FOOT_UNITS);
export const NAVAL_UNIT_TYPES: Set<UnitType> = new Set(NAVAL_UNITS);
export const AIR_UNIT_TYPES: Set<UnitType> = new Set(AIR_UNITS);

// Foot units that can capture the flag (excludes Navy Seal)
export const FLAG_CAPTURERS: Set<UnitType> = new Set([
  'Rav Aluf','Aluf','Sgan Aluf','Rav Seren','Seren',
  'Segen','Rav Samal','Samal','Rav Turai','Commando',
]);
