import {
  GameState,
  PieceId,
  Position,
  Piece,
  UnitType,
  TerrainType,
  ActionType,
} from "../types";
import {
  FOOT_UNITS,
  NAVAL_SHIPS,
  AIRCRAFT,
  IMMOBILE_UNITS,
} from "../constants/units";
import { BOARD_ROWS, BOARD_COLS } from "../constants/map";
import { isGround, isSea } from "./mapParser";

const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function canUnitBeOnTerrain(type: UnitType, terrain: TerrainType): boolean {
  if (type === UnitType.NavySeal) return true;
  if (FOOT_UNITS.includes(type)) return isGround(terrain);
  if (NAVAL_SHIPS.includes(type)) return isSea(terrain);
  if (AIRCRAFT.includes(type)) return true;
  return false;
}

function isBackAndForth(history: Position[], target: Position): boolean {
  if (history.length < 3) return false;
  const h = history;
  const len = h.length;
  // Pattern: ..., A, B, A, B(target) where B === current position and A === target
  // We need to check if the last 3 positions + target form A,B,A,B
  if (len >= 3) {
    const a = h[len - 3];
    const b = h[len - 2];
    const c = h[len - 1];
    // Check if pattern is A, B, A and target is B (back to B again = 3rd oscillation)
    if (
      a.row === c.row &&
      a.col === c.col &&
      b.row === target.row &&
      b.col === target.col
    ) {
      return true;
    }
  }
  return false;
}

export function getValidMoves(
  state: GameState,
  pieceId: PieceId
): Position[] {
  const piece = state.piecesById[pieceId];
  if (!piece || !piece.isAlive || piece.carriedByPieceId !== null) return [];
  if (IMMOBILE_UNITS.includes(piece.type)) return [];

  const moves: Position[] = [];
  const posHistory = state.positionHistory[pieceId] || [];

  if (AIRCRAFT.includes(piece.type)) {
    // Aircraft: unlimited range in cardinal directions, clear path required
    for (const [dr, dc] of DIRECTIONS) {
      let r = piece.row + dr;
      let c = piece.col + dc;
      while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
        const cell = state.grid[r][c];
        if (cell.pieceId !== null) {
          // Can attack enemy here but can't go further
          const targetPiece = state.piecesById[cell.pieceId];
          if (targetPiece.owner !== piece.owner) {
            const target = { row: r, col: c };
            if (!isBackAndForth(posHistory, target)) {
              moves.push(target);
            }
          }
          break;
        }
        // Empty cell — can move here
        const target = { row: r, col: c };
        if (!isBackAndForth(posHistory, target)) {
          moves.push(target);
        }
        r += dr;
        c += dc;
      }
    }
  } else {
    // All other mobile units: 1 cell in cardinal directions
    for (const [dr, dc] of DIRECTIONS) {
      const r = piece.row + dr;
      const c = piece.col + dc;
      if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) continue;

      const cell = state.grid[r][c];
      const terrain = cell.terrain;

      if (!canUnitBeOnTerrain(piece.type, terrain)) continue;

      const target = { row: r, col: c };

      if (cell.pieceId !== null) {
        const targetPiece = state.piecesById[cell.pieceId];
        if (targetPiece.owner === piece.owner) continue; // can't move onto friendly
        // Check marine attack restriction
        const sourceTerrain = state.grid[piece.row][piece.col].terrain;
        if (isSea(sourceTerrain) !== isSea(terrain)) continue; // no cross-terrain attacks
      }

      if (isBackAndForth(posHistory, target)) continue;

      moves.push(target);
    }
  }

  return moves;
}

export function movePiece(
  state: GameState,
  pieceId: PieceId,
  to: Position
): GameState {
  const piece = state.piecesById[pieceId];
  const from = { row: piece.row, col: piece.col };

  const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
  newGrid[from.row][from.col] = { ...newGrid[from.row][from.col], pieceId: null };
  newGrid[to.row][to.col] = { ...newGrid[to.row][to.col], pieceId: pieceId };

  const updatedPiece: Piece = { ...piece, row: to.row, col: to.col };

  // Update carried pieces positions too
  const newPiecesById = { ...state.piecesById, [pieceId]: updatedPiece };
  for (const carriedId of piece.carriedPieceIds) {
    newPiecesById[carriedId] = {
      ...newPiecesById[carriedId],
      row: to.row,
      col: to.col,
    };
  }

  const newHistory = { ...state.positionHistory };
  const pieceHistory = [...(newHistory[pieceId] || []), to];
  // Keep only last 4 positions for back-and-forth detection
  newHistory[pieceId] = pieceHistory.slice(-4);

  return {
    ...state,
    grid: newGrid,
    piecesById: newPiecesById,
    positionHistory: newHistory,
    moveHistory: [
      ...state.moveHistory,
      { pieceId, from, to, action: ActionType.Move },
    ],
  };
}
