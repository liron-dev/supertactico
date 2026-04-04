import { GameState, GamePhase, getOpponent, getPlayerIslandCells, getPlayerRows } from '../types/game';
import { BoardCell, Position, posKey, posEqual } from '../types/board';
import { Player, UnitInstance, emptyCargo, totalCargoCount } from '../types/unit';
import { GameAction } from '../types/actions';
import { TERRAIN_MAP } from '../constants/map';
import { createAllUnits, TOTAL_UNITS_PER_PLAYER, getUnitDefinition } from '../constants/units';
import {
  canPlaceUnit,
  validatePlacement,
  getValidMoves,
  getValidAttacks,
  resolveBattle,
  getValidLoadTargets,
  getValidUnloadTargets,
  getUnloadableItems,
  checkWinCondition,
  getValidFlagPickups,
} from '../engine/GameEngine';

export function createInitialState(): GameState {
  const board: BoardCell[][] = TERRAIN_MAP.map(row =>
    row.map(terrain => ({ terrain, unit: null, droppedFlag: null }))
  );

  return {
    board,
    phase: { type: 'placement', player: 'yellow' },
    unplacedUnits: {
      yellow: createAllUnits('yellow'),
      blue: createAllUnits('blue'),
    },
    defeated: {
      yellow: [],
      blue: [],
    },
    selectedCell: null,
    selectedUnplacedUnit: null,
    moveHistory: {},
    flagOrigin: {
      yellow: null,
      blue: null,
    },
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_UNPLACED_UNIT':
      return { ...state, selectedUnplacedUnit: action.unit, selectedCell: null };

    case 'PLACE_UNIT':
      return handlePlaceUnit(state, action.position);

    case 'REMOVE_PLACED_UNIT':
      return handleRemovePlacedUnit(state, action.position);

    case 'FINISH_PLACEMENT':
      return handleFinishPlacement(state);

    case 'CONFIRM_TRANSITION':
      return handleConfirmTransition(state);

    case 'SELECT_CELL':
      return handleSelectCell(state, action.position);

    case 'DESELECT':
      return { ...state, selectedCell: null };

    case 'MOVE_UNIT':
      return handleMoveUnit(state, action.to);

    case 'ATTACK':
      return handleAttack(state, action.to);

    case 'LOAD_UNIT':
      return handleLoadUnit(state, action.carrierPosition);

    case 'UNLOAD_UNIT':
      return handleUnloadUnit(state, action.unitId, action.targetPosition);

    case 'END_TURN':
      return handleEndTurn(state);

    case 'RESOLVE_BATTLE':
      return handleResolveBattle(state);

    case 'LIFE_RAFT_ESCAPE':
      return handleLifeRaftEscape(state, action.survivorIds, action.targetPosition);

    case 'SKIP_LIFE_RAFT_ESCAPE':
      return handleSkipLifeRaftEscape(state);

    case 'REPLACE_FLAG':
      return handleReplaceFlag(state, action.position);

    case 'RESET_GAME':
      return createInitialState();

    default:
      return state;
  }
}

function handlePlaceUnit(state: GameState, position: Position): GameState {
  if (state.phase.type !== 'placement') return state;
  if (!state.selectedUnplacedUnit) return state;

  const unit = state.selectedUnplacedUnit;
  if (!canPlaceUnit(state, unit, position)) return state;

  const newBoard = cloneBoard(state.board);
  newBoard[position.row][position.col] = {
    ...newBoard[position.row][position.col],
    unit,
  };

  const player = state.phase.player;
  const newUnplaced = state.unplacedUnits[player].filter(u => u.id !== unit.id);

  // Track flag placement position
  const flagOrigin = { ...state.flagOrigin };
  if (unit.type === 'Flag') {
    flagOrigin[player] = position;
  }

  return {
    ...state,
    board: newBoard,
    unplacedUnits: { ...state.unplacedUnits, [player]: newUnplaced },
    selectedUnplacedUnit: null,
    flagOrigin,
  };
}

