import React from "react";
import { View, Text, Pressable } from "react-native";
import { Player } from "../game/types";

interface TurnTransitionProps {
  player: Player;
  isSetup: boolean;
  onReady: () => void;
}

export function TurnTransition({
  player,
  isSetup,
  onReady,
}: TurnTransitionProps) {
  const playerColor = player === "yellow" ? "#FFD700" : "#4488FF";
  const playerLabel = player === "yellow" ? "Yellow" : "Blue";
  const message = isSetup
    ? `${playerLabel} Player\nSet up your pieces`
    : `Pass the device to\n${playerLabel} Player`;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#0a0f1e",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      {/* Player color banner */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: playerColor,
          marginBottom: 32,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: playerColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 30,
        }}
      >
        <Text
          style={{
            fontSize: 48,
            color: player === "yellow" ? "#0a0f1e" : "#fff",
          }}
        >
          {player === "yellow" ? "Y" : "B"}
        </Text>
      </View>

      <Text
        style={{
          color: "#e5e7eb",
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 16,
          lineHeight: 34,
        }}
      >
        {message}
      </Text>

      <Text
        style={{
          color: "#6b7280",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        Make sure only the {playerLabel.toLowerCase()} player is looking
      </Text>

      <Pressable
        onPress={onReady}
        style={{
          paddingHorizontal: 48,
          paddingVertical: 14,
          borderRadius: 12,
          backgroundColor: playerColor,
        }}
      >
        <Text
          style={{
            color: player === "yellow" ? "#0a0f1e" : "#fff",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          I'm Ready
        </Text>
      </Pressable>
    </View>
  );
}
