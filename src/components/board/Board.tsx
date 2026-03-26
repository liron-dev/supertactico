import React, { useMemo } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useGame } from '../../state/GameContext';
import { Position } from '../../types/game';
import { getValidMoves, getValidAttacks } from '../../engine/movement';
import { getLoadablePositions, getUnloadTargets } from '../../engine/transport';
import { getValidPlacementCells } from '../../engine/setup';
import { BOARD_ROWS, BOARD_COLS } from '../../constants/map';
import { getUnitDef, isTransportUnit } from '../../constants/units';
import Cell from './Cell';

export default function Board() {
  const { state, dispatch } = useGame();
  const { width, height } = useWindowDimensions();

  // Calculate cell size to fit the board
  const maxBoardHeight = height * 0.78;
  const maxBoardWidth = width * 0.65;
  const cellSize = Math.floor(Math.min(maxBoardWidth / BOARD_COLS, maxBoardHeight / BOARD_ROWS));

  // Compute valid target positions
  const { validMoves, validAttacks, loadTargets, setupCells, unloadTargets } = useMemo(() => {
    const validMoves: Position[] = [];
    const validAttacks: Position[] = [];
    const loadTargets: Position[] = [];
    const setupCells: Position[] = [];
    const unloadTargets: Position[] = [];

    if (state.phase === 'setup-yellow' || state.phase === 'setup-blue') {
      if (state.selectedSetupPiece !== null) {
        const pending = state.pendingSetup[state.currentPlayer];
        const pieceInfo = pending[state.selectedSetupPiece];
        if (pieceInfo && pieceInfo.count > 0) {
          setupCells.push(...getValidPlacementCells(state.board, pieceInfo.unitName, state.currentPlayer));
        }
      }
    } else if (state.phase === 'play' && state.selectedPosition) {
      const piece = state.board[state.selectedPosition.row][state.selectedPosition.col].piece;
      if (piece && piece.player === state.currentPlayer) {
        validMoves.push(...getValidMoves(state.board, state.selectedPosition, state.moveHistory));
        validAttacks.push(...getValidAttacks(state.board, state.selectedPosition));

        if (isTransportUnit(piece.unitName)) {
          loadTargets.push(...getLoadablePositions(state.board, state.selectedPosition));
        }

        if (state.selectedCargoIndex !== null) {
          unloadTargets.push(...getUnloadTargets(state.board, state.selectedPosition, state.selectedCargoIndex));
        }
      }
    }

    return { validMoves, validAttacks, loadTargets, setupCells, unloadTargets };
  }, [state.board, state.selectedPosition, state.selectedSetupPiece, state.phase, state.currentPlayer, state.moveHistory, state.selectedCargoIndex, state.pendingSetup]);

  const posInList = (pos: Position, list: Position[]) =>
    list.some(p => p.row === pos.row && p.col === pos.col);

  const handleCellPress = (pos: Position) => {
    if (state.phase === 'setup-yellow' || state.phase === 'setup-blue') {
      const existingPiece = state.board[pos.row][pos.col].piece;
      if (existingPiece && existingPiece.player === state.currentPlayer) {
        dispatch({ type: 'REMOVE_PIECE', position: pos });
      } else if (state.selectedSetupPiece !== null) {
        dispatch({ type: 'PLACE_PIECE', position: pos });
      }
      return;
    }

    if (state.phase === 'flag-return') {
      dispatch({ type: 'PLACE_RETURNED_FLAG', position: pos });
      return;
    }

    if (state.phase === 'life-raft-escape') {
      dispatch({ type: 'LIFE_RAFT_ESCAPE', to: pos });
      return;
    }

    if (state.phase !== 'play') return;

    // If in unload mode, try to unload
    if (state.selectedCargoIndex !== null && posInList(pos, unloadTargets)) {
      dispatch({ type: 'EXECUTE_UNLOAD', to: pos });
      return;
    }

    // If clicking a loadable unit while transport selected
    if (state.selectedPosition && posInList(pos, loadTargets)) {
      dispatch({ type: 'EXECUTE_LOAD', from: pos, onto: state.selectedPosition });
      return;
    }

    // Check if it's a valid attack
    if (state.selectedPosition && posInList(pos, validAttacks)) {
      dispatch({ type: 'EXECUTE_ATTACK', target: pos });
      return;
    }

    // Check if it's a valid move
    if (state.selectedPosition && posInList(pos, validMoves)) {
      dispatch({ type: 'EXECUTE_MOVE', to: pos });
      return;
    }

    // Otherwise, select the cell
    dispatch({ type: 'SELECT_CELL', position: pos });
  };

  const boardWidth = cellSize * BOARD_COLS;
  const boardHeight = cellSize * BOARD_ROWS;

  return (
    <ScrollView
      style={{ maxHeight: maxBoardHeight }}
      contentContainerStyle={{ alignItems: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
        <View
          style={{
            width: boardWidth,
            height: boardHeight,
            flexDirection: 'row',
            flexWrap: 'wrap',
            borderWidth: 2,
            borderColor: '#0a1929',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {state.board.map((row, r) =>
            row.map((cell, c) => {
              const pos = { row: r, col: c };
              return (
                <Cell
                  key={`${r}-${c}`}
                  cell={cell}
                  row={r}
                  col={c}
                  size={cellSize}
                  viewingPlayer={state.currentPlayer}
                  isSelected={
                    !!state.selectedPosition &&
                    state.selectedPosition.row === r &&
                    state.selectedPosition.col === c
                  }
                  isValidMove={posInList(pos, validMoves) || posInList(pos, unloadTargets)}
                  isValidAttack={posInList(pos, validAttacks)}
                  isLoadTarget={posInList(pos, loadTargets)}
                  isSetupValid={posInList(pos, setupCells)}
                  onPress={handleCellPress}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
