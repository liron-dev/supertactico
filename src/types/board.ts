import { Player, UnitInstance } from './unit';

export type TerrainType = 'S' | 'L' | 'I';

export interface Position {
  row: number;
  col: number;
}

export interface BoardCell {
  terrain: TerrainType;
  unit: UnitInstance | null;
  droppedFlag: Player | null; // Owner of the flag that was dropped here
}

export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function isLandOrIsland(terrain: TerrainType): boolean {
  return terrain === 'L' || terrain === 'I';
}

export function isSea(terrain: TerrainType): boolean {
  return terrain === 'S';
}
