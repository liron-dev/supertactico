import React from "react";
import { Pressable, View, Image, Text } from "react-native";
import { MAP_DATA } from "../game/constants";
import { Unit, Position, Player, ActionKind } from "../game/types";
import { getUnitImage, getBlankImage } from "../game/unitImages";

export const CELL_SIZE = 40;

interface CellProps {
  row: number;
  col: number;
  unit: Unit | null;
  currentPlayer: Player;
  isSelected: boolean;
  highlightType: "move" | "attack" | "load" | "unload" | null;
  onPress: (pos: Position) => void;
  isSetupPhase: boolean;
  isSetupValid: boolean;
}

const terrainColors: Record<string, string> = {
  S: "#1a3a5c",
  L: "#2d5a1b",
  I: "#b8860b",
};

const terrainBorderColors: Record<string, string> = {
  S: "#152d47",
  L: "#234a15",
  I: "#96700a",
};

function CellComponent({
  row,
  col,
  unit,
  currentPlayer,
  isSelected,
  highlightType,
  onPress,
  isSetupPhase,
  isSetupValid,
}: CellProps) {
  const terrain = MAP_DATA[row][col];
  const bgColor = terrainColors[terrain];
  const borderColor = terrainBorderColors[terrain];

  let overlayColor = "transparent";
  if (isSelected) overlayColor = "rgba(255, 215, 0, 0.5)";
  else if (highlightType === "move") overlayColor = "rgba(0, 255, 0, 0.3)";
  else if (highlightType === "attack") overlayColor = "rgba(255, 0, 0, 0.35)";
  else if (highlightType === "load") overlayColor = "rgba(0, 150, 255, 0.3)";
  else if (highlightType === "unload") overlayColor = "rgba(0, 200, 255, 0.3)";
  else if (isSetupValid) overlayColor = "rgba(0, 255, 0, 0.2)";

  const isOwn = unit && unit.player === currentPlayer;
  const imageSource = unit
    ? isOwn
      ? getUnitImage(unit.player, unit.type)
      : getBlankImage(unit.player)
    : null;

  const cargoCount = unit ? getTotalCargoCount(unit) : 0;

  return (
    <Pressable
      onPress={() => onPress({ row, col })}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: bgColor,
        borderWidth: 0.5,
        borderColor: borderColor,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Highlight overlay */}
      {overlayColor !== "transparent" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlayColor,
            zIndex: 1,
          }}
        />
      )}

      {/* Unit image */}
      {imageSource && (
        <Image
          source={imageSource}
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            position: "absolute",
            top: 1,
            left: 1,
            borderRadius: 4,
          }}
          resizeMode="contain"
        />
      )}

      {/* Cargo badge */}
      {isOwn && cargoCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: 1,
            right: 1,
            backgroundColor: "#FFD700",
            borderRadius: 7,
            width: 14,
            height: 14,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "#000" }}>
            {cargoCount}
          </Text>
        </View>
      )}

      {/* Flag carrier indicator */}
      {isOwn && unit?.carryingFlag && (
        <View
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            backgroundColor: "#FF4444",
            borderRadius: 4,
            width: 12,
            height: 12,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <Text style={{ fontSize: 8, color: "#fff" }}>🏴</Text>
        </View>
      )}

      {/* Selected ring */}
      {isSelected && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: 2,
            borderColor: "#FFD700",
            borderRadius: 2,
            zIndex: 4,
          }}
        />
      )}
    </Pressable>
  );
}

function getTotalCargoCount(unit: Unit): number {
  let count = unit.cargo.length;
  for (const c of unit.cargo) {
    count += getTotalCargoCount(c);
  }
  return count;
}

export const Cell = React.memo(CellComponent);
