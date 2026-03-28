import React, { memo } from "react";
import { TerrainType } from "../types";
import { useGameStore } from "../store/gameStore";
import { getVisiblePieceData } from "../utils/fogOfWar";
import { CELL_SIZE } from "./Board";

const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.Sea]: "#1a3a5c",
  [TerrainType.Land]: "#7a6b4e",
  [TerrainType.Island]: "#5a7e2a",
};

interface CellViewProps {
  row: number;
  col: number;
}

export const CellView = memo(function CellView({ row, col }: CellViewProps) {
  const cell = useGameStore((s) => s.grid[row]?.[col]);
  const piece = useGameStore((s) =>
    cell?.pieceId ? s.piecesById[cell.pieceId] : null
  );
  const piecesById = useGameStore((s) => s.piecesById);
  const viewingPlayer = useGameStore((s) => s.viewingPlayer);
  const selectedPieceId = useGameStore((s) => s.selectedPieceId);
  const validMoves = useGameStore((s) => s.validMoves);
  const handleCellTap = useGameStore((s) => s.handleCellTap);

  if (!cell) return null;

  const isSelected = piece && piece.id === selectedPieceId;
  const isValidMove = validMoves.some(
    (m) => m.row === row && m.col === col
  );
  const isAttackTarget = isValidMove && cell.pieceId !== null;

  let pieceImageUri: string | null = null;
  let stackSize = 0;
  if (piece && piece.isAlive) {
    const data = getVisiblePieceData(piece, viewingPlayer, piecesById);
    pieceImageUri = data.imageUri;
    stackSize = data.stackSize;
  }

  const bgColor = TERRAIN_COLORS[cell.terrain];

  return (
    <div
      onClick={() => handleCellTap(row, col)}
      style={{
        position: "absolute",
        left: col * CELL_SIZE,
        top: row * CELL_SIZE,
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: bgColor,
        border: isSelected
          ? "2px solid #fbbf24"
          : isAttackTarget
          ? "2px solid #ef4444"
          : isValidMove
          ? "2px solid #22c55e"
          : "1px solid #333",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {isValidMove && !piece && (
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: "rgba(34, 197, 94, 0.5)",
            position: "absolute",
          }}
        />
      )}
      {pieceImageUri && (
        <img
          src={pieceImageUri}
          alt=""
          draggable={false}
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            objectFit: "contain",
            borderRadius: 4,
          }}
        />
      )}
      {stackSize > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: 8,
            width: 16,
            height: 16,
            fontSize: 10,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {stackSize}
        </div>
      )}
    </div>
  );
});
