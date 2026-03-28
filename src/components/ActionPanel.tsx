import React from "react";
import { View, Text, Pressable } from "react-native";
import { ActionKind, Position, Unit } from "../game/types";
import {
  getValidMoves,
  getValidAttacks,
  getValidLoads,
  getValidUnloads,
} from "../game/movementLogic";
import { GameState } from "../game/types";

interface ActionPanelProps {
  selectedUnit: Unit;
  selectedPos: Position;
  state: GameState;
  activeActionKind: ActionKind | null;
  onSetActionKind: (kind: ActionKind | null) => void;
  onClearSelection: () => void;
}

const actionConfig: {
  kind: ActionKind;
  label: string;
  color: string;
  activeColor: string;
}[] = [
  { kind: "move", label: "Move", color: "#22c55e", activeColor: "#16a34a" },
  { kind: "attack", label: "Attack", color: "#ef4444", activeColor: "#dc2626" },
  { kind: "load", label: "Load", color: "#3b82f6", activeColor: "#2563eb" },
  { kind: "unload", label: "Unload", color: "#06b6d4", activeColor: "#0891b2" },
];

export function ActionPanel({
  selectedUnit,
  selectedPos,
  state,
  activeActionKind,
  onSetActionKind,
  onClearSelection,
}: ActionPanelProps) {
  // Calculate which actions have valid targets
  const movesCount = getValidMoves(state, selectedPos).length;
  const attacksCount = getValidAttacks(state, selectedPos).length;
  const loadsCount = getValidLoads(state, selectedPos).length;
  const unloadsCount = getValidUnloads(state, selectedPos).length;

  const counts: Record<ActionKind, number> = {
    move: movesCount,
    attack: attacksCount,
    load: loadsCount,
    unload: unloadsCount,
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#111827",
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        gap: 8,
      }}
    >
      <Text
        style={{
          color: "#e5e7eb",
          fontSize: 12,
          fontWeight: "500",
          marginRight: 8,
        }}
        numberOfLines={1}
      >
        {selectedUnit.type}
      </Text>

      {actionConfig.map(({ kind, label, color, activeColor }) => {
        const count = counts[kind];
        const isActive = activeActionKind === kind;
        const isDisabled = count === 0;

        return (
          <Pressable
            key={kind}
            onPress={() => {
              if (isDisabled) return;
              onSetActionKind(isActive ? null : kind);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: isActive ? activeColor : isDisabled ? "#1f2937" : color,
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            <Text
              style={{
                color: isDisabled ? "#6b7280" : "#fff",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={onClearSelection}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: "#374151",
          marginLeft: 4,
        }}
      >
        <Text style={{ color: "#9ca3af", fontSize: 12 }}>Cancel</Text>
      </Pressable>
    </View>
  );
}
