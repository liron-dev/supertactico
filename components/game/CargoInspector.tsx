// components/game/CargoInspector.tsx
import { View, Text, Pressable, Image, ScrollView } from "react-native";
import { useGameStore } from "../../store/gameStore";
import { getUnitImage } from "../../utils/imageMap";
import { UnitInstance } from "../../engine/types";

export default function CargoInspector() {
  const selectedCell = useGameStore((s) => s.selectedCell);
  const board = useGameStore((s) => s.board);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const phase = useGameStore((s) => s.phase);
  const selectCargoForUnload = useGameStore((s) => s.selectCargoForUnload);
  const selectedCargoIndex = useGameStore((s) => s.selectedCargoIndex);
  const deselectCell = useGameStore((s) => s.deselectCell);

  if (!selectedCell || phase !== "playing") return null;

  const [sr, sc] = selectedCell;
  const cell = board[sr]?.[sc];
  if (!cell?.unit) return null;
  if (cell.unit.owner !== currentPlayer) return null;
  if (cell.unit.cargo.length === 0) return null;

  const unit = cell.unit;

  const renderCargo = (cargo: UnitInstance[], depth: number = 0) => {
    return cargo.map((item, index) => (
      <View key={item.id} style={{ marginLeft: depth * 16 }}>
        <View className="flex-row items-center py-2 border-b border-navy-600">
          <Image
            source={getUnitImage(item.name, item.owner)}
            style={{ width: 36, height: 36, borderRadius: 4 }}
            resizeMode="contain"
          />
          <Text className="text-white text-sm ml-3 flex-1">{item.name}</Text>
          {item.carryingFlag && (
            <View className="bg-red-600 rounded px-2 py-0.5 mr-2">
              <Text className="text-white text-[10px] font-bold">FLAG</Text>
            </View>
          )}
          <Pressable
            className={`px-3 py-1 rounded ${
              selectedCargoIndex === index && depth === 0
                ? "bg-purple-500"
                : "bg-navy-600"
            }`}
            onPress={() => selectCargoForUnload(index)}
          >
            <Text className="text-white text-xs font-bold">Unload</Text>
          </Pressable>
        </View>
        {item.cargo.length > 0 && renderCargo(item.cargo, depth + 1)}
      </View>
    ));
  };

  return (
    <View className="bg-navy-800 border-t border-navy-600 max-h-60">
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-navy-600">
        <View className="flex-row items-center">
          <Image
            source={getUnitImage(unit.name, unit.owner)}
            style={{ width: 28, height: 28, borderRadius: 4 }}
            resizeMode="contain"
          />
          <Text className="text-amber-400 font-bold text-sm ml-2">
            {unit.name} — Cargo ({unit.cargo.length})
          </Text>
        </View>
        <Pressable onPress={deselectCell}>
          <Text className="text-white/40 text-lg">&#x2715;</Text>
        </Pressable>
      </View>
      <ScrollView className="px-4">{renderCargo(unit.cargo)}</ScrollView>
    </View>
  );
}
