export type Player = "yellow" | "blue";
export type TerrainType = "S" | "L" | "I";
export type GamePhase =
  | "setup_yellow"
  | "setup_blue"
  | "turn_transition"
  | "playing";

export type UnitCategory = "foot" | "naval" | "air" | "mine" | "flag";

export type UnitType =
  | "Rav Aluf"
  | "Aluf"
  | "Sgan Aluf"
  | "Rav Seren"
  | "Seren"
  | "Segen"
  | "Rav Samal"
  | "Samal"
  | "Rav Turai"
  | "Commando"
  | "Navy Seal"
  | "M7 Ship"
  | "M4 Ship"
  | "Patrol Ship"
  | "Life Raft"
  | "Fighter Plane"
  | "Reconnaissance Plane"
  | "Land mine"
  | "Naval mine"
  | "Flag";

export interface TransportCapacity {
  maxSoldiers: number;
  allowsFlag: boolean;
  maxMines: number;
  allowedMines: UnitType[];
  maxShips: number;
  allowedShips: UnitType[];
  maxPlanes: number;
  allowedPlanes: UnitType[];
}

export interface UnitDef {
  type: UnitType;
  count: number;
  category: UnitCategory;
  footRank?: number;
  navalRank?: number;
  canStartOn: TerrainType[];
  canMoveOn: TerrainType[];
  isImmobile: boolean;
  unlimitedRange: boolean;
  transport?: TransportCapacity;
}

export interface Unit {
  id: string;
  type: UnitType;
  player: Player;
  cargo: Unit[];
  isRevealed: boolean;
  carryingFlag: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type ActionKind = "move" | "attack" | "load" | "unload";

export interface Action {
  kind: ActionKind;
  from: Position;
  to: Position;
  cargoUnitId?: string;
}

export interface BattleResult {
  attacker: Unit;
  defender: Unit;
  winner: "attacker" | "defender" | "both_die";
  flagDropped?: boolean;
  flagReturned?: Player;
  lifeRaftEscape?: {
    lifeRaft: Unit;
    adjacentCells: Position[];
  };
}

export interface BackForthEntry {
  prevPos: Position;
  count: number;
}

export interface GameState {
  phase: GamePhase;
  board: (Unit | null)[][];
  currentPlayer: Player;
  selected: Position | null;
  selectedSetupUnitType: UnitType | null;
  validActions: Action[];
  activeActionKind: ActionKind | null;
  unplacedUnits: Record<Player, Unit[]>;
  backForthMap: Record<string, BackForthEntry>;
  winner: Player | null;
  pendingBattle: BattleResult | null;
  pendingLifeRaftPlacement: {
    lifeRaft: Unit;
    adjacentCells: Position[];
  } | null;
  pendingFlagReplacement: {
    ownerPlayer: Player;
    validCells: Position[];
  } | null;
  turnNumber: number;
}
