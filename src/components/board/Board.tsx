import React, { useMemo } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useGame } from '../../state/GameContext';
import { Position, posEqual } from '../../types/board';
import { Player } from '../../types/unit';
import { BOARD_ROWS, BOARD_COLS, getPlayerRows } from '../../types/game';
import Cell from './Cell';

interface BoardProps {
  onCellPress: (position: Position) => void;
  currentPlayer: Player | null;
  dimInactiveZone?: Player | null; // Dim the rows NOT belonging to this player
}

export default function Board({ onCellPress, currentPlayer, dimInactiveZone }: BoardProps) {
  const { state, validMoves, validAttacks, validLoadTargets, validFlagPickups } = useGame();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Calculate cell size to fit the board nicely
  const maxBoardHeight = windowHeight * 0.72;
  const maxBoardWidth = windowWidth * 0.92;
  const cellSize = Math.floor(Math.min(maxBoardHeight / BOARD_ROWS, maxBoardWidth / BOARD_COLS));

  const boardWidth = cellSize * BOARD_COLS;
  const boardHeight = cellSize * BOARD_ROWS;

  // Determine which rows are dimmed
  const dimmedRows = useMemo(() => {
    if (!dimInactiveZone) return new Set<number>();
    const activeRows = getPlayerRows(dimInactiveZone);
    const set = new Set<number>();
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (r < activeRows.start || r > activeRows.end) {
        set.add(r);
      }
    }
    return set;
  }, [dimInactiveZone]);

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: 'center', paddingVertical: 4 }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        contentContainerStyle={{ alignItems: 'center' }}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: boardWidth, height: boardHeight }}>
          {Array.from({ length: BOARD_ROWS }, (_, row) => (
            <View key={row} style={{ flexDirection: 'row' }}>
              {Array.from({ length: BOARD_COLS }, (_, col) => {
                const pos: Position = { row, col };
                const cell = state.board[row][col];

                return (
                  <Cell
                    key={`${row}-${col}`}
                    cell={cell}
                    position={pos}
                    size={cellSize}
                    isSelected={state.selectedCell ? posEqual(state.selectedCell, pos) : false}
                    isValidMove={validMoves.some(m => posEqual(m, pos))}
                    isValidAttack={validAttacks.some(a => posEqual(a, pos))}
                    isValidLoad={validLoadTargets.some(l => posEqual(l, pos))}
                    isValidFlagPickup={validFlagPickups.some(f => posEqual(f, pos))}
                    currentPlayer={currentPlayer}
                    onPress={onCellPress}
                    dimmed={dimmedRows.has(row)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
