import React, { useMemo } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
import { Cell, CELL_SIZE } from "./Cell";
import { BOARD_SIZE, MAP_DATA } from "../game/constants";
import { Position, Action, ActionKind, Player, Unit } from "../game/types";

interface BoardProps {
  board: (Unit | null)[][];
  currentPlayer: Player;
  selected: Position | null;
  validActions: Action[];
  activeActionKind: ActionKind | null;
  onCellPress: (pos: Position) => void;
  isSetupPhase: boolean;
  setupValidCells: Position[];
}

export function Board({
  board,
  currentPlayer,
  selected,
  validActions,
  activeActionKind,
  onCellPress,
  isSetupPhase,
  setupValidCells,
}: BoardProps) {
  // Build highlight map
  const highlightMap = useMemo(() => {
    const map = new Map<string, Action["kind"]>();
    for (const action of validActions) {
      map.set(`${action.to.row},${action.to.col}`, action.kind);
    }
    return map;
  }, [validActions]);

  const setupValidSet = useMemo(() => {
    const set = new Set<string>();
    for (const cell of setupValidCells) {
      set.add(`${cell.row},${cell.col}`);
    }
    return set;
  }, [setupValidCells]);

  const boardWidth = CELL_SIZE * BOARD_SIZE;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        alignItems: "center",
        paddingVertical: 8,
      }}
      maximumZoomScale={3}
      minimumZoomScale={0.5}
      bouncesZoom
    >
      {/* Column labels */}
      <View style={{ flexDirection: "row", marginLeft: 20 }}>
        {Array.from({ length: BOARD_SIZE }, (_, c) => (
          <View
            key={c}
            style={{
              width: CELL_SIZE,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#8899aa", fontSize: 9 }}>
              {String.fromCharCode(65 + c)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row" }}>
        {/* Row labels */}
        <View style={{ justifyContent: "flex-start" }}>
          {Array.from({ length: BOARD_SIZE }, (_, r) => (
            <View
              key={r}
              style={{
                height: CELL_SIZE,
                width: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#8899aa", fontSize: 9 }}>{r + 1}</Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <View
          style={{
            width: boardWidth,
            height: boardWidth,
          }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, r) => (
            <View key={r} style={{ flexDirection: "row" }}>
              {Array.from({ length: BOARD_SIZE }, (_, c) => {
                const key = `${r},${c}`;
                const isSelected =
                  selected !== null &&
                  selected.row === r &&
                  selected.col === c;
                const highlightType =
                  (highlightMap.get(key) as Action["kind"]) ?? null;

                return (
                  <Cell
                    key={key}
                    row={r}
                    col={c}
                    unit={board[r][c]}
                    currentPlayer={currentPlayer}
                    isSelected={isSelected}
                    highlightType={highlightType}
                    onPress={onCellPress}
                    isSetupPhase={isSetupPhase}
                    isSetupValid={setupValidSet.has(key)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
