// components/game/GameOverModal.tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../../store/gameStore";

export default function GameOverModal() {
  const winner = useGameStore((s) => s.winner);
  const phase = useGameStore((s) => s.phase);
  const router = useRouter();

  if (phase !== "game_over" || !winner) return null;

  const playerColor = winner === "yellow" ? "#fbbf24" : "#3b82f6";
  const playerLabel = winner === "yellow" ? "Yellow" : "Blue";

  return (
    <View className="absolute inset-0 bg-black/85 items-center justify-center z-50">
      <View className="items-center">
        <Text className="text-6xl mb-4">🏆</Text>
        <Text
          className="text-4xl font-extrabold mb-2"
          style={{ color: playerColor }}
        >
          {playerLabel} Wins!
        </Text>
        <Text className="text-white/60 text-lg mb-8">
          Flag captured and returned to base!
        </Text>
        <Pressable
          className="bg-amber-500 px-12 py-4 rounded-full"
          onPress={() => router.replace("/")}
        >
          <Text className="text-navy-900 text-lg font-bold">Back to Menu</Text>
        </Pressable>
      </View>
    </View>
  );
}
