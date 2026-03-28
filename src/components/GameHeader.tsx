import React from "react";
import { View, Text, Pressable } from "react-native";
import { Player } from "../game/types";

interface GameHeaderProps {
  currentPlayer: Player;
  turnNumber: number;
  phase: string;
  onHome: () => void;
}

export function GameHeader({
  currentPlayer,
  turnNumber,
  phase,
  onHome,
}: GameHeaderProps) {
  const playerColor = currentPlayer === "yellow" ? "#FFD700" : "#4488FF";
  const playerLabel = currentPlayer === "yellow" ? "Yellow" : "Blue";
  const isSetup = phase.startsWith("setup");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#111827",
        borderBottomWidth: 1,
        borderBottomColor: "#1f2937",
      }}
    >
      <Pressable onPress={onHome}>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>← Home</Text>
      </Pressable>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: playerColor,
          }}
        />
        <Text
          style={{
            color: "#e5e7eb",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {isSetup ? `${playerLabel} Setup` : `${playerLabel}'s Turn`}
        </Text>
      </View>

      <Text style={{ color: "#6b7280", fontSize: 12 }}>
        {isSetup ? "Setup" : `Turn ${turnNumber}`}
      </Text>
    </View>
  );
}
