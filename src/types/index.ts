export enum UnitType {
  RavAluf = "RavAluf",
  Aluf = "Aluf",
  SganAluf = "SganAluf",
  RavSeren = "RavSeren",
  Seren = "Seren",
  Segen = "Segen",
  RavSamal = "RavSamal",
  Samal = "Samal",
  RavTurai = "RavTurai",
  Commando = "Commando",
  NavySeal = "NavySeal",
  M7Ship = "M7Ship",
  M4Ship = "M4Ship",
  PatrolShip = "PatrolShip",
  LifeRaft = "LifeRaft",
  FighterPlane = "FighterPlane",
  ReconPlane = "ReconPlane",
  LandMine = "LandMine",
  NavalMine = "NavalMine",
  Flag = "Flag",
}

export enum TerrainType {
  Sea = "S",
  Land = "L",
  Island = "I",
}

export enum Player {
  Yellow = "yellow",
  Blue = "blue",
}

export enum GamePhase {
  YellowSetup = "yellowSetup",
  BlueSetup = "blueSetup",
  YellowTurn = "yellowTurn",
  BlueTurn = "blueTurn",
  GameOver = "gameOver",
}

export enum ActionType {
  Move = "move",
  Attack = "attack",
  Load = "load",
  Unload = "unload",
}

export type PieceId = string;

export interface Piece {
  id: PieceId;
  type: UnitType;
  owner: Player;
  row: number;
  col: number;
  carriedPieceIds: PieceId[];
  carriedByPieceId: PieceId | null;
  isCarryingEnemyFlag: boolean;
  isAlive: boolean;
}

export interface Cell {
  terrain: TerrainType;
  pieceId: PieceId | null;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  grid: Cell[][];
  piecesById: Record<PieceId, Piece>;
  currentPhase: GamePhase;
  currentPlayer: Player;
  moveHistory: MoveRecord[];
  positionHistory: Record<PieceId, Position[]>;
  winner: Player | null;
  pendingLifeRaftEscape: LifeRaftEscapeState | null;
  pendingFlagReturn: Player | null;
}

export interface MoveRecord {
  pieceId: PieceId;
  from: Position;
  to: Position;
  action: ActionType;
  capturedPieceId?: PieceId;
}

export interface LifeRaftEscapeState {
  lifeRaftId: PieceId;
  sunkShipPosition: Position;
  maxEscapees: number;
  eligibleSoldierIds: PieceId[];
}

export interface CombatResult {
  winner: "attacker" | "defender" | "draw";
  attackerDies: boolean;
  defenderDies: boolean;
  flagCaptured: boolean;
  flagDropped: boolean;
  flagReturnedToOwner: boolean;
  lifeRaftEscape: LifeRaftEscapeState | null;
}

export interface TransportCapacity {
  maxSoldiers: number;
  canCarryFlag: boolean;
  maxMines: number;
  allowedMineTypes: UnitType[];
  maxShips: number;
  allowedShipTypes: UnitType[];
  maxPlanes: number;
  allowedPlaneTypes: UnitType[];
}