function handleRemovePlacedUnit(state: GameState, position: Position): GameState {
  if (state.phase.type !== 'placement') return state;

  const cell = state.board[position.row][position.col];
  if (!cell.unit) return state;

  const player = state.phase.player;
  if (cell.unit.owner !== player) return state;

  const unit = cell.unit;
  const newBoard = cloneBoard(state.board);
  newBoard[position.row][position.col] = {
    ...newBoard[position.row][position.col],
    unit: null,
  };

  const newUnplaced = [...state.unplacedUnits[player], unit];

  // Clear flag origin if removing the flag
  const flagOrigin = { ...state.flagOrigin };
  if (unit.type === 'Flag') {
    flagOrigin[player] = null;
  }

  return {
    ...state,
    board: newBoard,
    unplacedUnits: { ...state.unplacedUnits, [player]: newUnplaced },
    selectedCell: null,
    flagOrigin,
  };
}

function handleFinishPlacement(state: GameState): GameState {
  if (state.phase.type !== 'placement') return state;

  const player = state.phase.player;

  // All units must be placed
  if (state.unplacedUnits[player].length > 0) return state;

  // Validate placement
  const validation = validatePlacement(state.board, player);
  if (!validation.valid) return state;

  if (player === 'yellow') {
    // Transition to blue's placement
    return {
      ...state,
      phase: { type: 'transition', nextPlayer: 'blue', nextPhase: 'placement' },
      selectedCell: null,
      selectedUnplacedUnit: null,
    };
  } else {
    // Both players done, start gameplay
    return {
      ...state,
      phase: { type: 'transition', nextPlayer: 'yellow', nextPhase: 'gameplay' },
      selectedCell: null,
      selectedUnplacedUnit: null,
    };
  }
}

function handleConfirmTransition(state: GameState): GameState {
  if (state.phase.type !== 'transition') return state;

  const { nextPlayer, nextPhase } = state.phase;

  if (nextPhase === 'placement') {
    return {
      ...state,
      phase: { type: 'placement', player: nextPlayer },
    };
  } else {
    return {
      ...state,
      phase: {
        type: 'gameplay',
        currentTurn: nextPlayer,
        turnNumber: state.phase.turnNumber ?? 1,
        actionTaken: false,
      },
    };
  }
}

function handleSelectCell(state: GameState, position: Position): GameState {
  if (state.phase.type !== 'gameplay') return state;

  const phase = state.phase;
  const cell = state.board[position.row][position.col];

  // If we already have a selected cell, this might be a move/attack/load action
  if (state.selectedCell) {
    const selectedUnit = state.board[state.selectedCell.row][state.selectedCell.col].unit;
    if (!selectedUnit || selectedUnit.owner !== phase.currentTurn) {
      return { ...state, selectedCell: null };
    }

    // Check if clicking on the same cell (deselect)
    if (posEqual(state.selectedCell, position)) {
      return { ...state, selectedCell: null };
    }

    // Check valid moves, attacks, loads, and flag pickups
    const validMoves = getValidMoves(state, state.selectedCell);
    const validAttacks = getValidAttacks(state, state.selectedCell);
    const validLoads = getValidLoadTargets(state, state.selectedCell);
    const validPickups = getValidFlagPickups(state, state.selectedCell);

    // Is this a valid move target?
    if (validMoves.some(m => posEqual(m, position))) {
      return handleMoveUnit(state, position);
    }

    // Is this a valid attack target?
    if (validAttacks.some(a => posEqual(a, position))) {
      return handleAttack(state, position);
    }

    // Is this a valid load target?
    if (validLoads.some(l => posEqual(l, position))) {
      return handleLoadUnit(state, position);
    }

    // Is this a valid flag pickup?
    if (validPickups.some(p => posEqual(p, position))) {
      return handleFlagPickup(state, position);
    }

    // If clicking on another of our units, select that instead
    if (cell.unit?.owner === phase.currentTurn) {
      return { ...state, selectedCell: position };
    }

    // Otherwise deselect
    return { ...state, selectedCell: null };
  }

  // No current selection - select if it's our unit
  if (cell.unit?.owner === phase.currentTurn) {
    return { ...state, selectedCell: position };
  }

  return state;
}

