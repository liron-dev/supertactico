import { useEffect } from "react";
import { View } from "react-native";
import { GamePhase } from "../src/types";
import { useGameStore } from "../src/store/gameStore";
import { BoardViewport } from "../src/components/BoardViewport";
import { SetupPanel } from "../src/components/SetupPanel";
import { GameHUD } from "../src/components/GameHUD";
import { CombatDialog } from "../src/components/CombatDialog";
import { PassDeviceOverlay } from "../src/components/PassDeviceOverlay";

export default function GameScreen() {
  const initGame = useGameStore((s) => s.initGame);
  const currentPhase = useGameStore((s) => s.currentPhase);

  useEffect(() => {
    initGame();
  }, []);

  const isSetup =
    currentPhase === GamePhase.YellowSetup ||
    currentPhase === GamePhase.BlueSetup;

  return (
    <View className="flex-1 flex-row bg-slate-900">
      <View className="flex-1">
        <BoardViewport />
      </View>
      {isSetup ? <SetupPanel /> : <GameHUD />}
      <CombatDialog />
      <PassDeviceOverlay />
    </View>
  );
}
