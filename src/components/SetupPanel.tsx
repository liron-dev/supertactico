import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Unit, UnitType, Player } from "../game/types";
import { UNIT_DEFS, UNIT_ORDER } from "../game/constants";
import { getUnitImage } from "../game/unitImages";

interface SetupPanelProps {
  player: Player;
  unplacedUnits: Unit[];
  selectedType: UnitType | null;
  onSelectType: (type: UnitType | null) => void;
  onConfirm: () => void;
  canConfirm: boolean;
  validationErrors: string[];
}

export function SetupPanel({
  player,
  unplacedUnits,
  selectedType,
  onSelectType,
  onConfirm,
  canConfirm,
  validationErrors,
}: SetupPanelProps) {
  // Group unplaced units by type with counts
  const typeCounts = new Map<UnitType, number>();
  for (const u of unplacedUnits) {
    typeCounts.set(u.type, (typeCounts.get(u.type) ?? 0) + 1);
  }

  const playerColor = player === "yellow" ? "#FFD700" : "#4488FF";
  const playerLabel = player === "yellow" ? "Yellow" : "Blue";

  return (
    <View
      style={{
        width: 200,
        backgroundColor: "#111827",
        borderLeftWidth: 1,
        borderLeftColor: "#1f2937",
        padding: 8,
      }}
    >
      <Text
        style={{
          color: playerColor,
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {playerLabel} Setup
      </Text>
      <Text
        style={{
          color: "#9ca3af",
          fontSize: 11,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {unplacedUnits.length} units remaining
      </Text>

      <ScrollView style={{ flex: 1 }}>
        {UNIT_ORDER.map((type) => {
          const totalCount = UNIT_DEFS[type].count;
          const remaining = typeCounts.get(type) ?? 0;
          if (totalCount === 0) return null;

          const isSelected = selectedType === type;
          const isDisabled = remaining === 0;

          return (
            <Pressable
              key={type}
              onPress={() => {
                if (isDisabled) return;
                onSelectType(isSelected ? null : type);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 4,
                marginBottom: 2,
                borderRadius: 4,
                backgroundColor: isSelected
                  ? "rgba(255, 215, 0, 0.2)"
                  : "transparent",
                borderWidth: isSelected ? 1 : 0,
                borderColor: isSelected ? "#FFD700" : "transparent",
                opacity: isDisabled ? 0.35 : 1,
              }}
            >
              <Image
                source={getUnitImage(player, type)}
                style={{ width: 28, height: 28, borderRadius: 3 }}
                resizeMode="contain"
              />
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text
                  style={{
                    color: "#e5e7eb",
                    fontSize: 11,
                    fontWeight: "500",
                  }}
                  numberOfLines={1}
                >
                  {type}
                </Text>
              </View>
              <Text
                style={{
                  color: remaining > 0 ? "#22c55e" : "#6b7280",
                  fontSize: 11,
                  fontWeight: "bold",
                  minWidth: 24,
                  textAlign: "center",
                }}
              >
                {remaining}/{totalCount}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <View style={{ marginTop: 6 }}>
          {validationErrors.map((err, i) => (
            <Text
              key={i}
              style={{ color: "#ef4444", fontSize: 10, marginBottom: 2 }}
            >
              {err}
            </Text>
          ))}
        </View>
      )}

      {/* Confirm button */}
      <Pressable
        onPress={onConfirm}
        style={{
          marginTop: 8,
          paddingVertical: 10,
          borderRadius: 6,
          backgroundColor: canConfirm ? "#FFD700" : "#374151",
          alignItems: "center",
        }}
        disabled={!canConfirm}
      >
        <Text
          style={{
            color: canConfirm ? "#0a0f1e" : "#6b7280",
            fontWeight: "bold",
            fontSize: 13,
          }}
        >
          Confirm Setup
        </Text>
      </Pressable>
    </View>
  );
}
