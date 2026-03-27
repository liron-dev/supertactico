import { useReducer, useCallback } from 'react';
import { GameState, GameAction, Position, UnitType } from '../game/types';
import { gameReducer, createInitialState } from '../game/gameReducer';
import { getValidPlacements } from '../game/setupLogic';

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const selectCell = useCallback((pos: Position) => {
    if (state.phase === 'setup_yellow' || state.phase === 'setup_blue') {
      // In setup: clicking a valid placement cell places the selected unit
      if (state.setupSelectedUnitType) {
        dispatch({ type: 'PLACE_UNIT', pos });
      }
    } else {
      dispatch({ type: 'SELECT_CELL', pos });
    }
  }, [state.phase, state.setupSelectedUnitType]);

  const setupSelectUnit = useCallback((unitType: UnitType) => {
    dispatch({ type: 'SETUP_SELECT_UNIT', unitType });
  }, []);

  const confirmSetup = useCallback(() => {
    dispatch({ type: 'CONFIRM_SETUP' });
  }, []);

  const acknowledgeB = useCallback(() => {
    dispatch({ type: 'ACKNOWLEDGE_BATTLE' });
  }, []);

  const resolveLifeRaft = useCallback((pos: Position) => {
    dispatch({ type: 'RESOLVE_LIFE_RAFT', targetPos: pos });
  }, []);

  const resolveFlagReplacement = useCallback((pos: Position) => {
    dispatch({ type: 'RESOLVE_FLAG_REPLACEMENT', targetPos: pos });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  // Derived: highlight types for board rendering
  const selectedActions = state.validActions;
  const validMovePosSet = new Set(
    selectedActions.filter(a => a.kind === 'move').map(a => `${a.to.row},${a.to.col}`)
  );
  const validAttackPosSet = new Set(
    selectedActions.filter(a => a.kind === 'attack').map(a => `${a.to.row},${a.to.col}`)
  );
  const validLoadPosSet = new Set(
    selectedActions.filter(a => a.kind === 'load').map(a => `${a.to.row},${a.to.col}`)
  );
  const validUnloadPosSet = new Set(
    selectedActions.filter(a => a.kind === 'unload').map(a => `${a.to.row},${a.to.col}`)
  );
  const validSetupPosSet = new Set(
    (state.phase === 'setup_yellow' || state.phase === 'setup_blue')
      ? selectedActions.map(a => `${a.to.row},${a.to.col}`)
      : []
  );

  return {
    state,
    dispatch,
    selectCell,
    setupSelectUnit,
    confirmSetup,
    acknowledgeB,
    resolveLifeRaft,
    resolveFlagReplacement,
    resetGame,
    // Derived highlights
    validMovePosSet,
    validAttackPosSet,
    validLoadPosSet,
    validUnloadPosSet,
    validSetupPosSet,
  };
}
