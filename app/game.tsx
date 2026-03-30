// app/game.tsx
import { View } from "react-native";
import { useEffect } from "react";
import Board from "../components/board/Board";
import GameHUD from "../components/game/GameHUD";
import PlacementTray from "../components/game/PlacementTray";
import TurnTransition from "../components/game/TurnTransition";
import BattleModal from "../components/game/BattleModal";
import CargoInspector from "../components/game/CargoInspector";
import GameOverModal from "../components/game/GameOverModal";
import LifeRaftEscapeModal from "../components/game/LifeRaftEscapeModal";
import { useGameStore } from "../store/gameStore";

export default function GameScreen() {
  const phase = useGameStore((s) => s.phase);
  const initGame = useGameStore((s) => s.initGame);
  const board = useGameStore((s) => s.board);

  useEffect(() => {
    if (!board.length) {
      initGame();
    }
  }, []);

  const isPlacement = phase === "yellow_placement" || phase === "blue_placement";

  return (
    <View className="flex-1 bg-navy-900">
      <GameHUD />
      <View className="flex-1">
        <Board />
      </View>
      {isPlacement && <PlacementTray />}
      {!isPlacement && <CargoInspector />}
      <TurnTransition />
      <BattleModal />
      <LifeRaftEscapeModal />
      <GameOverModal />
    </View>
  );
}
