import { Cell, Player } from "./types";
import { isFootUnit } from "./constants";
import { getIslandCells } from "./map";

export function checkWinCondition(board: Cell[][], player: Player): boolean {
  const islandCells = getIslandCells(player);
  for (const [r, c] of islandCells) {
    const unit = board[r][c].unit;
    if (unit && unit.owner === player && unit.carryingFlag && isFootUnit(unit.name)) return true;
  }
  return false;
}
