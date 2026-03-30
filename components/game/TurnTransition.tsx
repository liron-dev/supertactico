// components/game/TurnTransition.tsx
import { View, Text, Pressable } from "react-native";
import { useGameStore } from "../../store/gameStore";

export default function TurnTransition() {
  const showTurnTransition = useGameStore((s) => s.showTurnTransition);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const phase = useGameStore((s) => s.phase);
  const acknowledge = useGameStore((s) => s.acknowledgeTurnTransition);

  if (!showTurnTransition) return null;

  const playerColor = currentPlayer === "yellow" ? "#fbbf24" : "#3b82f6";
  const playerLabel = currentPlayer === "yellow" ? "Yellow" : "Blue";

  let message = `${playerLabel}'s Turn`;
  if (phase === "blue_placement") message = `Pass to ${playerLabel} for placement`;
  if (phase === "playing") message = `${playerLabel}'s Turn`;

  return (
    <View className="absolute inset-0 bg-navy-900/95 items-center justify-center z-50">
      <View
        className="w-5 h-5 rounded-full mb-6"
        style={{ backgroundColor: playerColor }}
      />
      <Text
        className="text-3xl font-extrabold text-white mb-4 tracking-wider"
      >
        {message}
      </Text>
      <Text className="text-white/40 text-sm mb-8">
        Make sure only {playerLabel} player can see the screen
      </Text>
      <Pressable
        className="px-12 py-4 rounded-full"
        style={{
          backgroundColor: playerColor,
          shadowColor: playerColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        }}
        onPress={acknowledge}
      >
        <Text className="text-navy-900 text-lg font-bold tracking-wider">
          I'M READY
        </Text>
      </Pressable>
    </View>
  );
}
