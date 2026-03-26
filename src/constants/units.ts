import { UnitDefinition, UnitCategory, CellTerrain } from '../types/game';

export const UNIT_DEFINITIONS: UnitDefinition[] = [
  // Foot units (ranked, descending)
  { name: 'Rav Aluf', category: 'foot', rank: 10, count: 1, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Aluf', category: 'foot', rank: 9, count: 1, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Sgan Aluf', category: 'foot', rank: 8, count: 2, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Rav Seren', category: 'foot', rank: 7, count: 3, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Seren', category: 'foot', rank: 6, count: 3, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Segen', category: 'foot', rank: 5, count: 4, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Rav Samal', category: 'foot', rank: 4, count: 4, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Samal', category: 'foot', rank: 3, count: 5, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Rav Turai', category: 'foot', rank: 2, count: 5, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Commando', category: 'foot', rank: 1, count: 1, startTerrain: ['L', 'I'], moveTerrain: ['L', 'I'], unlimitedRange: false, isTransport: false },
  { name: 'Navy Seal', category: 'foot', rank: 0, count: 1, startTerrain: ['L', 'I', 'S'], moveTerrain: ['L', 'I', 'S'], unlimitedRange: false, isTransport: false },

  // Naval ships
  { name: 'M7 Ship', category: 'naval', rank: null, count: 2, startTerrain: ['S'], moveTerrain: ['S'], unlimitedRange: false, isTransport: true },
  { name: 'M4 Ship', category: 'naval', rank: null, count: 2, startTerrain: ['S'], moveTerrain: ['S'], unlimitedRange: false, isTransport: true },
  { name: 'Patrol Ship', category: 'naval', rank: null, count: 4, startTerrain: ['S'], moveTerrain: ['S'], unlimitedRange: false, isTransport: true },
  { name: 'Life Raft', category: 'naval', rank: null, count: 3, startTerrain: ['S'], moveTerrain: ['S'], unlimitedRange: false, isTransport: true },

  // Aircraft
  { name: 'Fighter Plane', category: 'aircraft', rank: null, count: 2, startTerrain: ['S'], moveTerrain: ['S', 'L', 'I'], unlimitedRange: true, isTransport: true },
  { name: 'Reconnaissance Plane', category: 'aircraft', rank: null, count: 2, startTerrain: ['S'], moveTerrain: ['S', 'L', 'I'], unlimitedRange: true, isTransport: true },

  // Immobile units
  { name: 'Land mine', category: 'mine', rank: null, count: 3, startTerrain: ['L', 'I'], moveTerrain: 'immobile', unlimitedRange: false, isTransport: false },
  { name: 'Naval mine', category: 'mine', rank: null, count: 3, startTerrain: ['S', 'L', 'I'], moveTerrain: 'immobile', unlimitedRange: false, isTransport: false },

  // Flag
  { name: 'Flag', category: 'flag', rank: null, count: 1, startTerrain: ['L'], moveTerrain: 'immobile', unlimitedRange: false, isTransport: false },
];

export function getUnitDef(name: string): UnitDefinition {
  const def = UNIT_DEFINITIONS.find(u => u.name === name);
  if (!def) throw new Error(`Unknown unit: ${name}`);
  return def;
}

export function isFootUnit(name: string): boolean {
  return getUnitDef(name).category === 'foot';
}

export function isNavalUnit(name: string): boolean {
  return getUnitDef(name).category === 'naval';
}

export function isAircraftUnit(name: string): boolean {
  return getUnitDef(name).category === 'aircraft';
}

export function isMobileUnit(name: string): boolean {
  const def = getUnitDef(name);
  return def.moveTerrain !== 'immobile';
}

export function isTransportUnit(name: string): boolean {
  return getUnitDef(name).isTransport;
}

export function canCaptureFlag(name: string): boolean {
  // Any foot unit except Navy Seal can capture the flag
  const def = getUnitDef(name);
  return def.category === 'foot' && name !== 'Navy Seal';
}

// Total pieces per player
export function getTotalPieceCount(): number {
  return UNIT_DEFINITIONS.reduce((sum, u) => sum + u.count, 0);
}

// Get initial piece list for setup
export function getInitialPiecesToPlace(): { unitName: string; count: number }[] {
  return UNIT_DEFINITIONS.map(u => ({ unitName: u.name, count: u.count }));
}
