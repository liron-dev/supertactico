import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Player, UnitType } from "../types";
import { useGameStore } from "../store/gameStore";
import { UNIT_DISPLAY_NAME } from "../constants/units";
import { getPieceImageUri } from "../utils/assets";

export function CombatDialog() {
  const lastCombat = useGameStore((s) => s.lastCombat);
  const dismissCombat = useGameStore((s) => s.dismissCombat);

  if (!lastCombat) return null;

  const {
    attackerType,
    defenderType,
    winner,
    attackerOwner,
    defenderOwner,
  } = lastCombat;

  const resultText =
    winner === "draw"
      ? "Both units destroyed!"
      : winner === "attacker"
      ? `${UNIT_DISPLAY_NAME[attackerType]} wins!`
      : `${UNIT_DISPLAY_NAME[defenderType]} wins!`;

  const resultColor =
    winner === "draw"
      ? "text-orange-400"
      : winner === "attacker"
      ? "text-green-400"
      : "text-red-400";

  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 100 }}
    >
      <View className="bg-slate-800 rounded-2xl p-6 items-center w-80 border border-slate-600">
        <Text className="text-white text-xl font-bold mb-4">Combat!</Text>

        <View className="flex-row items-center justify-center mb-4">
          <View className="items-center mx-4">
            <Image
              source={{
                uri: getPieceImageUri(attackerOwner, attackerType),
              }}
              style={{ width: 64, height: 64, borderRadius: 8 }}
            />
            <Text className="text-slate-300 text-xs mt-1">
              {UNIT_DISPLAY_NAME[attackerType]}
            </Text>
            <Text
              className={`text-xs ${
                attackerOwner === Player.Yellow
                  ? "text-yellow-400"
                  : "text-blue-400"
              }`}
            >
              {attackerOwner}
            </Text>
          </View>

          <Text className="text-white text-2xl font-bold">VS</Text>

          <View className="items-center mx-4">
            <Image
              source={{
                uri: getPieceImageUri(defenderOwner, defenderType),
              }}
              style={{ width: 64, height: 64, borderRadius: 8 }}
            />
            <Text className="text-slate-300 text-xs mt-1">
              {UNIT_DISPLAY_NAME[defenderType]}
            </Text>
            <Text
              className={`text-xs ${
                defenderOwner === Player.Yellow
                  ? "text-yellow-400"
                  : "text-blue-400"
              }`}
            >
              {defenderOwner}
            </Text>
          </View>
        </View>

        <Text className={`text-lg font-bold mb-4 ${resultColor}`}>
          {resultText}
        </Text>

        <Pressable
          onPress={dismissCombat}
          className="bg-amber-500 px-8 py-3 rounded-xl active:bg-amber-600"
        >
          <Text className="text-slate-900 font-bold">Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
