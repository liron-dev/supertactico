export type CellTerrain = 'S' | 'L' | 'I'; // Sea, Land, Island
export type Player = 'yellow' | 'blue';
export type GamePhase =
  | 'setup-yellow'
  | 'setup-blue'
  | 'handoff-to-blue'
  | 'handoff-to-yellow'
  | 'play'
  | 'life-raft-escape'
  | 'flag-return'
  | 'victory';

export type UnitCategory = 'foot' | 'naval' | 'aircraft' | 'mine' | 'flag';

export interface UnitDefinition {
  name: string;
  category: UnitCategory;
  rank: number | null; // null for non-ranked combat units
  count: number; // per player
  startTerrain: CellTerrain[];
  moveTerrain: CellTerrain[] | 'immobile';
  unlimitedRange: boolean; // planes
  isTransport: boolean;
}

export interface TransportCapacity {
  maxSoldiers: number;
  maxMines: number;
  allowedMineTypes: string[];
  maxAdditionalShips: number;
  allowedShipTypes: string[];
  maxAdditionalPlanes: number;
  allowedPlaneTypes: string[];
  allowsFlag: boolean;
  flagOccupiesSlot: boolean;
}

export interface Position {
  row: number;
  col: number;
}

// A game piece - cargo is recursive to support nested transport
export interface Piece {
  id: string;
  unitName: string;
  player: Player;
  carryingFlag: boolean; // soldier carrying enemy flag
  cargo: Piece[];
}

export interface CellState {
  terrain: CellTerrain;
  piece: Piece | null;
}

export type BoardState = CellState[][];

export interface MoveRecord {
  pieceId: string;
  from: Position;
  to: Position;
}

export type ActionMode = 'move' | 'attack' | 'load' | 'unload' | null;

export interface BattleResult {
  attacker: Piece;
  defender: Piece;
  winner: 'attacker' | 'defender' | 'both_die';
  attackerSurvives: boolean;
  defenderSurvives: boolean;
  flagCaptured: boolean;
  flagDropped: boolean;
  flagReturned: boolean; // flag goes back to owner (ship sunk at sea)
  lifeRaftEscape: Piece | null; // life raft that can escape
  mineStays: boolean; // mine stays in place after winning
}

export interface LifeRaftEscapePending {
  lifeRaft: Piece;
  sinkPosition: Position;
}

export interface FlagReturnPending {
  player: Player; // the player who gets their flag back
}

export interface GameState {
  phase: GamePhase;
  board: BoardState;
  currentPlayer: Player;
  turnNumber: number;
  selectedPosition: Position | null;
  selectedCargoIndex: number | null; // for unloading
  actionMode: ActionMode;
  pendingSetup: Record<Player, PieceToPlace[]>;
  selectedSetupPiece: number | null; // index into pendingSetup
  capturedPieces: Record<Player, Piece[]>;
  moveHistory: MoveRecord[]; // for back-and-forth detection
  winner: Player | null;
  lifeRaftEscape: LifeRaftEscapePending | null;
  flagReturn: FlagReturnPending | null;
  lastBattle: BattleResult | null;
  showBattle: boolean;
  setupError: string | null;
  flagInitialPositions: Record<Player, Position | null>;
}

export interface PieceToPlace {
  unitName: string;
  count: number;
}

// Actions dispatched to reducer
export type GameAction =
  | { type: 'SELECT_SETUP_PIECE'; index: number }
  | { type: 'PLACE_PIECE'; position: Position }
  | { type: 'REMOVE_PIECE'; position: Position }
  | { type: 'CONFIRM_SETUP' }
  | { type: 'HANDOFF_COMPLETE' }
  | { type: 'SELECT_CELL'; position: Position }
  | { type: 'DESELECT' }
  | { type: 'EXECUTE_MOVE'; to: Position }
  | { type: 'EXECUTE_ATTACK'; target: Position }
  | { type: 'EXECUTE_LOAD'; from: Position; onto: Position }
  | { type: 'SELECT_CARGO'; cargoIndex: number }
  | { type: 'EXECUTE_UNLOAD'; to: Position }
  | { type: 'DISMISS_BATTLE' }
  | { type: 'LIFE_RAFT_ESCAPE'; to: Position }
  | { type: 'SKIP_LIFE_RAFT_ESCAPE' }
  | { type: 'PLACE_RETURNED_FLAG'; position: Position }
  | { type: 'END_TURN' }
  | { type: 'RESET_GAME' };
