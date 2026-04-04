// Re-export all engine modules for convenient access
export { canPlaceUnit, validatePlacement } from './placementValidator';
export { getValidMoves, getValidAttacks, getValidFlagPickups } from './movementValidator';
export { resolveBattle } from './battleResolver';
export type { BattleOutcome } from './battleResolver';
export { getValidLoadTargets, getValidUnloadTargets, getUnloadableItems, canLoadUnit } from './loadingValidator';
export { checkWinCondition } from './winCondition';
