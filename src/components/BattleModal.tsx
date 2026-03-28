import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { BattleResult } from "../game/types";
import { getUnitImage } from "../game/unitImages";

interface BattleModalProps {
  result: BattleResult;
  onDismiss: () => void;
}

export function BattleModal({ result, onDismiss }: BattleModalProps) {
  const { attacker, defender, winner } = result;

  const attackerWon = winner === "attacker";
  const defenderWon = winner === "defender";
  const bothDied = winner === "both_die";

  const outcomeText = bothDied
    ? "Both units destroyed!"
    : attackerWon
      ? `${attacker.type} wins!`
      : `${defender.type} wins!`;

  const outcomeColor = bothDied
    ? "#f59e0b"
    : attackerWon
      ? "#22c55e"
      : "#ef4444";

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 90,
      }}
    >
      <View
        style={{
          backgroundColor: "#1f2937",
          borderRadius: 16,
          padding: 24,
          alignItems: "center",
          maxWidth: 360,
          width: "90%",
        }}
      >
        <Text
          style={{
            color: "#e5e7eb",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
          Battle!
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Attacker */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                borderWidth: 3,
                borderColor: attackerWon ? "#22c55e" : bothDied ? "#ef4444" : "#ef4444",
                borderRadius: 12,
                padding: 4,
                opacity: attackerWon ? 1 : 0.5,
              }}
            >
              <Image
                source={getUnitImage(attacker.player, attacker.type)}
                style={{ width: 72, height: 72, borderRadius: 8 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                color: attacker.player === "yellow" ? "#FFD700" : "#4488FF",
                fontSize: 11,
                marginTop: 6,
                fontWeight: "600",
              }}
            >
              {attacker.type}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 10 }}>Attacker</Text>
          </View>

          {/* VS */}
          <Text
            style={{
              color: "#6b7280",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            VS
          </Text>

          {/* Defender */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                borderWidth: 3,
                borderColor: defenderWon ? "#22c55e" : bothDied ? "#ef4444" : "#ef4444",
                borderRadius: 12,
                padding: 4,
                opacity: defenderWon ? 1 : 0.5,
              }}
            >
              <Image
                source={getUnitImage(defender.player, defender.type)}
                style={{ width: 72, height: 72, borderRadius: 8 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                color: defender.player === "yellow" ? "#FFD700" : "#4488FF",
                fontSize: 11,
                marginTop: 6,
                fontWeight: "600",
              }}
            >
              {defender.type}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 10 }}>Defender</Text>
          </View>
        </View>

        {/* Outcome */}
        <Text
          style={{
            color: outcomeColor,
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          {outcomeText}
        </Text>

        <Pressable
          onPress={onDismiss}
          style={{
            paddingHorizontal: 40,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: "#374151",
          }}
        >
          <Text style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600" }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
