import { Position, BoardState, Piece, MoveRecord } from '../types/game';
import { getUnitDef } from '../constants/units';
import { BOARD_ROWS, BOARD_COLS } from '../constants/map';
import {
  getAdjacent,
  isInBounds,
  getTerrain,
  getPiece,
  DIRECTIONS,
} from '../utils/boardHelpers';

export function getValidMoves(
  board: BoardState,
  pos: Position,
  moveHistory: MoveRecord[]
): Position[] {
  const piece = board[pos.row][pos.col].piece;
  if (!piece) return [];

  const def = getUnitDef(piece.unitName);
  if (def.moveTerrain === 'immobile') return [];

  const allowedTerrain = def.moveTerrain;
  let candidates: Position[];

  if (def.unlimitedRange) {
    // Planes: unlimited range in cardinal directions, path must be clear
    candidates = getPlaneMoveCandidates(board, pos, allowedTerrain);
  } else {
    // Normal units: one square in cardinal directions
    candidates = getAdjacent(pos).filter(adj => {
      const terrain = getTerrain(board, adj);
      return (allowedTerrain as string[]).includes(terrain);
    });
  }

  // Filter out cells occupied by friendly pieces
  candidates = candidates.filter(adj => {
    const occupant = getPiece(board, adj);
    return !occupant || occupant.player !== piece.player;
  });

  // For movement (not attack), only empty cells
  const moveCandidates = candidates.filter(adj => !getPiece(board, adj));

  // Apply back-and-forth rule
  return filterBackAndForth(moveCandidates, piece.id, pos, moveHistory);
}

export function getValidAttacks(
  board: BoardState,
  pos: Position
): Position[] {
  const piece = board[pos.row][pos.col].piece;
  if (!piece) return [];

  const def = getUnitDef(piece.unitName);
  if (def.moveTerrain === 'immobile') return [];

  const posTerrain = getTerrain(board, pos);

  // Get adjacent cells with enemy pieces
  let adjacent: Position[];
  if (def.unlimitedRange) {
    // Planes can attack at range too (any cell they can reach that has an enemy)
    const allowedTerrain = def.moveTerrain as string[];
    adjacent = getPlaneMoveCandidates(board, pos, allowedTerrain, true);
  } else {
    adjacent = getAdjacent(pos);
  }

  return adjacent.filter(adj => {
    const occupant = getPiece(board, adj);
    if (!occupant || occupant.player === piece.player) return false;

    const adjTerrain = getTerrain(board, adj);

    // No marine attacks: cannot attack land from sea or vice versa
    // Exception: planes can attack anywhere they can move
    if (!def.unlimitedRange) {
      const attackerOnSea = posTerrain === 'S';
      const defenderOnSea = adjTerrain === 'S';
      if (attackerOnSea !== defenderOnSea) {
        // Cross-terrain attack not allowed (sea <-> land/island)
        return false;
      }
    }

    return true;
  });
}

function getPlaneMoveCandidates(
  board: BoardState,
  pos: Position,
  allowedTerrain: string[],
  includeOccupied: boolean = false
): Position[] {
  const candidates: Position[] = [];

  for (const dir of DIRECTIONS) {
    let r = pos.row + dir.row;
    let c = pos.col + dir.col;

    while (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
      const terrain = board[r][c].terrain;
      if (!allowedTerrain.includes(terrain)) break;

      const occupant = board[r][c].piece;
      if (occupant) {
        // Path is blocked - can attack this piece but can't go further
        if (includeOccupied) {
          candidates.push({ row: r, col: c });
        }
        break;
      }

      candidates.push({ row: r, col: c });
      r += dir.row;
      c += dir.col;
    }
  }

  return candidates;
}

// Back-and-forth rule: a unit may move at most twice back-and-forth between same two spaces
// If last 4 moves for this piece are A->B->A->B, prevent moving back to A
function filterBackAndForth(
  candidates: Position[],
  pieceId: string,
  currentPos: Position,
  moveHistory: MoveRecord[]
): Position[] {
  // Get last 4 moves for this piece
  const pieceMoves = moveHistory
    .filter(m => m.pieceId === pieceId)
    .slice(-4);

  if (pieceMoves.length < 4) return candidates;

  // Check if pattern is A-B-A-B (positions alternate)
  const [m1, m2, m3, m4] = pieceMoves;
  const positionsMatch = (a: Position, b: Position) =>
    a.row === b.row && a.col === b.col;

  if (
    positionsMatch(m1.from, m3.from) &&
    positionsMatch(m1.to, m3.to) &&
    positionsMatch(m2.from, m4.from) &&
    positionsMatch(m2.to, m4.to)
  ) {
    // Block moving back to the alternating position
    const blockedPos = m4.from; // would create 5th in the pattern
    return candidates.filter(c => !positionsMatch(c, blockedPos));
  }

  return candidates;
}
