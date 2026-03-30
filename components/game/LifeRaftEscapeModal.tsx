// components/game/LifeRaftEscapeModal.tsx
import { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useGameStore } from "../../store/gameStore";
import { getUnitImage } from "../../utils/imageMap";
import { Coord } from "../../engine/types";

export default function LifeRaftEscapeModal() {
  const pending = useGameStore((s) => s.pendingLifeRaftEscape);
  const resolveEscape = useGameStore((s) => s.resolveLifeRaftEscape);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<Coord | null>(null);

  if (!pending) return null;

  const toggleSoldier = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= pending.maxEscapees) return prev;
      return [...prev, id];
    });
  };

  const canConfirm = selectedIds.length > 0 && selectedCell !== null;

  return (
    <View className="absolute inset-0 bg-black/80 items-center justify-center z-50">
      <View className="bg-navy-800 rounded-2xl p-6 mx-4 border border-navy-600">
        <Text className="text-amber-400 font-bold text-lg mb-2 text-center">
          Life Raft Escape!
        </Text>
        <Text className="text-white/60 text-sm mb-4 text-center">
          Select up to {pending.maxEscapees} soldiers to escape
        </Text>

        {/* Soldier selection */}
        <View className="mb-4">
          {pending.eligibleSoldiers.map((s) => (
            <Pressable
              key={s.id}
              className={`flex-row items-center p-2 rounded mb-1 ${
                selectedIds.includes(s.id) ? "bg-amber-500/20 border border-amber-500" : "bg-navy-700"
              }`}
              onPress={() => toggleSoldier(s.id)}
            >
              <Image
                source={getUnitImage(s.name, s.owner)}
                style={{ width: 32, height: 32, borderRadius: 4 }}
                resizeMode="contain"
              />
              <Text className="text-white text-sm ml-2">{s.name}</Text>
              {s.carryingFlag && (
                <Text className="text-red-400 text-xs ml-2">(carrying flag)</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Target cell selection */}
        <Text className="text-white/60 text-sm mb-2">Select escape destination:</Text>
        <View className="flex-row flex-wrap mb-4">
          {pending.adjacentSeaCells.map(([r, c]) => (
            <Pressable
              key={`${r}-${c}`}
              className={`px-3 py-2 rounded mr-2 mb-2 ${
                selectedCell && selectedCell[0] === r && selectedCell[1] === c
                  ? "bg-blue-500"
                  : "bg-navy-600"
              }`}
              onPress={() => setSelectedCell([r, c])}
            >
              <Text className="text-white text-xs">
                [{r},{c}]
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row justify-between">
          <Pressable
            className="bg-navy-600 px-6 py-3 rounded-full"
            onPress={() => resolveEscape([], pending.adjacentSeaCells[0])}
          >
            <Text className="text-white/60 font-bold">Skip Escape</Text>
          </Pressable>
          <Pressable
            className={`px-6 py-3 rounded-full ${canConfirm ? "bg-amber-500" : "bg-navy-600"}`}
            onPress={() => canConfirm && resolveEscape(selectedIds, selectedCell!)}
            disabled={!canConfirm}
          >
            <Text className={`font-bold ${canConfirm ? "text-navy-900" : "text-white/40"}`}>
              Confirm Escape
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
