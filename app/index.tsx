import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../store/gameStore";

export default function HomeScreen() {
  const router = useRouter();
  const initGame = useGameStore((s) => s.initGame);

  const handlePlay = () => { initGame(); router.push("/game"); };

  return (
    <View className="flex-1 bg-navy-900">
      {/* Background grid pattern */}
      <View className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`h-${i}`} className="absolute left-0 right-0 border-b border-amber-400" style={{ top: `${(i + 1) * 5}%` }} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`v-${i}`} className="absolute top-0 bottom-0 border-r border-amber-400" style={{ left: `${(i + 1) * 5}%` }} />
        ))}
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-4 opacity-20">
          <Text className="text-amber-400 text-6xl">&#9733;</Text>
        </View>
        <Text className="text-5xl font-extrabold text-amber-400 tracking-widest mb-2"
          style={{ textShadowColor: "rgba(251, 191, 36, 0.4)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 }}>
          SUPER
        </Text>
        <Text className="text-6xl font-extrabold text-amber-500 tracking-[8px] mb-2"
          style={{ textShadowColor: "rgba(245, 158, 11, 0.5)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 }}>
          TACTICO
        </Text>
        <View className="w-48 h-0.5 bg-amber-500/40 my-6" />
        <Text className="text-amber-400/50 text-sm tracking-[4px] mb-12 uppercase">Strategic Warfare</Text>
        <Pressable className="w-64 py-4 rounded-full mb-4 items-center active:opacity-80"
          style={{ backgroundColor: "#f59e0b", shadowColor: "#f59e0b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
          onPress={handlePlay}>
          <Text className="text-navy-900 text-lg font-bold tracking-wider">PLAY GAME</Text>
        </Pressable>
        <Pressable className="w-64 py-4 rounded-full items-center border-2 border-amber-400/50 active:opacity-80 active:bg-amber-400/10"
          onPress={() => router.push("/rules")}>
          <Text className="text-amber-400 text-lg font-bold tracking-wider">GAME RULES</Text>
        </Pressable>
      </View>
      <View className="items-center pb-6">
        <Text className="text-amber-400/20 text-xs tracking-wider">2 PLAYERS • AGES 9-99</Text>
      </View>
    </View>
  );
}
