import { UnitType, TransportCapacity, TerrainType, Player } from "../types";

export const UNIT_DISPLAY_NAME: Record<UnitType, string> = {
  [UnitType.RavAluf]: "Rav Aluf",
  [UnitType.Aluf]: "Aluf",
  [UnitType.SganAluf]: "Sgan Aluf",
  [UnitType.RavSeren]: "Rav Seren",
  [UnitType.Seren]: "Seren",
  [UnitType.Segen]: "Segen",
  [UnitType.RavSamal]: "Rav Samal",
  [UnitType.Samal]: "Samal",
  [UnitType.RavTurai]: "Rav Turai",
  [UnitType.Commando]: "Commando",
  [UnitType.NavySeal]: "Navy Seal",
  [UnitType.M7Ship]: "M7 Ship",
  [UnitType.M4Ship]: "M4 Ship",
  [UnitType.PatrolShip]: "Patrol Ship",
  [UnitType.LifeRaft]: "Life Raft",
  [UnitType.FighterPlane]: "Fighter Plane",
  [UnitType.ReconPlane]: "Recon Plane",
  [UnitType.LandMine]: "Land Mine",
  [UnitType.NavalMine]: "Naval Mine",
  [UnitType.Flag]: "Flag",
};

export const UNIT_ASSET_FILENAME: Record<UnitType, string> = {
  [UnitType.RavAluf]: "Rav Aluf.png",
  [UnitType.Aluf]: "Aluf.png",
  [UnitType.SganAluf]: "Sgan Aluf.png",
  [UnitType.RavSeren]: "Rav Seren.png",
  [UnitType.Seren]: "Seren.png",
  [UnitType.Segen]: "Segen.png",
  [UnitType.RavSamal]: "Rav Samal.png",
  [UnitType.Samal]: "Samal.png",
  [UnitType.RavTurai]: "Rav Turai.png",
  [UnitType.Commando]: "Commando.png",
  [UnitType.NavySeal]: "Navy Seal.png",
  [UnitType.M7Ship]: "M7 Ship.png",
  [UnitType.M4Ship]: "M4 Ship.png",
  [UnitType.PatrolShip]: "Patrol Ship.png",
  [UnitType.LifeRaft]: "Life Raft.png",
  [UnitType.FighterPlane]: "Fighter Plane.png",
  [UnitType.ReconPlane]: "Reconnaissance Plane.png",
  [UnitType.LandMine]: "Land mine.png",
  [UnitType.NavalMine]: "Naval mine.png",
  [UnitType.Flag]: "Flag.png",
};

export const COMBAT_RANK: Partial<Record<UnitType, number>> = {
  [UnitType.RavAluf]: 10,
  [UnitType.Aluf]: 9,
  [UnitType.SganAluf]: 8,
  [UnitType.RavSeren]: 7,
  [UnitType.Seren]: 6,
  [UnitType.Segen]: 5,
  [UnitType.RavSamal]: 4,
  [UnitType.Samal]: 3,
  [UnitType.RavTurai]: 2,
  [UnitType.Commando]: 1,
  [UnitType.NavySeal]: 0,
};

export const UNIT_COUNTS: Record<UnitType, number> = {
  [UnitType.RavAluf]: 1,
  [UnitType.Aluf]: 1,
  [UnitType.SganAluf]: 2,
  [UnitType.RavSeren]: 3,
  [UnitType.Seren]: 3,
  [UnitType.Segen]: 4,
  [UnitType.RavSamal]: 4,
  [UnitType.Samal]: 5,
  [UnitType.RavTurai]: 5,
  [UnitType.Commando]: 1,
  [UnitType.NavySeal]: 1,
  [UnitType.M7Ship]: 2,
  [UnitType.M4Ship]: 2,
  [UnitType.PatrolShip]: 4,
  [UnitType.LifeRaft]: 3,
  [UnitType.FighterPlane]: 2,
  [UnitType.ReconPlane]: 2,
  [UnitType.LandMine]: 3,
  [UnitType.NavalMine]: 3,
  [UnitType.Flag]: 1,
};

