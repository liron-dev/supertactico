import { Pressable, View, Text } from "react-native";
import { Cell as CellType, Player } from "../../engine/types";
import Piece from "./Piece";

interface CellProps {
  cell: CellType;
  cellSize: number;
  currentPlayer: Player;
  isSelected: boolean;
  isMoveTarget: boolean;
  isAttackTarget: boolean;
  isLoadTarget: boolean;
  isUnloadTarget: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const TERRAIN_COLORS: Record<string, string> = { S: "#1a3a5c", L: "#3d6b4f", I: "#5a9e5a" };

export default function CellComponent({ cell, cellSize, currentPlayer, isSelected, isMoveTarget, isAttackTarget, isLoadTarget, isUnloadTarget, onPress, onLongPress }: CellProps) {
  const bgColor = TERRAIN_COLORS[cell.terrain] || "#1a3a5c";

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={{
      width: cellSize, height: cellSize, backgroundColor: bgColor,
      borderWidth: isSelected ? 2 : 0.5,
      borderColor: isSelected ? "#fbbf24" : "#0a0f1e44",
      alignItems: "center", justifyContent: "center", position: "relative",
    }}>
      {isMoveTarget && (
        <View style={{ position: "absolute", width: cellSize * 0.3, height: cellSize * 0.3, borderRadius: cellSize * 0.15, backgroundColor: "rgba(74, 222, 128, 0.6)" }} />
      )}
      {isAttackTarget && (
        <View style={{ position: "absolute", width: cellSize - 4, height: cellSize - 4, borderWidth: 2, borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: 2 }} />
      )}
      {isLoadTarget && (
        <View style={{ position: "absolute", width: cellSize - 4, height: cellSize - 4, borderWidth: 2, borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.2)", borderRadius: 2 }} />
      )}
      {isUnloadTarget && (
        <View style={{ position: "absolute", width: cellSize - 4, height: cellSize - 4, borderWidth: 2, borderColor: "#a855f7", backgroundColor: "rgba(168, 85, 247, 0.2)", borderRadius: 2 }} />
      )}
      {cell.unit && <Piece unit={cell.unit} currentPlayer={currentPlayer} cellSize={cellSize} />}
    </Pressable>
  );
}
