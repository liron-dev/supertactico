export type TerrainType = "S" | "L" | "I";
export type Player = "yellow" | "blue";

export type FootUnitName =
  | "Rav Aluf" | "Aluf" | "Sgan Aluf" | "Rav Seren" | "Seren"
  | "Segen" | "Rav Samal" | "Samal" | "Rav Turai" | "Commando" | "Navy Seal";

export type ShipName = "M7 Ship" | "M4 Ship" | "Patrol Ship" | "Life Raft";
export type AircraftName = "Fighter Plane" | "Reconnaissance Plane";
export type ImmobileName = "Land mine" | "Naval mine" | "Flag";
export type UnitName = FootUnitName | ShipName | AircraftName | ImmobileName;
export type UnitCategory = "foot" | "ship" | "aircraft" | "immobile";

export interface UnitInstance {
  id: string;
  name: UnitName;
  owner: Player;
  carryingFlag: boolean;
  cargo: UnitInstance[];
}

export interface Cell {
  row: number;
  col: number;
  terrain: TerrainType;
  unit: UnitInstance | null;
}

export type GamePhase = "yellow_placement" | "blue_placement" | "playing" | "game_over";

export interface MoveRecord {
  unitId: string;
  from: [number, number];
  to: [number, number];
}

export type BattleOutcome = "attacker_wins" | "defender_wins" | "both_die";

export interface BattleResult {
  attacker: UnitInstance;
  defender: UnitInstance;
  outcome: BattleOutcome;
  flagDropped: [number, number] | null;
  flagReturned: Player | null;
  lifeRaftEscape: {
    raft: UnitInstance;
    maxEscapees: number;
    eligibleSoldiers: UnitInstance[];
    adjacentSeaCells: [number, number][];
  } | null;
}

export interface TransportCapacity {
  maxSoldiers: number;
  maxMines: number;
  allowedMines: UnitName[];
  maxShips: number;
  allowedShips: UnitName[];
  maxPlanes: number;
  allowedPlanes: UnitName[];
  allowsFlag: boolean;
  flagOccupiesSlot: boolean;
}

export interface UnitDefinition {
  name: UnitName;
  category: UnitCategory;
  rank: number | null;
  count: number;
  mobile: boolean;
  startTerrain: TerrainType[];
  moveTerrain: TerrainType[];
  transportCapacity: TransportCapacity | null;
}

export type Coord = [number, number];