function handleMoveUnit(state: GameState, to: Position): GameState {
  if (state.phase.type !== 'gameplay' || !state.selectedCell) return state;
  if (state.phase.actionTaken) return state;

  const from = state.selectedCell;
  const unit = state.board[from.row][from.col].unit;
  if (!unit) return state;

  const validMoves = getValidMoves(state, from);
  if (!validMoves.some(m => posEqual(m, to))) return state;

  const newBoard = cloneBoard(state.board);
  newBoard[from.row][from.col] = { ...newBoard[from.row][from.col], unit: null };
  newBoard[to.row][to.col] = { ...newBoard[to.row][to.col], unit };

  // Update move history for back-and-forth tracking
  const history = { ...state.moveHistory };
  const unitHistory = [...(history[unit.id] || []), { from, to }];
  // Keep only last 4 moves
  history[unit.id] = unitHistory.slice(-4);

  const newState: GameState = {
    ...state,
    board: newBoard,
    selectedCell: null,
    moveHistory: history,
    phase: { ...state.phase, actionTaken: true },
  };

  // Check win condition
  const winner = checkWinCondition(newState);
  if (winner) {
    return { ...newState, phase: { type: 'gameOver', winner } };
  }

  return newState;
}

function handleFlagPickup(state: GameState, to: Position): GameState {
  if (state.phase.type !== 'gameplay' || !state.selectedCell) return state;
  if (state.phase.actionTaken) return state;

  const from = state.selectedCell;
  const unit = state.board[from.row][from.col].unit;
  if (!unit) return state;

  const newBoard = cloneBoard(state.board);
  const updatedUnit = { ...unit, carryingEnemyFlag: true };
  newBoard[from.row][from.col] = { ...newBoard[from.row][from.col], unit: null };
  newBoard[to.row][to.col] = { ...newBoard[to.row][to.col], unit: updatedUnit, droppedFlag: null };

  const history = { ...state.moveHistory };
  const unitHistory = [...(history[unit.id] || []), { from, to }];
  history[unit.id] = unitHistory.slice(-4);

  const newState: GameState = {
    ...state,
    board: newBoard,
    selectedCell: null,
    moveHistory: history,
    phase: { ...state.phase, actionTaken: true },
  };

  const winner = checkWinCondition(newState);
  if (winner) {
    return { ...newState, phase: { type: 'gameOver', winner } };
  }

  return newState;
}

function handleAttack(state: GameState, to: Position): GameState {
  if (state.phase.type !== 'gameplay' || !state.selectedCell) return state;
  if (state.phase.actionTaken) return state;

  const from = state.selectedCell;
  const attacker = state.board[from.row][from.col].unit;
  const defender = state.board[to.row][to.col].unit;
  if (!attacker || !defender) return state;

  // Transition to battle phase
  return {
    ...state,
    selectedCell: null,
    phase: {
      type: 'battle',
      attacker: { ...attacker, revealed: true },
      defender: { ...defender, revealed: true },
      attackerPos: from,
      defenderPos: to,
      previousPhase: {
        currentTurn: state.phase.currentTurn,
        turnNumber: state.phase.turnNumber,
      },
    },
  };
}

