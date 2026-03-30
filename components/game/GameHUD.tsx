// components/game/GameHUD.tsx
import { View, Text, Pressable } from "react-native";
import { useGameStore } from "../../store/gameStore";

export default function GameHUD() {
  const phase = useGameStore((s) => s.phase);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const turnNumber = useGameStore((s) => s.turnNumber);
  const winner = useGameStore((s) => s.winner);

  const playerColor = currentPlayer === "yellow" ? "#fbbf24" : "#3b82f6";
  const playerLabel = currentPlayer === "yellow" ? "Yellow" : "Blue";

  let phaseLabel = "";
  if (phase === "yellow_placement") phaseLabel = "Yellow Placing Units";
  else if (phase === "blue_placement") phaseLabel = "Blue Placing Units";
  else if (phase === "playing") phaseLabel = `Turn ${turnNumber}`;
  else if (phase === "game_over") phaseLabel = `${winner === "yellow" ? "Yellow" : "Blue"} Wins!`;

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-navy-800 border-b border-navy-600">
      <View className="flex-row items-center">
        <View
          className="w-4 h-4 rounded-full mr-2"
          style={{ backgroundColor: playerColor }}
        />
        <Text className="text-white font-bold text-base">{playerLabel}</Text>
      </View>
      <Text className="text-amber-400 font-bold text-base">{phaseLabel}</Text>
    </View>
  );
}
