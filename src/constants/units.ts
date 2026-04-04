import { UnitCategory, UnitTypeName, Player, UnitInstance, emptyCargo } from '../types/unit';
import { TerrainType } from '../types/board';

export interface UnitDefinition {
  type: UnitTypeName;
  category: UnitCategory;
  count: number;
  rank: number | null;
  startTerrain: TerrainType[]; // Where this unit can be placed during setup
  moveTerrain: TerrainType[]; // Where this unit can move during gameplay
  isImmobile: boolean;
}

const ALL_TERRAIN: TerrainType[] = ['S', 'L', 'I'];
const LAND_ISLAND: TerrainType[] = ['L', 'I'];
const SEA_ONLY: TerrainType[] = ['S'];

export const UNIT_DEFINITIONS: UnitDefinition[] = [
  // Foot units (ranked, in descending order)
  { type: 'Rav Aluf',   category: 'foot', count: 1, rank: 10, startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Aluf',       category: 'foot', count: 1, rank: 9,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Sgan Aluf',  category: 'foot', count: 2, rank: 8,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Rav Seren',  category: 'foot', count: 3, rank: 7,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Seren',      category: 'foot', count: 3, rank: 6,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Segen',      category: 'foot', count: 4, rank: 5,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Rav Samal',  category: 'foot', count: 4, rank: 4,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Samal',      category: 'foot', count: 5, rank: 3,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Rav Turai',  category: 'foot', count: 5, rank: 2,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Commando',   category: 'foot', count: 1, rank: 1,  startTerrain: LAND_ISLAND, moveTerrain: LAND_ISLAND, isImmobile: false },
  { type: 'Navy Seal',  category: 'foot', count: 1, rank: 0,  startTerrain: ALL_TERRAIN, moveTerrain: ALL_TERRAIN, isImmobile: false },

  // Naval ships
  { type: 'M7 Ship',     category: 'naval',    count: 2, rank: null, startTerrain: SEA_ONLY, moveTerrain: SEA_ONLY, isImmobile: false },
  { type: 'M4 Ship',     category: 'naval',    count: 2, rank: null, startTerrain: SEA_ONLY, moveTerrain: SEA_ONLY, isImmobile: false },
  { type: 'Patrol Ship', category: 'naval',    count: 4, rank: null, startTerrain: SEA_ONLY, moveTerrain: SEA_ONLY, isImmobile: false },
  { type: 'Life Raft',   category: 'naval',    count: 3, rank: null, startTerrain: SEA_ONLY, moveTerrain: SEA_ONLY, isImmobile: false },

  // Aircraft
  { type: 'Fighter Plane',         category: 'aircraft', count: 2, rank: null, startTerrain: SEA_ONLY, moveTerrain: ALL_TERRAIN, isImmobile: false },
  { type: 'Reconnaissance Plane',  category: 'aircraft', count: 2, rank: null, startTerrain: SEA_ONLY, moveTerrain: ALL_TERRAIN, isImmobile: false },

  // Immobile
  { type: 'Land mine',  category: 'immobile', count: 3, rank: null, startTerrain: LAND_ISLAND, moveTerrain: [], isImmobile: true },
  { type: 'Naval mine', category: 'immobile', count: 3, rank: null, startTerrain: ALL_TERRAIN, moveTerrain: [], isImmobile: true },
  { type: 'Flag',       category: 'immobile', count: 1, rank: null, startTerrain: ['L'],       moveTerrain: [], isImmobile: true },
];

export function getUnitDefinition(type: UnitTypeName): UnitDefinition {
  return UNIT_DEFINITIONS.find(d => d.type === type)!;
}

export function createUnitInstance(
  type: UnitTypeName,
  owner: Player,
  index: number,
): UnitInstance {
  const def = getUnitDefinition(type);
  return {
    id: `${owner}-${type}-${index}`,
    type,
    owner,
    category: def.category,
    rank: def.rank,
    cargo: emptyCargo(),
    carryingEnemyFlag: false,
    revealed: false,
  };
}

export function createAllUnits(player: Player): UnitInstance[] {
  const units: UnitInstance[] = [];
  for (const def of UNIT_DEFINITIONS) {
    for (let i = 0; i < def.count; i++) {
      units.push(createUnitInstance(def.type, player, i));
    }
  }
  return units;
}

// Total units per player
export const TOTAL_UNITS_PER_PLAYER = UNIT_DEFINITIONS.reduce((sum, d) => sum + d.count, 0);

// Categories for the placement tray UI
export const UNIT_CATEGORIES = [
  { label: 'Foot Soldiers', filter: (d: UnitDefinition) => d.category === 'foot' },
  { label: 'Naval Ships', filter: (d: UnitDefinition) => d.category === 'naval' },
  { label: 'Aircraft', filter: (d: UnitDefinition) => d.category === 'aircraft' },
  { label: 'Mines & Flag', filter: (d: UnitDefinition) => d.category === 'immobile' },
] as const;

export function isFootUnit(type: UnitTypeName): boolean {
  return getUnitDefinition(type).category === 'foot';
}

export function isNavalUnit(type: UnitTypeName): boolean {
  return getUnitDefinition(type).category === 'naval';
}

export function isAircraftUnit(type: UnitTypeName): boolean {
  return getUnitDefinition(type).category === 'aircraft';
}

export function isTransport(type: UnitTypeName): boolean {
  return ['M7 Ship', 'M4 Ship', 'Patrol Ship', 'Life Raft', 'Fighter Plane', 'Reconnaissance Plane'].includes(type);
}
