import { Position } from './board';
import { Player, UnitInstance } from './unit';

export type GameAction =
  // Placement phase
  | { type: 'SELECT_UNPLACED_UNIT'; unit: UnitInstance }
  | { type: 'PLACE_UNIT'; position: Position }
  | { type: 'REMOVE_PLACED_UNIT'; position: Position }
  | { type: 'FINISH_PLACEMENT' }
  // Transition
  | { type: 'CONFIRM_TRANSITION' }
  // Gameplay
  | { type: 'SELECT_CELL'; position: Position }
  | { type: 'DESELECT' }
  | { type: 'MOVE_UNIT'; to: Position }
  | { type: 'ATTACK'; to: Position }
  | { type: 'LOAD_UNIT'; carrierPosition: Position }
  | { type: 'UNLOAD_UNIT'; unitId: string; targetPosition: Position }
  | { type: 'END_TURN' }
  // Battle resolution
  | { type: 'RESOLVE_BATTLE' }
  // Life raft escape
  | { type: 'LIFE_RAFT_ESCAPE'; survivorIds: string[]; targetPosition: Position }
  | { type: 'SKIP_LIFE_RAFT_ESCAPE' }
  // Flag replacement
  | { type: 'REPLACE_FLAG'; position: Position }
  // Game
  | { type: 'RESET_GAME' };
