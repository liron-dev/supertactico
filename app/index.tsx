import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-5xl font-bold text-amber-400 mb-2">
        סופר טקטיקו
      </Text>
      <Text className="text-xl text-slate-300 mb-12">Super Tactico</Text>

      <Pressable
        onPress={() => router.push("/game")}
        className="bg-amber-500 px-12 py-4 rounded-xl mb-4 active:bg-amber-600"
      >
        <Text className="text-slate-900 text-xl font-bold">New Game</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/rules")}
        className="border-2 border-slate-500 px-12 py-4 rounded-xl active:border-slate-300"
      >
        <Text className="text-slate-300 text-xl">Rules</Text>
      </Pressable>
    </View>
  );
}
