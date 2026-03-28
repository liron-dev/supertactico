import {
  GameState,
  ActionType,
  PieceId,
  Position,
  Player,
  GamePhase,
} from "../types";
import { getValidMoves, movePiece } from "./movement";
import { canAttack, resolveCombat, applyCombatResult } from "./combat";
import { loadPiece, unloadPiece } from "./transport";
import { checkWinCondition } from "./winCondition";

export interface GameAction {
  type: ActionType;
  pieceId: PieceId;
  targetPosition?: Position;
  cargoId?: PieceId;
}

export function executeAction(
  state: GameState,
  action: GameAction
): GameState {
  let newState = state;

  switch (action.type) {
    case ActionType.Move: {
      newState = movePiece(newState, action.pieceId, action.targetPosition!);
      break;
    }
    case ActionType.Attack: {
      const target = action.targetPosition!;
      const defenderCell = newState.grid[target.row][target.col];
      if (!defenderCell.pieceId) return state;

      const attacker = newState.piecesById[action.pieceId];
      const defender = newState.piecesById[defenderCell.pieceId];
      const result = resolveCombat(attacker, defender);
      newState = applyCombatResult(
        newState,
        action.pieceId,
        defenderCell.pieceId,
        result
      );

      newState = {
        ...newState,
        moveHistory: [
          ...newState.moveHistory,
          {
            pieceId: action.pieceId,
            from: { row: attacker.row, col: attacker.col },
            to: target,
            action: ActionType.Attack,
            capturedPieceId: defenderCell.pieceId,
          },
        ],
      };
      break;
    }
    case ActionType.Load: {
      newState = loadPiece(newState, action.pieceId, action.cargoId!);
      break;
    }
    case ActionType.Unload: {
      newState = unloadPiece(
        newState,
        action.pieceId,
        action.cargoId!,
        action.targetPosition!
      );
      break;
    }
  }

  // Check win condition
  const winner = checkWinCondition(newState);
  if (winner) {
    return {
      ...newState,
      winner,
      currentPhase: GamePhase.GameOver,
    };
  }

  // Switch turn
  const nextPlayer =
    newState.currentPlayer === Player.Yellow ? Player.Blue : Player.Yellow;
  const nextPhase =
    nextPlayer === Player.Yellow
      ? GamePhase.YellowTurn
      : GamePhase.BlueTurn;

  return {
    ...newState,
    currentPlayer: nextPlayer,
    currentPhase: nextPhase,
  };
}
