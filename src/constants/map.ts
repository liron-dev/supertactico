import { CellTerrain, BoardState } from '../types/game';

const MAP_RAW = [
  'S S S S S S S S S S S S S S S S S S S S',
  'S S S S S S S S L L S S L S S L S S S S',
  'S S S S S L S S L L S S L L L L L L S S',
  'S S S S S L L L L L S L L L L L L L S S',
  'S S S S S S L L L L L L L L L L L S S S',
  'S S I S S S L L L L L L L L L L L S S S',
  'S S I I S S S L L L L L L L L S S S S S',
  'S S I I I S S L L L L L L L L L L S S S',
  'S S S S S S S L L L L L L L L L S S S S',
  'S S S S S S S S S S S S S L L L S S S S',
  'S S S S S S S S S S S S S L L L S S S S',
  'S S S S S S S L L L L L L L L L S S S S',
  'S S I I I S S L L L L L L L L L L S S S',
  'S S I I S S S L L L L L L L L S S S S S',
  'S S I S S S L L L L L L L L L L L S S S',
  'S S S S S S L L L L L L L L L L L S S S',
  'S S S S S L L L L L S L L L L L L L S S',
  'S S S S S L S S L L S S L L L L L L S S',
  'S S S S S S S S L L S S L S S L S S S S',
  'S S S S S S S S S S S S S S S S S S S S',
];

export const BOARD_ROWS = 20;
export const BOARD_COLS = 20;

export function parseMap(): CellTerrain[][] {
  return MAP_RAW.map(row =>
    row.split(' ') as CellTerrain[]
  );
}

export function createInitialBoard(): BoardState {
  const terrain = parseMap();
  return terrain.map(row =>
    row.map(t => ({ terrain: t, piece: null }))
  );
}

// Blue sets up in rows 0-8 (top 9), Yellow in rows 11-19 (bottom 9)
// Rows 9-10 are the middle buffer zone
export function getSetupZone(player: 'yellow' | 'blue'): { startRow: number; endRow: number } {
  if (player === 'blue') return { startRow: 0, endRow: 8 };
  return { startRow: 11, endRow: 19 };
}

export function getIslandCells(player: 'yellow' | 'blue'): { row: number; col: number }[] {
  const terrain = parseMap();
  const zone = getSetupZone(player);
  const cells: { row: number; col: number }[] = [];
  for (let r = zone.startRow; r <= zone.endRow; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (terrain[r][c] === 'I') cells.push({ row: r, col: c });
    }
  }
  return cells;
}
