// app/rules.tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import RulesContent from "../components/rules/RulesContent";

export default function RulesScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-navy-800 border-b border-navy-600">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-amber-400 text-lg">← Back</Text>
        </Pressable>
        <Text className="text-amber-400 text-xl font-bold tracking-wider">
          Game Rules
        </Text>
      </View>
      <RulesContent />
    </View>
  );
}
