export type Player = 'yellow' | 'blue';
export type TerrainType = 'S' | 'L' | 'I';
export type GamePhase = 'setup_yellow' | 'setup_blue' | 'playing';

export type UnitType =
  | 'Rav Aluf'
  | 'Aluf'
  | 'Sgan Aluf'
  | 'Rav Seren'
  | 'Seren'
  | 'Segen'
  | 'Rav Samal'
  | 'Samal'
  | 'Rav Turai'
  | 'Commando'
  | 'Navy Seal'
  | 'M7 Ship'
  | 'M4 Ship'
  | 'Patrol Ship'
  | 'Life Raft'
  | 'Fighter Plane'
  | 'Reconnaissance Plane'
  | 'Land mine'
  | 'Naval mine'
  | 'Flag';

export interface Unit {
  id: string;           // e.g. "yellow-Commando-0"
  type: UnitType;
  player: Player;
  cargo: Unit[];        // nested: M7→LifeRaft→soldiers
  isRevealed: boolean;  // true after any battle
  carryingFlag: boolean;// soldier carrying enemy flag
}

export interface Position {
  row: number;
  col: number;
}

export type ActionKind = 'move' | 'attack' | 'load' | 'unload';

export interface Action {
  kind: ActionKind;
  from: Position;
  to: Position;
  cargoUnit?: Unit; // for unload: which cargo unit to unload
}

export interface BattleResult {
  attacker: Unit;
  defender: Unit;
  winner: 'attacker' | 'defender' | 'both_die';
  attackerPos: Position;
  defenderPos: Position;
  flagDropped?: boolean;
  lifeRaftEscape?: {
    lifeRaft: Unit;
    passengers: Unit[];
    adjacentCells: Position[];
  };
}

export interface LifeRaftPending {
  lifeRaft: Unit;
  passengers: Unit[];
  adjacentCells: Position[];
  defenderPos: Position;
}

export interface GameState {
  phase: GamePhase;
  board: (Unit | null)[][];             // [row][col] 0-indexed 20x20
  currentPlayer: Player;
  selected: Position | null;
  validActions: Action[];
  unplacedUnits: { yellow: Unit[]; blue: Unit[] };
  backForthMap: Record<string, { prevPos: Position; count: number }>;
  winner: Player | null;
  battleLog: BattleResult[];
  pendingBattle: BattleResult | null;    // shown in modal, cleared on acknowledge
  pendingLifeRaftPlacement: LifeRaftPending | null;
  pendingFlagReplacement: { player: Player } | null;
  setupSelectedUnitType: UnitType | null; // which unit type is selected in setup panel
  message: string;                       // status bar message
}

export type GameAction =
  | { type: 'SELECT_CELL'; pos: Position }
  | { type: 'SETUP_SELECT_UNIT'; unitType: UnitType }
  | { type: 'PLACE_UNIT'; pos: Position }
  | { type: 'MOVE_UNIT'; from: Position; to: Position }
  | { type: 'ATTACK'; from: Position; to: Position }
  | { type: 'LOAD_UNIT'; transportPos: Position; cargoPos: Position }
  | { type: 'UNLOAD_UNIT'; transportPos: Position; cargoUnitId: string; targetPos: Position }
  | { type: 'RESOLVE_LIFE_RAFT'; targetPos: Position }
  | { type: 'RESOLVE_FLAG_REPLACEMENT'; targetPos: Position }
  | { type: 'ACKNOWLEDGE_BATTLE' }
  | { type: 'CONFIRM_SETUP' }
  | { type: 'RESET_GAME' };
