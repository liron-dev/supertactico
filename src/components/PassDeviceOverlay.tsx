import React from "react";
import { View, Text, Pressable } from "react-native";
import { Player } from "../types";
import { useGameStore } from "../store/gameStore";

export function PassDeviceOverlay() {
  const showPassDevice = useGameStore((s) => s.showPassDevice);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const currentPhase = useGameStore((s) => s.currentPhase);
  const dismissPassDevice = useGameStore((s) => s.dismissPassDevice);

  if (!showPassDevice) return null;

  const isSetup = currentPhase.includes("Setup");
  const playerLabel =
    currentPlayer === Player.Yellow ? "Yellow" : "Blue";
  const playerColor =
    currentPlayer === Player.Yellow ? "text-yellow-400" : "text-blue-400";

  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.95)", zIndex: 200 }}
    >
      <Text className="text-slate-400 text-lg mb-2">Pass the device to</Text>
      <Text className={`text-5xl font-bold mb-8 ${playerColor}`}>
        {playerLabel}
      </Text>
      <Text className="text-slate-400 text-sm mb-8">
        {isSetup ? "Setup Phase — Place your units" : "Your turn to move"}
      </Text>
      <Pressable
        onPress={dismissPassDevice}
        className="bg-amber-500 px-12 py-4 rounded-xl active:bg-amber-600"
      >
        <Text className="text-slate-900 text-xl font-bold">Ready</Text>
      </Pressable>
    </View>
  );
}
