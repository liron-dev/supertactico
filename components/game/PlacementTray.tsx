// components/game/PlacementTray.tsx
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useGameStore } from "../../store/gameStore";
import { getUnitImage } from "../../utils/imageMap";
import { UnitName } from "../../engine/types";

export default function PlacementTray() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const inventory = useGameStore((s) => s.placementInventory[s.currentPlayer]);
  const selectedUnit = useGameStore((s) => s.selectedPlacementUnit);
  const selectPlacementUnit = useGameStore((s) => s.selectPlacementUnit);
  const finishPlacement = useGameStore((s) => s.finishPlacement);
  const placementErrors = useGameStore((s) => s.placementErrors);

  const totalRemaining = inventory.reduce((sum, i) => sum + i.remaining, 0);

  return (
    <View className="bg-navy-800 border-t border-navy-600">
      {/* Error messages */}
      {placementErrors.length > 0 && (
        <View className="px-4 py-2 bg-red-900/50">
          {placementErrors.map((err, i) => (
            <Text key={i} className="text-red-400 text-sm">{err}</Text>
          ))}
        </View>
      )}

      {/* Unit count and finish button */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-white/60 text-sm">
          {totalRemaining} units remaining
        </Text>
        <Pressable
          className={`px-6 py-2 rounded-full ${
            totalRemaining === 0 ? "bg-amber-500" : "bg-navy-600"
          }`}
          onPress={finishPlacement}
        >
          <Text
            className={`font-bold text-sm ${
              totalRemaining === 0 ? "text-navy-900" : "text-white/40"
            }`}
          >
            Finish Placement
          </Text>
        </Pressable>
      </View>

      {/* Scrollable unit tray */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
      >
        {inventory.map((item) => {
          const isSelected = selectedUnit === item.name;
          const isEmpty = item.remaining <= 0;

          return (
            <Pressable
              key={item.name}
              className={`mr-2 p-1.5 rounded-lg items-center ${
                isSelected
                  ? "border-2 border-amber-400 bg-amber-400/10"
                  : "border border-navy-600"
              } ${isEmpty ? "opacity-30" : ""}`}
              style={{ width: 72 }}
              onPress={() => !isEmpty && selectPlacementUnit(item.name)}
              disabled={isEmpty}
            >
              <Image
                source={getUnitImage(item.name, currentPlayer)}
                style={{ width: 48, height: 48, borderRadius: 4 }}
                resizeMode="contain"
              />
              <Text className="text-white/60 text-[10px] mt-1 text-center" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="bg-navy-600 rounded-full px-2 py-0.5 mt-1">
                <Text className="text-white text-xs font-bold">
                  {item.remaining}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
