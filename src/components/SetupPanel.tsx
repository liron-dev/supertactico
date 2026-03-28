import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { UnitType, Player } from "../types";
import { useGameStore } from "../store/gameStore";
import { UNIT_DISPLAY_NAME, UNIT_COUNTS } from "../constants/units";
import { getPieceImageUri } from "../utils/assets";

const UNIT_ORDER: UnitType[] = [
  UnitType.Flag,
  UnitType.RavAluf,
  UnitType.Aluf,
  UnitType.SganAluf,
  UnitType.RavSeren,
  UnitType.Seren,
  UnitType.Segen,
  UnitType.RavSamal,
  UnitType.Samal,
  UnitType.RavTurai,
  UnitType.Commando,
  UnitType.NavySeal,
  UnitType.M7Ship,
  UnitType.M4Ship,
  UnitType.PatrolShip,
  UnitType.LifeRaft,
  UnitType.FighterPlane,
  UnitType.ReconPlane,
  UnitType.LandMine,
  UnitType.NavalMine,
];

export function SetupPanel() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const setupSelectedUnit = useGameStore((s) => s.setupSelectedUnit);
  const setupErrors = useGameStore((s) => s.setupErrors);
  const setSetupUnit = useGameStore((s) => s.setSetupUnit);
  const finishSetup = useGameStore((s) => s.finishSetup);
  const getRemainingUnits = useGameStore((s) => s.getRemainingUnits);

  const remaining = getRemainingUnits();
  const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);

  return (
    <View className="w-64 bg-slate-800 border-l border-slate-700 p-3">
      <Text className="text-amber-400 text-lg font-bold mb-1">
        Setup Phase
      </Text>
      <Text className="text-slate-300 text-sm mb-3">
        {currentPlayer === Player.Yellow ? "Yellow" : "Blue"} — Place your
        units ({totalRemaining} left)
      </Text>

      <ScrollView className="flex-1 mb-3" showsVerticalScrollIndicator={false}>
        {UNIT_ORDER.map((ut) => {
          const count = remaining[ut];
          if (count === undefined) return null;

          return (
            <Pressable
              key={ut}
              onPress={() => setSetupUnit(ut)}
              className={`flex-row items-center p-2 rounded-lg mb-1 ${
                setupSelectedUnit === ut
                  ? "bg-amber-500/30 border border-amber-500"
                  : "bg-slate-700/50"
              } ${count === 0 ? "opacity-40" : ""}`}
              disabled={count === 0}
            >
              <Image
                source={{ uri: getPieceImageUri(currentPlayer, ut) }}
                style={{ width: 32, height: 32, borderRadius: 4 }}
              />
              <Text className="text-white text-sm ml-2 flex-1">
                {UNIT_DISPLAY_NAME[ut]}
              </Text>
              <Text
                className={`text-sm font-bold ${
                  count > 0 ? "text-green-400" : "text-slate-500"
                }`}
              >
                {count}/{UNIT_COUNTS[ut]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {setupErrors.length > 0 && (
        <View className="bg-red-900/50 rounded-lg p-2 mb-2">
          {setupErrors.map((err, i) => (
            <Text key={i} className="text-red-300 text-xs">
              {err}
            </Text>
          ))}
        </View>
      )}

      <Pressable
        onPress={finishSetup}
        className="bg-green-600 px-4 py-3 rounded-xl active:bg-green-700"
      >
        <Text className="text-white text-center font-bold">Done</Text>
      </Pressable>
    </View>
  );
}