function handleResolveBattle(state: GameState): GameState {
  if (state.phase.type !== 'battle') return state;

  const { attacker, defender, attackerPos, defenderPos, previousPhase } = state.phase;
  const outcome = resolveBattle(attacker, defender, attackerPos, defenderPos, state.board);

  const newBoard = cloneBoard(state.board);
  const newDefeated = {
    yellow: [...state.defeated.yellow],
    blue: [...state.defeated.blue],
  };

  // Remove both units from the board initially
  newBoard[attackerPos.row][attackerPos.col] = {
    ...newBoard[attackerPos.row][attackerPos.col],
    unit: null,
  };
  newBoard[defenderPos.row][defenderPos.col] = {
    ...newBoard[defenderPos.row][defenderPos.col],
    unit: null,
  };

  // Add destroyed cargo to defeated list
  for (const cargo of outcome.cargoDestroyed) {
    newDefeated[cargo.owner].push(cargo);
  }

  if (outcome.result === 'attacker_wins') {
    // Attacker wins
    newDefeated[defender.owner].push(defender);

    if (outcome.defenderIsMine) {
      // Mine stays in place, attacker is destroyed
      newDefeated[attacker.owner].push(attacker);
      newBoard[defenderPos.row][defenderPos.col] = {
        ...newBoard[defenderPos.row][defenderPos.col],
        unit: defender, // Mine stays
      };
    } else if (outcome.flagCaptured) {
      // Attacker captures the flag, moves to defender's position
      const updatedAttacker = { ...attacker, carryingEnemyFlag: true };
      newBoard[defenderPos.row][defenderPos.col] = {
        ...newBoard[defenderPos.row][defenderPos.col],
        unit: updatedAttacker,
      };
    } else {
      // Normal win: attacker moves to defender's position
      newBoard[defenderPos.row][defenderPos.col] = {
        ...newBoard[defenderPos.row][defenderPos.col],
        unit: attacker,
      };
    }
  } else if (outcome.result === 'defender_wins') {
    // Defender wins
    newDefeated[attacker.owner].push(attacker);

    if (outcome.defenderIsMine) {
      // Mine stays, defender (mine) remains at its position
      newBoard[defenderPos.row][defenderPos.col] = {
        ...newBoard[defenderPos.row][defenderPos.col],
        unit: defender,
      };
    } else {
      // Defender stays at its position
      newBoard[defenderPos.row][defenderPos.col] = {
        ...newBoard[defenderPos.row][defenderPos.col],
        unit: defender,
      };
    }
  } else {
    // Both die
    newDefeated[attacker.owner].push(attacker);
    newDefeated[defender.owner].push(defender);
  }

  // Handle flag drop
  if (outcome.flagDroppedAt) {
    newBoard[outcome.flagDroppedAt.row][outcome.flagDroppedAt.col] = {
      ...newBoard[outcome.flagDroppedAt.row][outcome.flagDroppedAt.col],
      droppedFlag: outcome.flagDroppedOwner,
    };
  }

  let newState: GameState = {
    ...state,
    board: newBoard,
    defeated: newDefeated,
  };

  // Check for life raft escape
  if (outcome.lifeRaftEscape) {
    newState.phase = {
      type: 'lifeRaftEscape',
      raft: outcome.lifeRaftEscape.raft,
      availableSoldiers: outcome.lifeRaftEscape.availableSoldiers,
      maxEscapees: outcome.lifeRaftEscape.maxEscapees,
      adjacentSeaCells: outcome.lifeRaftEscape.adjacentSeaCells,
      previousPhase,
    };
    return newState;
  }

  // Check for flag return
  if (outcome.flagReturnedTo) {
    newState.phase = {
      type: 'flagReplacement',
      player: outcome.flagReturnedTo,
      previousPhase,
    };
    return newState;
  }

  // Check win condition
  const winner = checkWinCondition(newState);
  if (winner) {
    newState.phase = { type: 'gameOver', winner };
    return newState;
  }

  // Return to gameplay with action taken
  newState.phase = {
    type: 'gameplay',
    currentTurn: previousPhase.currentTurn,
    turnNumber: previousPhase.turnNumber,
    actionTaken: true,
  };

  return newState;
}

