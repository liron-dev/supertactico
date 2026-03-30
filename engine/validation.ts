import { Cell, Player, Coord } from "./types";
import { getIslandCells, getAdjacentCells } from "./map";
import { BOARD_ROWS, BOARD_COLS } from "./constants";

export function validateIslandSpaces(board: Cell[][], player: Player): boolean {
  const islandCells = getIslandCells(player);
  return islandCells.filter(([r, c]) => board[r][c].unit === null).length >= 3;
}

export function validateFlagPath(board: Cell[][], player: Player): boolean {
  let flagPos: Coord | null = null;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const unit = board[r][c].unit;
      if (unit && unit.name === "Flag" && unit.owner === player) { flagPos = [r, c]; break; }
    }
    if (flagPos) break;
  }
  if (!flagPos) return false;
  const adj = getAdjacentCells(flagPos[0], flagPos[1]);
  return !adj.every(([r, c]) => {
    const unit = board[r][c].unit;
    return unit !== null && (unit.name === "Land mine" || unit.name === "Naval mine");
  });
}

export function validatePlacement(board: Cell[][], player: Player): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!validateIslandSpaces(board, player)) errors.push("You must leave at least 3 empty spaces on your island.");
  if (!validateFlagPath(board, player)) errors.push("Your flag must have a viable path — it cannot be surrounded by mines on all sides.");
  return { valid: errors.length === 0, errors };
}
