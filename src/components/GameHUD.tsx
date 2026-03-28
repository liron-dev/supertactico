import React from "react";
import { View, Text, Pressable } from "react-native";
import { GamePhase, Player } from "../types";
import { useGameStore } from "../store/gameStore";
import { UNIT_DISPLAY_NAME } from "../constants/units";

export function GameHUD() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const currentPhase = useGameStore((s) => s.currentPhase);
  const winner = useGameStore((s) => s.winner);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const piecesById = useGameStore((s) => s.piecesById);
  const selectPiece = useGameStore((s) => s.selectPiece);

  const selectedPiece = selectedPieceId
    ? piecesById[selectedPieceId]
    : null;

  if (winner) {
    return (
      <View className="w-64 bg-slate-800 border-l border-slate-700 p-4 items-center justify-center">
        <Text className="text-3xl font-bold text-amber-400 mb-4">
          Victory!
        </Text>
        <Text className="text-xl text-white">
          {winner === Player.Yellow ? "Yellow" : "Blue"} wins!
        </Text>
      </View>
    );
  }

  const playerColor =
    currentPlayer === Player.Yellow ? "text-yellow-400" : "text-blue-400";

  return (
    <View className="w-64 bg-slate-800 border-l border-slate-700 p-3">
      <View className="mb-4">
        <Text className="text-slate-400 text-xs uppercase tracking-wider">
          Current Turn
        </Text>
        <Text className={`text-2xl font-bold ${playerColor}`}>
          {currentPlayer === Player.Yellow ? "Yellow" : "Blue"}
        </Text>
      </View>

      {selectedPiece && (
        <View className="bg-slate-700/50 rounded-lg p-3 mb-4">
          <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
            Selected
          </Text>
          <Text className="text-white font-bold">
            {UNIT_DISPLAY_NAME[selectedPiece.type]}
          </Text>
          {selectedPiece.carriedPieceIds.length > 0 && (
            <Text className="text-slate-300 text-sm mt-1">
              Carrying {selectedPiece.carriedPieceIds.length} unit(s)
            </Text>
          )}
          <Pressable
            onPress={() => selectPiece(null)}
            className="mt-2 bg-slate-600 px-3 py-1 rounded"
          >
            <Text className="text-slate-300 text-sm text-center">
              Deselect
            </Text>
          </Pressable>
        </View>
      )}

      <View className="bg-slate-700/30 rounded-lg p-3">
        <Text className="text-slate-400 text-xs uppercase tracking-wider mb-2">
          Controls
        </Text>
        <Text className="text-slate-300 text-xs mb-1">
          Click a piece to select it
        </Text>
        <Text className="text-slate-300 text-xs mb-1">
          Green dots = valid moves
        </Text>
        <Text className="text-slate-300 text-xs mb-1">
          Red border = attack target
        </Text>
        <Text className="text-slate-300 text-xs mb-1">
          Scroll to zoom, Shift+drag to pan
        </Text>
      </View>
    </View>
  );
}
