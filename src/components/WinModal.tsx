import React from "react";
import { View, Text, Pressable } from "react-native";
import { Player } from "../game/types";

interface WinModalProps {
  winner: Player;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function WinModal({ winner, onPlayAgain, onGoHome }: WinModalProps) {
  const playerColor = winner === "yellow" ? "#FFD700" : "#4488FF";
  const playerLabel = winner === "yellow" ? "Yellow" : "Blue";

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <View
        style={{
          backgroundColor: "#1f2937",
          borderRadius: 20,
          padding: 40,
          alignItems: "center",
          maxWidth: 400,
          width: "90%",
          borderWidth: 2,
          borderColor: playerColor,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🏆</Text>

        <Text
          style={{
            color: playerColor,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          {playerLabel} Wins!
        </Text>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          The flag has been captured and returned to the home island!
        </Text>

        <View style={{ gap: 12, width: "100%" }}>
          <Pressable
            onPress={onPlayAgain}
            style={{
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: playerColor,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: winner === "yellow" ? "#0a0f1e" : "#fff",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Play Again
            </Text>
          </Pressable>

          <Pressable
            onPress={onGoHome}
            style={{
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: "#374151",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#e5e7eb", fontSize: 16 }}>Home</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
