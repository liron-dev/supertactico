import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { GameProvider, useGame } from '../src/state/GameContext';
import Board from '../src/components/board/Board';
import PlacementTray from '../src/components/placement/PlacementTray';
import TurnIndicator from '../src/components/gameplay/TurnIndicator';
import ActionPanel from '../src/components/gameplay/ActionPanel';
import BattleAnimation from '../src/components/gameplay/BattleAnimation';
import LifeRaftEscape from '../src/components/gameplay/LifeRaftEscape';
import FlagReplacement from '../src/components/gameplay/FlagReplacement';
import TransitionScreen from '../src/components/ui/TransitionScreen';
import Graveyard from '../src/components/ui/Graveyard';
import { Position } from '../src/types/board';
import { validatePlacement } from '../src/engine/placementValidator';

function GameContent() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [showGraveyard, setShowGraveyard] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const phase = state.phase;

  const handleCellPress = useCallback((position: Position) => {
    if (phase.type === 'placement') {
      if (state.selectedUnplacedUnit) {
        dispatch({ type: 'PLACE_UNIT', position });
      } else {
        // Tap on a placed unit to remove it
        const cell = state.board[position.row][position.col];
        if (cell.unit?.owner === phase.player) {
          dispatch({ type: 'REMOVE_PLACED_UNIT', position });
        }
      }
    } else if (phase.type === 'gameplay') {
      dispatch({ type: 'SELECT_CELL', position });
    } else if (phase.type === 'flagReplacement') {
      dispatch({ type: 'REPLACE_FLAG', position });
    }
  }, [phase, state.selectedUnplacedUnit, dispatch]);

  const handleFinishPlacement = useCallback(() => {
    if (phase.type !== 'placement') return;
    const player = phase.player;

    if (state.unplacedUnits[player].length > 0) {
      setValidationError(`You still have ${state.unplacedUnits[player].length} units to place.`);
      return;
    }

    const result = validatePlacement(state.board, player);
    if (!result.valid) {
      setValidationError(result.error || 'Invalid placement');
      return;
    }

    setValidationError(null);
    dispatch({ type: 'FINISH_PLACEMENT' });
  }, [phase, state, dispatch]);

  const handleEndTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, [dispatch]);

  // Determine current player for visibility
  const currentPlayer = (() => {
    if (phase.type === 'placement') return phase.player;
    if (phase.type === 'gameplay') return phase.currentTurn;
    if (phase.type === 'battle') return phase.previousPhase.currentTurn;
    if (phase.type === 'lifeRaftEscape') return phase.previousPhase.currentTurn;
    if (phase.type === 'flagReplacement') return phase.player;
    return null;
  })();

  return (
    <View className="flex-1 bg-navy-900">
      {/* Top bar */}
      <View className="flex-row items-center justify-between bg-navy-800 px-4 py-2 pt-3">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Text className="text-white/70 text-sm">← Back</Text>
        </Pressable>
        <Text className="text-gold-400 font-bold text-base">Super Tactico</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Phase-specific top info */}
      {phase.type === 'placement' && (
        <View className="bg-navy-700 px-4 py-2">
          <Text className="text-white text-center font-bold">
            {phase.player === 'yellow' ? 'Yellow' : 'Blue'} Player - Place Your Units
          </Text>
        </View>
      )}

      {phase.type === 'gameplay' && (
        <TurnIndicator
          player={phase.currentTurn}
          turnNumber={phase.turnNumber}
          actionTaken={phase.actionTaken}
        />
      )}

      {phase.type === 'flagReplacement' && (
        <FlagReplacement player={phase.player} />
      )}

      {/* Board */}
      <View className="flex-1">
        <Board
          onCellPress={handleCellPress}
          currentPlayer={currentPlayer}
          dimInactiveZone={phase.type === 'placement' ? phase.player : null}
        />
      </View>

      {/* Bottom panel - phase specific */}
      {phase.type === 'placement' && (
        <PlacementTray
          player={phase.player}
          onFinishPlacement={handleFinishPlacement}
          validationError={validationError}
        />
      )}

      {phase.type === 'gameplay' && (
        <ActionPanel
          onEndTurn={handleEndTurn}
          onShowGraveyard={() => setShowGraveyard(true)}
          actionTaken={phase.actionTaken}
        />
      )}

      {/* Overlays */}
      {phase.type === 'transition' && (
        <TransitionScreen
          nextPlayer={phase.nextPlayer}
          message={
            phase.nextPhase === 'placement'
              ? 'Place your units on the board'
              : 'It\'s your turn to play!'
          }
          onReady={() => dispatch({ type: 'CONFIRM_TRANSITION' })}
        />
      )}

      {phase.type === 'battle' && (
        <BattleAnimation
          attacker={phase.attacker}
          defender={phase.defender}
          onResolve={() => dispatch({ type: 'RESOLVE_BATTLE' })}
        />
      )}

      {phase.type === 'lifeRaftEscape' && (
        <LifeRaftEscape
          raft={phase.raft}
          availableSoldiers={phase.availableSoldiers}
          maxEscapees={phase.maxEscapees}
          adjacentSeaCells={phase.adjacentSeaCells}
          onEscape={(survivorIds, targetPosition) =>
            dispatch({ type: 'LIFE_RAFT_ESCAPE', survivorIds, targetPosition })
          }
          onSkip={() => dispatch({ type: 'SKIP_LIFE_RAFT_ESCAPE' })}
        />
      )}

      {phase.type === 'gameOver' && (
        <View
          className="absolute inset-0 items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <Text className="text-gold-400 text-4xl font-bold mb-4">Victory!</Text>
          <Text className="text-white text-2xl mb-8">
            {phase.winner === 'yellow' ? 'Yellow' : 'Blue'} Player Wins!
          </Text>
          <Pressable
            onPress={() => dispatch({ type: 'RESET_GAME' })}
            className="bg-gold-400 rounded-xl px-8 py-3 mb-3 active:opacity-80"
          >
            <Text className="text-navy-900 font-bold text-lg">Play Again</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="border border-white/40 rounded-xl px-8 py-3 active:opacity-80"
          >
            <Text className="text-white font-bold">Home</Text>
          </Pressable>
        </View>
      )}

      {/* Graveyard modal */}
      <Graveyard
        visible={showGraveyard}
        defeated={state.defeated}
        onClose={() => setShowGraveyard(false)}
      />
    </View>
  );
}

export default function GameScreen() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
