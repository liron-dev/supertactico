import { BoardCell, Position } from './board';
import { Player, UnitInstance } from './unit';

export type GamePhase =
  | { type: 'placement'; player: Player }
  | { type: 'transition'; nextPlayer: Player; nextPhase: 'placement' | 'gameplay'; turnNumber?: number }
  | { type: 'gameplay'; currentTurn: Player; turnNumber: number; actionTaken: boolean }
  | {
      type: 'battle';
      attacker: UnitInstance;
      defender: UnitInstance;
      attackerPos: Position;
      defenderPos: Position;
      previousPhase: { currentTurn: Player; turnNumber: number };
    }
  | {
      type: 'lifeRaftEscape';
      raft: UnitInstance;
      availableSoldiers: UnitInstance[];
      maxEscapees: number;
      adjacentSeaCells: Position[];
      previousPhase: { currentTurn: Player; turnNumber: number };
    }
  | { type: 'flagReplacement'; player: Player; previousPhase: { currentTurn: Player; turnNumber: number } }
  | { type: 'gameOver'; winner: Player };

export interface MoveRecord {
  from: Position;
  to: Position;
}

export interface GameState {
  board: BoardCell[][];
  phase: GamePhase;
  unplacedUnits: {
    yellow: UnitInstance[];
    blue: UnitInstance[];
  };
  defeated: {
    yellow: UnitInstance[];
    blue: UnitInstance[];
  };
  selectedCell: Position | null;
  selectedUnplacedUnit: UnitInstance | null;
  // Track last two moves per unit for back-and-forth rule
  moveHistory: Record<string, MoveRecord[]>;
  // Where each player originally placed their flag (for return-to-owner)
  flagOrigin: {
    yellow: Position | null;
    blue: Position | null;
  };
}

export const BOARD_ROWS = 20;
export const BOARD_COLS = 20;

export const YELLOW_ROWS = { start: 0, end: 8 }; // rows 0-8
export const BLUE_ROWS = { start: 11, end: 19 }; // rows 11-19

export const YELLOW_ISLAND_CELLS: Position[] = [
  { row: 5, col: 2 },
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 7, col: 2 },
  { row: 7, col: 3 },
  { row: 7, col: 4 },
];

export const BLUE_ISLAND_CELLS: Position[] = [
  { row: 12, col: 2 },
  { row: 12, col: 3 },
  { row: 12, col: 4 },
  { row: 13, col: 2 },
  { row: 13, col: 3 },
  { row: 14, col: 2 },
];

export function getPlayerIslandCells(player: Player): Position[] {
  return player === 'yellow' ? YELLOW_ISLAND_CELLS : BLUE_ISLAND_CELLS;
}

export function getPlayerRows(player: Player): { start: number; end: number } {
  return player === 'yellow' ? YELLOW_ROWS : BLUE_ROWS;
}

export function getOpponent(player: Player): Player {
  return player === 'yellow' ? 'blue' : 'yellow';
}