function handleLoadUnit(state: GameState, carrierPosition: Position): GameState {
  if (state.phase.type !== 'gameplay' || !state.selectedCell) return state;
  if (state.phase.actionTaken) return state;

  const unitPos = state.selectedCell;
  const unit = state.board[unitPos.row][unitPos.col].unit;
  const carrier = state.board[carrierPosition.row][carrierPosition.col].unit;
  if (!unit || !carrier) return state;

  const newBoard = cloneBoard(state.board);
  const newCarrier = { ...carrier, cargo: { ...carrier.cargo } };

  const unitDef = getUnitDefinition(unit.type);

  if (unitDef.category === 'foot') {
    newCarrier.cargo.soldiers = [...newCarrier.cargo.soldiers, unit];
  } else if (unitDef.category === 'immobile' && (unit.type === 'Land mine' || unit.type === 'Naval mine')) {
    newCarrier.cargo.mines = [...newCarrier.cargo.mines, unit];
  } else if (unitDef.category === 'naval') {
    newCarrier.cargo.ship = unit;
  } else if (unitDef.category === 'aircraft') {
    newCarrier.cargo.plane = unit;
  }

  // Remove unit from its cell
  newBoard[unitPos.row][unitPos.col] = { ...newBoard[unitPos.row][unitPos.col], unit: null };
  // Update carrier
  newBoard[carrierPosition.row][carrierPosition.col] = {
    ...newBoard[carrierPosition.row][carrierPosition.col],
    unit: newCarrier,
  };

  return {
    ...state,
    board: newBoard,
    selectedCell: null,
    phase: { ...state.phase, actionTaken: true },
  };
}

function handleUnloadUnit(state: GameState, unitId: string, targetPosition: Position): GameState {
  if (state.phase.type !== 'gameplay' || !state.selectedCell) return state;
  if (state.phase.actionTaken) return state;

  const carrierPos = state.selectedCell;
  const carrier = state.board[carrierPos.row][carrierPos.col].unit;
  if (!carrier) return state;

  // Find the unit in cargo
  let unloadedUnit: UnitInstance | null = null;
  const newCarrier = { ...carrier, cargo: { ...carrier.cargo } };

  const soldierIdx = newCarrier.cargo.soldiers.findIndex(s => s.id === unitId);
  if (soldierIdx >= 0) {
    unloadedUnit = newCarrier.cargo.soldiers[soldierIdx];
    newCarrier.cargo.soldiers = newCarrier.cargo.soldiers.filter((_, i) => i !== soldierIdx);
  }

  const mineIdx = newCarrier.cargo.mines.findIndex(m => m.id === unitId);
  if (!unloadedUnit && mineIdx >= 0) {
    unloadedUnit = newCarrier.cargo.mines[mineIdx];
    newCarrier.cargo.mines = newCarrier.cargo.mines.filter((_, i) => i !== mineIdx);
  }

  if (!unloadedUnit && newCarrier.cargo.ship?.id === unitId) {
    unloadedUnit = newCarrier.cargo.ship;
    newCarrier.cargo.ship = null;
  }

  if (!unloadedUnit && newCarrier.cargo.plane?.id === unitId) {
    unloadedUnit = newCarrier.cargo.plane;
    newCarrier.cargo.plane = null;
  }

  if (!unloadedUnit) return state;

  // Validate the target
  const validTargets = getValidUnloadTargets(state, carrierPos, unloadedUnit);
  if (!validTargets.some(t => posEqual(t, targetPosition))) return state;

  const newBoard = cloneBoard(state.board);
  newBoard[carrierPos.row][carrierPos.col] = {
    ...newBoard[carrierPos.row][carrierPos.col],
    unit: newCarrier,
  };
  newBoard[targetPosition.row][targetPosition.col] = {
    ...newBoard[targetPosition.row][targetPosition.col],
    unit: unloadedUnit,
  };

  return {
    ...state,
    board: newBoard,
    selectedCell: null,
    phase: { ...state.phase, actionTaken: true },
  };
}

