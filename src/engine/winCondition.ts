import { GameState, Player, TerrainType } from "../types";

export function checkWinCondition(state: GameState): Player | null {
  for (const piece of Object.values(state.piecesById)) {
    if (!piece.isAlive || !piece.isCarryingEnemyFlag) continue;

    const cell = state.grid[piece.row][piece.col];
    if (cell.terrain !== TerrainType.Island) continue;

    if (isOwnIsland(piece.owner, piece.row)) {
      return piece.owner;
    }
  }
  return null;
}

function isOwnIsland(player: Player, row: number): boolean {
  // Blue's islands: rows 5-7, Yellow's islands: rows 12-14
  if (player === Player.Blue) return row >= 5 && row <= 7;
  if (player === Player.Yellow) return row >= 12 && row <= 14;
  return false;
}
