import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-navy-900">
      <Text className="text-4xl font-bold text-amber-400 mb-12">
        SUPER TACTICO
      </Text>
      <Pressable
        className="bg-amber-500 px-12 py-4 rounded-full mb-4"
        onPress={() => router.push("/game")}
      >
        <Text className="text-navy-900 text-lg font-bold">Play Game</Text>
      </Pressable>
      <Pressable
        className="border border-amber-400 px-12 py-4 rounded-full"
        onPress={() => router.push("/rules")}
      >
        <Text className="text-amber-400 text-lg font-bold">Game Rules</Text>
      </Pressable>
    </View>
  );
}
