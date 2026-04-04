import { UnitTypeName } from '../types/unit';

export interface TransportCapacity {
  maxSoldiers: number;
  maxMines: number;
  allowedMineTypes: UnitTypeName[];
  maxShips: number;
  allowedShipTypes: UnitTypeName[];
  maxPlanes: number;
  allowedPlaneTypes: UnitTypeName[];
  allowsFlag: boolean; // Can carry a soldier with the enemy flag?
}

export const TRANSPORT_CAPACITIES: Partial<Record<UnitTypeName, TransportCapacity>> = {
  'M7 Ship': {
    maxSoldiers: 4,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxShips: 1,
    allowedShipTypes: ['Patrol Ship', 'Life Raft'],
    maxPlanes: 1,
    allowedPlaneTypes: ['Reconnaissance Plane'],
    allowsFlag: true,
  },
  'M4 Ship': {
    maxSoldiers: 4,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxShips: 1,
    allowedShipTypes: ['Patrol Ship', 'Life Raft'],
    maxPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: true,
  },
  'Patrol Ship': {
    maxSoldiers: 4,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: true,
  },
  'Life Raft': {
    maxSoldiers: 2,
    maxMines: 0,
    allowedMineTypes: [],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: true,
  },
  'Fighter Plane': {
    maxSoldiers: 5,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: false, // Planes cannot transport the flag
  },
  'Reconnaissance Plane': {
    maxSoldiers: 2,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: false, // Planes cannot transport the flag
  },
};

export function getTransportCapacity(type: UnitTypeName): TransportCapacity | null {
  return TRANSPORT_CAPACITIES[type] ?? null;
}

export function isTransportType(type: UnitTypeName): boolean {
  return type in TRANSPORT_CAPACITIES;
}
