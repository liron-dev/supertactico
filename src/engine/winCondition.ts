import { GameState, getPlayerIslandCells } from '../types/game';
import { Player } from '../types/unit';
import { posEqual } from '../types/board';

/**
 * Check if a player has won the game.
 * A player wins when they have captured the enemy flag
 * and a unit carrying it is on their own island home base.
 */
export function checkWinCondition(state: GameState): Player | null {
  // Check if any unit on an island is carrying the enemy flag
  for (const player of ['yellow', 'blue'] as Player[]) {
    const islandCells = getPlayerIslandCells(player);

    for (const pos of islandCells) {
      const cell = state.board[pos.row][pos.col];
      if (cell.unit?.owner === player && cell.unit.carryingEnemyFlag) {
        return player; // This player wins!
      }
    }
  }

  return null;
}
