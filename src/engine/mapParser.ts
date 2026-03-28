import { Cell, TerrainType } from "../types";
import { RAW_MAP, BOARD_ROWS, BOARD_COLS } from "../constants/map";

export function parseMap(): Cell[][] {
  const lines = RAW_MAP.trim().split("\n");
  const grid: Cell[][] = [];

  for (let row = 0; row < BOARD_ROWS; row++) {
    const tokens = lines[row].trim().split(/\s+/);
    const rowCells: Cell[] = [];
    for (let col = 0; col < BOARD_COLS; col++) {
      rowCells.push({
        terrain: tokens[col] as TerrainType,
        pieceId: null,
      });
    }
    grid.push(rowCells);
  }

  return grid;
}

export function isGround(terrain: TerrainType): boolean {
  return terrain === TerrainType.Land || terrain === TerrainType.Island;
}

export function isSea(terrain: TerrainType): boolean {
  return terrain === TerrainType.Sea;
}