function handleEndTurn(state: GameState): GameState {
  if (state.phase.type !== 'gameplay') return state;
  if (!state.phase.actionTaken) return state;

  const nextPlayer = getOpponent(state.phase.currentTurn);
  // Increment turn number after both players have gone (after blue's turn)
  const nextTurnNumber = state.phase.currentTurn === 'blue'
    ? state.phase.turnNumber + 1
    : state.phase.turnNumber;

  return {
    ...state,
    selectedCell: null,
    phase: {
      type: 'transition',
      nextPlayer,
      nextPhase: 'gameplay',
      turnNumber: nextTurnNumber,
    },
  };
}

function handleLifeRaftEscape(
  state: GameState,
  survivorIds: string[],
  targetPosition: Position,
): GameState {
  if (state.phase.type !== 'lifeRaftEscape') return state;

  const { raft, availableSoldiers, maxEscapees, previousPhase } = state.phase;

  // Validate survivors
  const survivors = availableSoldiers.filter(s => survivorIds.includes(s.id));
  if (survivors.length > maxEscapees) return state;

  // Create the life raft with survivors loaded
  const escapedRaft: UnitInstance = {
    ...raft,
    cargo: {
      ...emptyCargo(),
      soldiers: survivors,
    },
  };

  const newBoard = cloneBoard(state.board);
  newBoard[targetPosition.row][targetPosition.col] = {
    ...newBoard[targetPosition.row][targetPosition.col],
    unit: escapedRaft,
  };

  // Non-escaped soldiers are destroyed
  const notEscaped = availableSoldiers.filter(s => !survivorIds.includes(s.id));
  const newDefeated = { ...state.defeated };
  newDefeated[raft.owner] = [...newDefeated[raft.owner], ...notEscaped];

  const newState: GameState = {
    ...state,
    board: newBoard,
    defeated: newDefeated,
    phase: {
      type: 'gameplay',
      currentTurn: previousPhase.currentTurn,
      turnNumber: previousPhase.turnNumber,
      actionTaken: true,
    },
  };

  const winner = checkWinCondition(newState);
  if (winner) {
    return { ...newState, phase: { type: 'gameOver', winner } };
  }

  return newState;
}

function handleSkipLifeRaftEscape(state: GameState): GameState {
  if (state.phase.type !== 'lifeRaftEscape') return state;

  const { availableSoldiers, raft, previousPhase } = state.phase;

  // All soldiers destroyed
  const newDefeated = { ...state.defeated };
  newDefeated[raft.owner] = [...newDefeated[raft.owner], ...availableSoldiers, raft];

  return {
    ...state,
    defeated: newDefeated,
    phase: {
      type: 'gameplay',
      currentTurn: previousPhase.currentTurn,
      turnNumber: previousPhase.turnNumber,
      actionTaken: true,
    },
  };
}

function handleReplaceFlag(state: GameState, position: Position): GameState {
  if (state.phase.type !== 'flagReplacement') return state;

  const { player, previousPhase } = state.phase;
  const cell = state.board[position.row][position.col];

  // Must be empty land cell (not island)
  if (cell.unit || cell.terrain !== 'L') return state;

  const newBoard = cloneBoard(state.board);
  const flagUnit: UnitInstance = {
    id: `${player}-Flag-replaced`,
    type: 'Flag',
    owner: player,
    category: 'immobile',
    rank: null,
    cargo: emptyCargo(),
    carryingEnemyFlag: false,
    revealed: false,
  };

  newBoard[position.row][position.col] = {
    ...newBoard[position.row][position.col],
    unit: flagUnit,
  };

  return {
    ...state,
    board: newBoard,
    phase: {
      type: 'gameplay',
      currentTurn: previousPhase.currentTurn,
      turnNumber: previousPhase.turnNumber,
      actionTaken: true,
    },
  };
}

function cloneBoard(board: BoardCell[][]): BoardCell[][] {
  return board.map(row => row.map(cell => ({ ...cell })));
}
