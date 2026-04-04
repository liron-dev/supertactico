import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { GameState } from '../types/game';
import { GameAction } from '../types/actions';
import { gameReducer, createInitialState } from './gameReducer';
import {
  getValidMoves,
  getValidAttacks,
  getValidLoadTargets,
  getValidFlagPickups,
  getUnloadableItems,
  getValidUnloadTargets,
} from '../engine/GameEngine';
import { Position } from '../types/board';
import { UnitInstance } from '../types/unit';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Computed values for the currently selected unit
  validMoves: Position[];
  validAttacks: Position[];
  validLoadTargets: Position[];
  validFlagPickups: Position[];
  unloadableItems: UnitInstance[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const computed = useMemo(() => {
    if (state.phase.type !== 'gameplay' || !state.selectedCell) {
      return {
        validMoves: [],
        validAttacks: [],
        validLoadTargets: [],
        validFlagPickups: [],
        unloadableItems: [],
      };
    }

    const cell = state.board[state.selectedCell.row][state.selectedCell.col];
    if (!cell.unit || cell.unit.owner !== state.phase.currentTurn) {
      return {
        validMoves: [],
        validAttacks: [],
        validLoadTargets: [],
        validFlagPickups: [],
        unloadableItems: [],
      };
    }

    return {
      validMoves: state.phase.actionTaken ? [] : getValidMoves(state, state.selectedCell),
      validAttacks: state.phase.actionTaken ? [] : getValidAttacks(state, state.selectedCell),
      validLoadTargets: state.phase.actionTaken ? [] : getValidLoadTargets(state, state.selectedCell),
      validFlagPickups: state.phase.actionTaken ? [] : getValidFlagPickups(state, state.selectedCell),
      unloadableItems: getUnloadableItems(cell.unit),
    };
  }, [state]);

  const value = useMemo(
    () => ({ state, dispatch, ...computed }),
    [state, dispatch, computed],
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
