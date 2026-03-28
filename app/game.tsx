import React, { useCallback, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/game/gameStore";
import { Board } from "../src/components/Board";
import { SetupPanel } from "../src/components/SetupPanel";
import { ActionPanel } from "../src/components/ActionPanel";
import { GameHeader } from "../src/components/GameHeader";
import { TurnTransition } from "../src/components/TurnTransition";
import { BattleModal } from "../src/components/BattleModal";
import { WinModal } from "../src/components/WinModal";
import { Position, Action } from "../src/game/types";
import { getValidPlacements, validateSetupCompletion } from "../src/game/setupLogic";

export default function GameScreen() {
  const router = useRouter();
  const store = useGameStore();
  const [setupErrors, setSetupErrors] = useState<string[]>([]);

  const isSetupPhase =
    store.phase === "setup_yellow" || store.phase === "setup_blue";
  const isTransition = store.phase === "turn_transition";
  const isPlaying = store.phase === "playing";

  // Setup valid cells (also used for life raft / flag replacement highlights)
  const setupValidCells = useMemo(() => {
    if (store.pendingLifeRaftPlacement) {
      return store.pendingLifeRaftPlacement.adjacentCells;
    }
    if (store.pendingFlagReplacement) {
      return store.pendingFlagReplacement.validCells;
    }
    if (!isSetupPhase || !store.selectedSetupUnitType) return [];
    return getValidPlacements(store, store.selectedSetupUnitType, store.currentPlayer);
  }, [
    isSetupPhase,
    store.selectedSetupUnitType,
    store.currentPlayer,
    store.board,
    store.pendingLifeRaftPlacement,
    store.pendingFlagReplacement,
  ]);

  // Setup validation
  const setupValidation = useMemo(() => {
    if (!isSetupPhase) return { valid: false, errors: [] };
    return validateSetupCompletion(store, store.currentPlayer);
  }, [isSetupPhase, store.currentPlayer, store.unplacedUnits, store.board]);

  // Cell press handler
  const handleCellPress = useCallback(
    (pos: Position) => {
      if (isSetupPhase) {
        const unit = store.board[pos.row][pos.col];
        if (unit && unit.player === store.currentPlayer) {
          // Remove placed unit (pick it back up)
          store.removeUnit(pos);
        } else if (store.selectedSetupUnitType) {
          // Place unit
          store.placeUnit(pos);
        }
        return;
      }

      // Handle special event placements
      if (store.pendingLifeRaftPlacement) {
        const valid = store.pendingLifeRaftPlacement.adjacentCells.some(
          (c) => c.row === pos.row && c.col === pos.col,
        );
        if (valid) store.resolveLifeRaft(pos);
        return;
      }

      if (store.pendingFlagReplacement) {
        const valid = store.pendingFlagReplacement.validCells.some(
          (c) => c.row === pos.row && c.col === pos.col,
        );
        if (valid) store.resolveFlagReplacement(pos);
        return;
      }

      if (!isPlaying) return;

      // Check if we're clicking a highlighted action target
      if (store.activeActionKind && store.validActions.length > 0) {
        const action = store.validActions.find(
          (a) => a.to.row === pos.row && a.to.col === pos.col,
        );
        if (action) {
          store.executeAction(action);
          return;
        }
      }

      // Select a unit
      store.selectCell(pos);
    },
    [isSetupPhase, isPlaying, store],
  );

  const handleConfirmSetup = useCallback(() => {
    const result = store.confirmSetup();
    if (!result.valid) {
      setSetupErrors(result.errors);
    } else {
      setSetupErrors([]);
    }
  }, [store]);

  const handleActionKind = useCallback(
    (kind: typeof store.activeActionKind) => {
      store.setActionKind(kind);
    },
    [store],
  );

  // Get selected unit for action panel
  const selectedUnit =
    store.selected && isPlaying
      ? store.board[store.selected.row][store.selected.col]
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0f1e" }}>
      <GameHeader
        currentPlayer={store.currentPlayer}
        turnNumber={store.turnNumber}
        phase={store.phase}
        onHome={() => router.replace("/")}
      />

      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Board */}
        <Board
          board={store.board}
          currentPlayer={store.currentPlayer}
          selected={store.selected}
          validActions={store.validActions}
          activeActionKind={store.activeActionKind}
          onCellPress={handleCellPress}
          isSetupPhase={isSetupPhase}
          setupValidCells={setupValidCells}
        />

        {/* Setup panel (right sidebar) */}
        {isSetupPhase && (
          <SetupPanel
            player={store.currentPlayer}
            unplacedUnits={store.unplacedUnits[store.currentPlayer]}
            selectedType={store.selectedSetupUnitType}
            onSelectType={store.selectSetupUnitType}
            onConfirm={handleConfirmSetup}
            canConfirm={setupValidation.valid}
            validationErrors={setupErrors}
          />
        )}
      </View>

      {/* Action panel (bottom bar) - only when a unit is selected during play */}
      {isPlaying && selectedUnit && store.selected && (
        <ActionPanel
          selectedUnit={selectedUnit}
          selectedPos={store.selected}
          state={store}
          activeActionKind={store.activeActionKind}
          onSetActionKind={handleActionKind}
          onClearSelection={store.clearSelection}
        />
      )}

      {/* Turn transition overlay */}
      {isTransition && (
        <TurnTransition
          player={store.currentPlayer}
          isSetup={store.turnNumber === 0}
          onReady={store.acknowledgeTransition}
        />
      )}

      {/* Battle modal */}
      {store.pendingBattle && (
        <BattleModal
          result={store.pendingBattle}
          onDismiss={store.acknowledgeBattle}
        />
      )}

      {/* Win modal */}
      {store.winner && (
        <WinModal
          winner={store.winner}
          onPlayAgain={store.resetGame}
          onGoHome={() => {
            store.resetGame();
            router.replace("/");
          }}
        />
      )}

      {/* Life Raft escape banner */}
      {store.pendingLifeRaftPlacement && !store.pendingBattle && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#111827",
            padding: 12,
            alignItems: "center",
            borderTopWidth: 2,
            borderTopColor: "#06b6d4",
            zIndex: 80,
          }}
        >
          <Text style={{ color: "#06b6d4", fontSize: 14, fontWeight: "bold" }}>
            Life Raft Escape! Tap an adjacent sea cell to place the raft.
          </Text>
        </View>
      )}

      {/* Flag replacement banner */}
      {store.pendingFlagReplacement && !store.pendingBattle && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#111827",
            padding: 12,
            alignItems: "center",
            borderTopWidth: 2,
            borderTopColor: "#f59e0b",
            zIndex: 80,
          }}
        >
          <Text style={{ color: "#f59e0b", fontSize: 14, fontWeight: "bold" }}>
            Flag returned! {store.pendingFlagReplacement.ownerPlayer === "yellow" ? "Yellow" : "Blue"} player: tap a land cell to place your flag.
          </Text>
        </View>
      )}
    </View>
  );
}
