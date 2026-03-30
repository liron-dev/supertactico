import { useCallback, useState } from "react";
import { View, ScrollView, Platform } from "react-native";
import CellComponent from "./Cell";
import { useGameStore } from "../../store/gameStore";
import { Coord } from "../../engine/types";

const BASE_CELL_SIZE = 48;

export default function Board() {
  const [zoom, setZoom] = useState(1);
  const board = useGameStore((s) => s.board);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const validMoves = useGameStore((s) => s.validMoves);
  const validAttacks = useGameStore((s) => s.validAttacks);
  const validLoadTargets = useGameStore((s) => s.validLoadTargets);
  const validUnloadTargets = useGameStore((s) => s.validUnloadTargets);
  const phase = useGameStore((s) => s.phase);
  const selectCell = useGameStore((s) => s.selectCell);
  const executeMove = useGameStore((s) => s.executeMove);
  const executeAttack = useGameStore((s) => s.executeAttack);
  const executeLoad = useGameStore((s) => s.executeLoad);
  const executeUnload = useGameStore((s) => s.executeUnload);
  const placeUnit = useGameStore((s) => s.placeUnit);
  const removePlacedUnit = useGameStore((s) => s.removePlacedUnit);
  const selectedPlacementUnit = useGameStore((s) => s.selectedPlacementUnit);

  const cellSize = BASE_CELL_SIZE * zoom;

  const isIn = (list: Coord[], r: number, c: number) => list.some(([lr, lc]) => lr === r && lc === c);

  const handleCellPress = useCallback((row: number, col: number) => {
    if (phase === "yellow_placement" || phase === "blue_placement") {
      if (selectedPlacementUnit) placeUnit(row, col);
      return;
    }
    if (phase === "playing") {
      if (selectedCell) {
        if (isIn(validMoves, row, col)) { executeMove(row, col); return; }
        if (isIn(validAttacks, row, col)) { executeAttack(row, col); return; }
        if (isIn(validLoadTargets, row, col)) { executeLoad(row, col); return; }
        if (isIn(validUnloadTargets, row, col)) { executeUnload(row, col); return; }
      }
      selectCell(row, col);
    }
  }, [phase, selectedCell, validMoves, validAttacks, validLoadTargets, validUnloadTargets, selectedPlacementUnit]);

  const handleLongPress = useCallback((row: number, col: number) => {
    if (phase === "yellow_placement" || phase === "blue_placement") removePlacedUnit(row, col);
  }, [phase]);

  const handleWheel = useCallback((e: any) => {
    e.preventDefault();
    setZoom((prev) => Math.min(3, Math.max(0.5, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  if (!board.length) return null;

  return (
    <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled
        {...(Platform.OS === "web" ? { onWheel: handleWheel } as any : {})}>
        <View style={{ padding: 4 }}>
          {board.map((row, r) => (
            <View key={r} style={{ flexDirection: "row" }}>
              {row.map((cell, c) => (
                <CellComponent key={`${r}-${c}`} cell={cell} cellSize={cellSize} currentPlayer={currentPlayer}
                  isSelected={selectedCell !== null && selectedCell[0] === r && selectedCell[1] === c}
                  isMoveTarget={isIn(validMoves, r, c)} isAttackTarget={isIn(validAttacks, r, c)}
                  isLoadTarget={isIn(validLoadTargets, r, c)} isUnloadTarget={isIn(validUnloadTargets, r, c)}
                  onPress={() => handleCellPress(r, c)} onLongPress={() => handleLongPress(r, c)} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