export const FOOT_UNITS: UnitType[] = [
  UnitType.RavAluf,
  UnitType.Aluf,
  UnitType.SganAluf,
  UnitType.RavSeren,
  UnitType.Seren,
  UnitType.Segen,
  UnitType.RavSamal,
  UnitType.Samal,
  UnitType.RavTurai,
  UnitType.Commando,
  UnitType.NavySeal,
];

export const NAVAL_SHIPS: UnitType[] = [
  UnitType.M7Ship,
  UnitType.M4Ship,
  UnitType.PatrolShip,
  UnitType.LifeRaft,
];

export const AIRCRAFT: UnitType[] = [
  UnitType.FighterPlane,
  UnitType.ReconPlane,
];

export const IMMOBILE_UNITS: UnitType[] = [
  UnitType.LandMine,
  UnitType.NavalMine,
  UnitType.Flag,
];

export const TRANSPORT_CAPACITIES: Partial<
  Record<UnitType, TransportCapacity>
> = {
  [UnitType.M7Ship]: {
    maxSoldiers: 4,
    canCarryFlag: true,
    maxMines: 1,
    allowedMineTypes: [UnitType.LandMine, UnitType.NavalMine],
    maxShips: 1,
    allowedShipTypes: [UnitType.PatrolShip, UnitType.LifeRaft],
    maxPlanes: 1,
    allowedPlaneTypes: [UnitType.ReconPlane],
  },
  [UnitType.M4Ship]: {
    maxSoldiers: 4,
    canCarryFlag: true,
    maxMines: 1,
    allowedMineTypes: [UnitType.LandMine, UnitType.NavalMine],
    maxShips: 1,
    allowedShipTypes: [UnitType.PatrolShip, UnitType.LifeRaft],
    maxPlanes: 0,
    allowedPlaneTypes: [],
  },
  [UnitType.PatrolShip]: {
    maxSoldiers: 4,
    canCarryFlag: true,
    maxMines: 1,
    allowedMineTypes: [UnitType.LandMine, UnitType.NavalMine],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
  },
  [UnitType.LifeRaft]: {
    maxSoldiers: 2,
    canCarryFlag: true,
    maxMines: 0,
    allowedMineTypes: [],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
  },
  [UnitType.FighterPlane]: {
    maxSoldiers: 5,
    canCarryFlag: false,
    maxMines: 1,
    allowedMineTypes: [UnitType.LandMine, UnitType.NavalMine],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
  },
  [UnitType.ReconPlane]: {
    maxSoldiers: 2,
    canCarryFlag: false,
    maxMines: 1,
    allowedMineTypes: [UnitType.LandMine, UnitType.NavalMine],
    maxShips: 0,
    allowedShipTypes: [],
    maxPlanes: 0,
    allowedPlaneTypes: [],
  },
};

export function getTerrainForUnit(type: UnitType): TerrainType[] {
  if (type === UnitType.NavySeal)
    return [TerrainType.Land, TerrainType.Island, TerrainType.Sea];
  if (FOOT_UNITS.includes(type)) return [TerrainType.Land, TerrainType.Island];
  if (NAVAL_SHIPS.includes(type)) return [TerrainType.Sea];
  if (AIRCRAFT.includes(type))
    return [TerrainType.Sea, TerrainType.Land, TerrainType.Island];
  if (type === UnitType.LandMine)
    return [TerrainType.Land, TerrainType.Island];
  if (type === UnitType.NavalMine) return [TerrainType.Sea];
  if (type === UnitType.Flag) return [TerrainType.Land];
  return [];
}

export const SETUP_ROWS = {
  [Player.Yellow]: { min: 11, max: 19 },
  [Player.Blue]: { min: 0, max: 8 },
} as const;

export function getIslandRows(player: Player): { min: number; max: number } {
  return player === Player.Blue
    ? { min: 5, max: 7 }
    : { min: 12, max: 14 };
}
