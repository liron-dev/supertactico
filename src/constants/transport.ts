import { TransportCapacity } from '../types/game';

export const TRANSPORT_CAPACITIES: Record<string, TransportCapacity> = {
  'M7 Ship': {
    maxSoldiers: 4,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxAdditionalShips: 1,
    allowedShipTypes: ['Patrol Ship', 'Life Raft'],
    maxAdditionalPlanes: 1,
    allowedPlaneTypes: ['Reconnaissance Plane'],
    allowsFlag: true,
    flagOccupiesSlot: true,
  },
  'M4 Ship': {
    maxSoldiers: 4,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxAdditionalShips: 1,
    allowedShipTypes: ['Patrol Ship', 'Life Raft'],
    maxAdditionalPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: true,
    flagOccupiesSlot: true,
  },
  'Patrol Ship': {
    maxSoldiers: 4,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxAdditionalShips: 0,
    allowedShipTypes: [],
    maxAdditionalPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: true,
    flagOccupiesSlot: true,
  },
  'Life Raft': {
    maxSoldiers: 2,
    maxMines: 0,
    allowedMineTypes: [],
    maxAdditionalShips: 0,
    allowedShipTypes: [],
    maxAdditionalPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: true,
    flagOccupiesSlot: true,
  },
  'Fighter Plane': {
    maxSoldiers: 5,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxAdditionalShips: 0,
    allowedShipTypes: [],
    maxAdditionalPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: false,
    flagOccupiesSlot: false,
  },
  'Reconnaissance Plane': {
    maxSoldiers: 2,
    maxMines: 1,
    allowedMineTypes: ['Land mine', 'Naval mine'],
    maxAdditionalShips: 0,
    allowedShipTypes: [],
    maxAdditionalPlanes: 0,
    allowedPlaneTypes: [],
    allowsFlag: false,
    flagOccupiesSlot: false,
  },
};

export function getTransportCapacity(unitName: string): TransportCapacity | null {
  return TRANSPORT_CAPACITIES[unitName] || null;
}
