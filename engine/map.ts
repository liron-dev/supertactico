import { TerrainType, Coord, Player } from "./types";
import { BOARD_ROWS, BOARD_COLS } from "./constants";

const MAP_DATA: TerrainType[][] = [
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","L","L","S","S","L","S","S","L","S","S","S","S"],
  ["S","S","S","S","S","L","S","S","L","L","S","S","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","L","L","L","L","L","S","L","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","I","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","I","I","S","S","S","L","L","L","L","L","L","L","L","S","S","S","S","S"],
  ["S","S","I","I","I","S","S","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","L","L","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","L","L","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","S","S","S","S"],
  ["S","S","I","I","I","S","S","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","I","I","S","S","S","L","L","L","L","L","L","L","L","S","S","S","S","S"],
  ["S","S","I","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","S","S","S","S","L","L","L","L","L","L","L","L","L","L","L","S","S","S"],
  ["S","S","S","S","S","L","L","L","L","L","S","L","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","L","S","S","L","L","S","S","L","L","L","L","L","L","S","S"],
  ["S","S","S","S","S","S","S","S","L","L","S","S","L","S","S","L","S","S","S","S"],
  ["S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S"],
];

export function getMap(): TerrainType[][] { return MAP_DATA; }

export function getTerrain(row: number, col: number): TerrainType {
  if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return "S";
  return MAP_DATA[row][col];
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

export function getAdjacentCells(row: number, col: number): Coord[] {
  const dirs: Coord[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return dirs.map(([dr, dc]) => [row + dr, col + dc] as Coord).filter(([r, c]) => isInBounds(r, c));
}

export function isAdjacent(a: Coord, b: Coord): boolean {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export const YELLOW_ISLAND_CELLS: Coord[] = [[5, 2], [6, 2], [6, 3], [7, 2], [7, 3], [7, 4]];
export const BLUE_ISLAND_CELLS: Coord[] = [[12, 2], [12, 3], [12, 4], [13, 2], [13, 3], [14, 2]];

export function getIslandCells(player: Player): Coord[] {
  return player === "yellow" ? YELLOW_ISLAND_CELLS : BLUE_ISLAND_CELLS;
}

export function isIslandCell(row: number, col: number, player: Player): boolean {
  return getIslandCells(player).some(([r, c]) => r === row && c === col);
}

export function getPlacementRows(player: Player): [number, number] {
  return player === "yellow" ? [0, 8] : [11, 19];
}

export function isMarineBoundary(a: Coord, b: Coord): boolean {
  const terrainA = getTerrain(a[0], a[1]);
  const terrainB = getTerrain(b[0], b[1]);
  const isSeaA = terrainA === "S";
  const isSeaB = terrainB === "S";
  const isLandA = terrainA === "L" || terrainA === "I";
  const isLandB = terrainB === "L" || terrainB === "I";
  return (isSeaA && isLandB) || (isLandA && isSeaB);
}
