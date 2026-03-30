// components/game/BattleModal.tsx
import { View, Text, Pressable, Image } from "react-native";
import { useGameStore } from "../../store/gameStore";
import { getUnitImage } from "../../utils/imageMap";

export default function BattleModal() {
  const showBattleModal = useGameStore((s) => s.showBattleModal);
  const lastBattle = useGameStore((s) => s.lastBattle);
  const dismissBattle = useGameStore((s) => s.dismissBattle);

  if (!showBattleModal || !lastBattle) return null;

  const { attacker, defender, outcome } = lastBattle;

  const outcomeLabel =
    outcome === "attacker_wins"
      ? `${attacker.name} wins!`
      : outcome === "defender_wins"
      ? `${defender.name} wins!`
      : "Both eliminated!";

  const outcomeColor =
    outcome === "attacker_wins"
      ? "text-green-400"
      : outcome === "defender_wins"
      ? "text-red-400"
      : "text-amber-400";

  return (
    <View className="absolute inset-0 bg-black/80 items-center justify-center z-40">
      <View className="bg-navy-800 rounded-2xl p-6 mx-8 items-center border border-navy-600">
        <Text className="text-white/60 text-sm mb-4 tracking-wider uppercase">
          Battle Result
        </Text>

        <View className="flex-row items-center mb-6">
          {/* Attacker */}
          <View className="items-center mx-4">
            <Image
              source={getUnitImage(attacker.name, attacker.owner)}
              style={{ width: 72, height: 72, borderRadius: 8 }}
              resizeMode="contain"
            />
            <Text className="text-white text-sm mt-2 font-bold">
              {attacker.name}
            </Text>
            <Text className="text-white/40 text-xs">
              {attacker.owner === "yellow" ? "Yellow" : "Blue"}
            </Text>
            {outcome === "defender_wins" || outcome === "both_die" ? (
              <Text className="text-red-400 text-xs mt-1">Eliminated</Text>
            ) : (
              <Text className="text-green-400 text-xs mt-1">Victorious</Text>
            )}
          </View>

          <Text className="text-amber-400 text-2xl font-bold mx-2">VS</Text>

          {/* Defender */}
          <View className="items-center mx-4">
            <Image
              source={getUnitImage(defender.name, defender.owner)}
              style={{ width: 72, height: 72, borderRadius: 8 }}
              resizeMode="contain"
            />
            <Text className="text-white text-sm mt-2 font-bold">
              {defender.name}
            </Text>
            <Text className="text-white/40 text-xs">
              {defender.owner === "yellow" ? "Yellow" : "Blue"}
            </Text>
            {outcome === "attacker_wins" || outcome === "both_die" ? (
              <Text className="text-red-400 text-xs mt-1">Eliminated</Text>
            ) : (
              <Text className="text-green-400 text-xs mt-1">Victorious</Text>
            )}
          </View>
        </View>

        <Text className={`text-xl font-bold mb-6 ${outcomeColor}`}>
          {outcomeLabel}
        </Text>

        <Pressable
          className="bg-amber-500 px-8 py-3 rounded-full"
          onPress={dismissBattle}
        >
          <Text className="text-navy-900 font-bold">Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
