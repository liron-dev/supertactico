import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Alert, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '../src/hooks/useGameState';
import Board from '../src/components/Board';
import SetupPanel from '../src/components/SetupPanel';
import ActionPanel from '../src/components/ActionPanel';
import BattleModal from '../src/components/BattleModal';
import { Position, Player } from '../src/game/types';
import { ISLAND_CELLS_BY_PLAYER } from '../src/game/constants';

// In a 1-computer 2-player game, both players see the board but own pieces are shown to current player.
// After setup phase: current player's turn shows own pieces face-up; enemy shows as blank.
// The "viewingPlayer" is always currentPlayer during their turn.

export default function GameScreen() {
  const router = useRouter();
  const {
    state,
    selectCell,
    setupSelectUnit,
    confirmSetup,
    acknowledgeB,
    resolveLifeRaft,
    resolveFlagReplacement,
    resetGame,
    validMovePosSet,
    validAttackPosSet,
    validLoadPosSet,
    validUnloadPosSet,
    validSetupPosSet,
  } = useGameState();

  const { phase, currentPlayer, winner, pendingBattle, pendingLifeRaftPlacement, pendingFlagReplacement, message } = state;

  // Life raft placement mode
  const isLifeRaftMode = !!pendingLifeRaftPlacement;
  const lifeRaftCells = new Set(
    pendingLifeRaftPlacement?.adjacentCells.map(c => `${c.row},${c.col}`) ?? []
  );

  // Flag replacement mode
  const isFlagMode = !!pendingFlagReplacement;

  const handleCellPress = useCallback((pos: Position) => {
    if (isLifeRaftMode) {
      resolveLifeRaft(pos);
      return;
    }
    if (isFlagMode) {
      resolveFlagReplacement(pos);
      return;
    }
    selectCell(pos);
  }, [isLifeRaftMode, isFlagMode, resolveLifeRaft, resolveFlagReplacement, selectCell]);

  const handleDeselect = useCallback(() => {
    if (state.phase === 'playing') {
      // Dispatch a SELECT_CELL on the selected cell to deselect
      if (state.selected) {
        selectCell(state.selected);
      }
    }
  }, [state.selected, state.phase, selectCell]);

  const handleReset = () => {
    Alert.alert('משחק חדש', 'האם אתה בטוח שברצונך לאפס את המשחק?', [
      { text: 'לא', style: 'cancel' },
      { text: 'כן', onPress: resetGame },
    ]);
  };

  // Determine the active set for board highlights
  const activeValidMovePosSet = isLifeRaftMode
    ? lifeRaftCells
    : isFlagMode
    ? new Set<string>() // show nothing special for flag - user must pick land cell
    : validMovePosSet;

  const isSetupPhase = phase === 'setup_yellow' || phase === 'setup_blue';

  const phaseLabel = phase === 'setup_yellow'
    ? '🟡 הצבה: צהוב'
    : phase === 'setup_blue'
    ? '🔵 הצבה: כחול'
    : currentPlayer === 'yellow'
    ? '🟡 תור: צהוב'
    : '🔵 תור: כחול';

  return (
    <View style={styles.container}>
      {/* Winner overlay */}
      {winner && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.winnerBackdrop}>
            <View style={styles.winnerCard}>
              <Text style={styles.winnerEmoji}>🏆</Text>
              <Text style={styles.winnerTitle}>
                {winner === 'yellow' ? '🟡 צהוב ניצח!' : '🔵 כחול ניצח!'}
              </Text>
              <Text style={styles.winnerSubtitle}>הדגל הוחזר לבסיס!</Text>
              <TouchableOpacity style={styles.winnerBtn} onPress={resetGame}>
                <Text style={styles.winnerBtnText}>משחק חדש</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.winnerHomeBtn} onPress={() => router.replace('/')}>
                <Text style={styles.winnerHomeBtnText}>חזור לתפריט</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
        <View style={styles.statusMiddle}>
          {isLifeRaftMode && (
            <Text style={styles.alertMsg}>🚣 בחר תא לרפסודת הצלה</Text>
          )}
          {isFlagMode && (
            <Text style={styles.alertMsg}>🚩 {pendingFlagReplacement?.player === 'yellow' ? 'צהוב' : 'כחול'}: הנח דגל על יבשה</Text>
          )}
          {!isLifeRaftMode && !isFlagMode && (
            <Text style={styles.messageText} numberOfLines={1}>{message}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Board */}
        <View style={styles.boardArea}>
          <Board
            state={state}
            viewingPlayer={currentPlayer}
            validMovePosSet={activeValidMovePosSet}
            validAttackPosSet={isFlagMode || isLifeRaftMode ? new Set() : validAttackPosSet}
            validLoadPosSet={isFlagMode || isLifeRaftMode ? new Set() : validLoadPosSet}
            validUnloadPosSet={isFlagMode || isLifeRaftMode ? new Set() : validUnloadPosSet}
            validSetupPosSet={validSetupPosSet}
            onCellPress={handleCellPress}
          />
        </View>

        {/* Right sidebar (web) or bottom panel (mobile) */}
        {isSetupPhase && (
          <SetupPanel
            state={state}
            player={currentPlayer}
            onSelectUnit={setupSelectUnit}
            onConfirm={confirmSetup}
          />
        )}
      </View>

      {/* Action panel during play */}
      {phase === 'playing' && !pendingBattle && (
        <ActionPanel state={state} onDeselect={handleDeselect} />
      )}

      {/* Battle modal */}
      <BattleModal battle={pendingBattle} onAcknowledge={acknowledgeB} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
  },
  phaseLabel: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
    minWidth: 100,
  },
  statusMiddle: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messageText: {
    color: '#aac4e0',
    fontSize: 12,
    textAlign: 'center',
  },
  alertMsg: {
    color: '#ff9f43',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetBtn: {
    padding: 6,
  },
  resetBtnText: {
    color: '#7a9cc0',
    fontSize: 20,
  },
  content: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  boardArea: {
    flex: 1,
    overflow: 'hidden',
  },

  // Winner modal
  winnerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerCard: {
    backgroundColor: '#0d1a2e',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    width: 320,
    maxWidth: '90%',
  },
  winnerEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  winnerTitle: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  winnerSubtitle: {
    color: '#aac4e0',
    fontSize: 15,
    marginBottom: 24,
  },
  winnerBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  winnerBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 17,
  },
  winnerHomeBtn: {
    borderWidth: 1,
    borderColor: '#FFD70066',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  winnerHomeBtnText: {
    color: '#FFD700',
    fontSize: 15,
  },
});
