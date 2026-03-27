import React, { useRef } from 'react';
import { ScrollView, View, Platform, StyleSheet, Dimensions } from 'react-native';
import Cell from './Cell';
import { GameState, Position, Player } from '../game/types';

interface Props {
  state: GameState;
  viewingPlayer: Player;
  validMovePosSet: Set<string>;
  validAttackPosSet: Set<string>;
  validLoadPosSet: Set<string>;
  validUnloadPosSet: Set<string>;
  validSetupPosSet: Set<string>;
  onCellPress: (pos: Position) => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const CELL_SIZE = Platform.OS === 'web'
  ? Math.min(44, Math.floor((SCREEN_W - 220) / 20))
  : Math.floor((SCREEN_W - 4) / 20);

const BOARD_SIZE = CELL_SIZE * 20;

export { CELL_SIZE };

export default function Board({
  state,
  viewingPlayer,
  validMovePosSet,
  validAttackPosSet,
  validLoadPosSet,
  validUnloadPosSet,
  validSetupPosSet,
  onCellPress,
}: Props) {
  return (
    <ScrollView
      horizontal
      style={styles.scrollH}
      contentContainerStyle={styles.scrollHContent}
      showsHorizontalScrollIndicator={false}
      maximumZoomScale={3}
      minimumZoomScale={0.5}
    >
      <ScrollView
        style={styles.scrollV}
        contentContainerStyle={styles.scrollVContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {state.board.map((rowArr, row) =>
            rowArr.map((unit, col) => {
              const key = `${row},${col}`;
              const isSelected = !!(state.selected &&
                state.selected.row === row && state.selected.col === col);
              return (
                <Cell
                  key={key}
                  row={row}
                  col={col}
                  unit={unit}
                  viewingPlayer={viewingPlayer}
                  isSelected={isSelected}
                  isValidMove={validMovePosSet.has(key)}
                  isValidAttack={validAttackPosSet.has(key)}
                  isValidLoad={validLoadPosSet.has(key)}
                  isValidUnload={validUnloadPosSet.has(key)}
                  isValidSetup={validSetupPosSet.has(key)}
                  onPress={onCellPress}
                  cellSize={CELL_SIZE}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollH: {
    flex: 1,
  },
  scrollHContent: {
    flexGrow: 1,
  },
  scrollV: {
    flex: 1,
  },
  scrollVContent: {
    flexGrow: 1,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
