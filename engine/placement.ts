import { Cell, UnitName, Player, Coord } from "./types";
import { getUnitDef, BOARD_COLS } from "./constants";
import { getPlacementRows } from "./map";

export function getValidPlacementCells(board: Cell[][], player: Player, unitName: UnitName): Coord[] {
  const def = getUnitDef(unitName);
  const [minRow, maxRow] = getPlacementRows(player);
  const results: Coord[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (board[r][c].unit !== null) continue;
      if (def.startTerrain.includes(board[r][c].terrain)) results.push([r, c]);
    }
  }
  return results;
}
