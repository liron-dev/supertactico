import {
  GameState,
  GameAction,
  GamePhase,
  Player,
  Position,
  Piece,
  MoveRecord,
} from '../types/game';
import { createInitialBoard } from '../constants/map';
import { getInitialPiecesToPlace, canCaptureFlag, isMobileUnit } from '../constants/units';
import { isValidPlacement, validateSetup } from '../engine/setup';
import { getValidMoves, getValidAttacks } from '../engine/movement';
import { resolveBattle } from '../engine/battle';
import { getUnloadTargets, canLoad } from '../engine/transport';
import { checkVictory } from '../engine/victory';
import { cloneBoard, clonePiece, getAdjacent, getPiece, getTerrain, isSeaTerrain, hasEnemyFlagInCargo } from '../utils/boardHelpers';

let pieceIdCounter = 0;

function generatePieceId(player: Player, unitName: string): string {
  pieceIdCounter++;
  return `${player}-${unitName.replace(/\s+/g, '_')}-${pieceIdCounter}`;
}

export function createInitialState(): GameState {
  pieceIdCounter = 0;
  return {
    phase: 'setup-yellow',
    board: createInitialBoard(),
    currentPlayer: 'yellow',
    turnNumber: 0,
    selectedPosition: null,
    selectedCargoIndex: null,
    actionMode: null,
    pendingSetup: {
      yellow: getInitialPiecesToPlace(),
      blue: getInitialPiecesToPlace(),
    },
    selectedSetupPiece: null,
    capturedPieces: { yellow: [], blue: [] },
    moveHistory: [],
    winner: null,
    lifeRaftEscape: null,
    flagReturn: null,
    lastBattle: null,
    showBattle: false,
    setupError: null,
    flagInitialPositions: { yellow: null, blue: null },
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_SETUP_PIECE':
      return { ...state, selectedSetupPiece: action.index, setupError: null };

    case 'PLACE_PIECE':
      return handlePlacePiece(state, action.position);

    case 'REMOVE_PIECE':
      return handleRemovePiece(state, action.position);

    case 'CONFIRM_SETUP':
      return handleConfirmSetup(state);

    case 'HANDOFF_COMPLETE':
      return handleHandoffComplete(state);

    case 'SELECT_CELL':
      return handleSelectCell(state, action.position);

    case 'DESELECT':
      return {
        ...state,
        selectedPosition: null,
        selectedCargoIndex: null,
        actionMode: null,
      };

    case 'EXECUTE_MOVE':
      return handleExecuteMove(state, action.to);

    case 'EXECUTE_ATTACK':
      return handleExecuteAttack(state, action.target);

    case 'EXECUTE_LOAD':
      return handleExecuteLoad(state, action.from, action.onto);

    case 'SELECT_CARGO':
      return { ...state, selectedCargoIndex: action.cargoIndex, actionMode: 'unload' };

    case 'EXECUTE_UNLOAD':
      return handleExecuteUnload(state, action.to);

    case 'DISMISS_BATTLE':
      return handleDismissBattle(state);

    case 'LIFE_RAFT_ESCAPE':
      return handleLifeRaftEscape(state, action.to);

    case 'SKIP_LIFE_RAFT_ESCAPE':
      return handleSkipLifeRaftEscape(state);

    case 'PLACE_RETURNED_FLAG':
      return handlePlaceReturnedFlag(state, action.position);

    case 'END_TURN':
      return handleEndTurn(state);

    case 'RESET_GAME':
      return createInitialState();

    default:
      return state;
  }
}

function handlePlacePiece(state: GameState, position: Position): GameState {
  if (state.selectedSetupPiece === null) return state;

  const player = state.currentPlayer;
  const pending = state.pendingSetup[player];
  const pieceInfo = pending[state.selectedSetupPiece];
  if (!pieceInfo || pieceInfo.count <= 0) return state;

  if (!isValidPlacement(state.board, pieceInfo.unitName, position, player)) {
    return { ...state, setupError: 'Invalid placement for this unit type.' };
  }

  const board = cloneBoard(state.board);
  const newPiece: Piece = {
    id: generatePieceId(player, pieceInfo.unitName),
    unitName: pieceInfo.unitName,
    player,
    carryingFlag: false,
    cargo: [],
  };
  board[position.row][position.col].piece = newPiece;

  const newPending = pending.map((p, i) =>
    i === state.selectedSetupPiece ? { ...p, count: p.count - 1 } : p
  );

  // Track flag position
  const flagPositions = { ...state.flagInitialPositions };
  if (pieceInfo.unitName === 'Flag') {
    flagPositions[player] = position;
  }

  // Auto-deselect if count reaches 0
  const newSelectedSetupPiece =
    newPending[state.selectedSetupPiece].count <= 0 ? null : state.selectedSetupPiece;

  return {
    ...state,
    board,
    pendingSetup: { ...state.pendingSetup, [player]: newPending },
    selectedSetupPiece: newSelectedSetupPiece,
    setupError: null,
    flagInitialPositions: flagPositions,
  };
}

function handleRemovePiece(state: GameState, position: Position): GameState {
  const player = state.currentPlayer;
  const piece = state.board[position.row][position.col].piece;
  if (!piece || piece.player !== player) return state;

  const board = cloneBoard(state.board);
  board[position.row][position.col].piece = null;

  // Add piece back to pending
  const pending = state.pendingSetup[player].map(p =>
    p.unitName === piece.unitName ? { ...p, count: p.count + 1 } : p
  );

  const flagPositions = { ...state.flagInitialPositions };
  if (piece.unitName === 'Flag') {
    flagPositions[player] = null;
  }

  return {
    ...state,
    board,
    pendingSetup: { ...state.pendingSetup, [player]: pending },
    setupError: null,
    flagInitialPositions: flagPositions,
  };
}

function handleConfirmSetup(state: GameState): GameState {
  const player = state.currentPlayer;

  // Check all pieces are placed
  const remaining = state.pendingSetup[player].reduce((sum, p) => sum + p.count, 0);
  if (remaining > 0) {
    return { ...state, setupError: `You still have ${remaining} pieces to place.` };
  }

  // Validate setup rules
  const validation = validateSetup(state.board, player);
  if (!validation.valid) {
    return { ...state, setupError: validation.reason || 'Invalid setup.' };
  }

  if (state.phase === 'setup-yellow') {
    return {
      ...state,
      phase: 'handoff-to-blue',
      selectedSetupPiece: null,
      setupError: null,
    };
  } else {
    // Blue finished setup, start the game
    return {
      ...state,
      phase: 'handoff-to-yellow',
      currentPlayer: 'yellow',
      turnNumber: 1,
      selectedSetupPiece: null,
      setupError: null,
    };
  }
}

function handleHandoffComplete(state: GameState): GameState {
  if (state.phase === 'handoff-to-blue') {
    if (state.turnNumber === 0) {
      // Setup handoff: yellow finished, now blue sets up
      return { ...state, phase: 'setup-blue', currentPlayer: 'blue', selectedSetupPiece: null };
    }
    // Gameplay handoff: switch to blue's turn
    return { ...state, phase: 'play', currentPlayer: 'blue' };
  }
  if (state.phase === 'handoff-to-yellow') {
    // Gameplay: switch to yellow, increment turn number (new round)
    return {
      ...state,
      phase: 'play',
      currentPlayer: 'yellow',
      turnNumber: state.turnNumber + 1,
    };
  }
  return { ...state, phase: 'play' };
}

function handleSelectCell(state: GameState, position: Position): GameState {
  if (state.phase !== 'play') return state;

  const piece = state.board[position.row][position.col].piece;

  // If no piece selected yet, select this one (must be current player's)
  if (!state.selectedPosition) {
    if (!piece || piece.player !== state.currentPlayer) return state;
    if (!isMobileUnit(piece.unitName) && piece.cargo.length === 0) {
      // Can't select immobile units without cargo (mines, flags can't act)
      // But transports with cargo can unload
      return state;
    }
    return {
      ...state,
      selectedPosition: position,
      selectedCargoIndex: null,
      actionMode: null,
    };
  }

  // A piece is already selected
  const selectedPiece = getPiece(state.board, state.selectedPosition);
  if (!selectedPiece) return { ...state, selectedPosition: null, actionMode: null };

  // Tapping the same cell deselects
  if (state.selectedPosition.row === position.row && state.selectedPosition.col === position.col) {
    return { ...state, selectedPosition: null, selectedCargoIndex: null, actionMode: null };
  }

  // Tapping another friendly piece - switch selection
  if (piece && piece.player === state.currentPlayer) {
    // Check if this is a load action (friendly piece adjacent to selected transport)
    if (state.actionMode === 'load') {
      // Try to load the piece at position onto the selected transport
      return handleExecuteLoad(state, position, state.selectedPosition);
    }
    return {
      ...state,
      selectedPosition: position,
      selectedCargoIndex: null,
      actionMode: null,
    };
  }

  // Tapping an empty cell - try to move
  if (!piece) {
    return handleExecuteMove(state, position);
  }

  // Tapping an enemy cell - try to attack
  if (piece && piece.player !== state.currentPlayer) {
    return handleExecuteAttack(state, position);
  }

  return state;
}

function handleExecuteMove(state: GameState, to: Position): GameState {
  if (!state.selectedPosition) return state;

  const board = cloneBoard(state.board);
  const from = state.selectedPosition;
  const piece = board[from.row][from.col].piece;
  if (!piece || piece.player !== state.currentPlayer) return state;

  const validMoves = getValidMoves(board, from, state.moveHistory);
  const isValid = validMoves.some(m => m.row === to.row && m.col === to.col);
  if (!isValid) return state;

  // Execute move
  board[to.row][to.col].piece = piece;
  board[from.row][from.col].piece = null;

  const moveRecord: MoveRecord = { pieceId: piece.id, from, to };

  // Check victory
  const winner = checkVictory(board);

  return {
    ...state,
    board,
    moveHistory: [...state.moveHistory, moveRecord],
    selectedPosition: null,
    selectedCargoIndex: null,
    actionMode: null,
    winner,
    phase: winner ? 'victory' : handoffPhase(state.currentPlayer),
  };
}

function handleExecuteAttack(state: GameState, target: Position): GameState {
  if (!state.selectedPosition) return state;

  const board = cloneBoard(state.board);
  const from = state.selectedPosition;
  const attacker = board[from.row][from.col].piece;
  const defender = board[target.row][target.col].piece;
  if (!attacker || !defender) return state;

  const validAttacks = getValidAttacks(board, from);
  const isValid = validAttacks.some(a => a.row === target.row && a.col === target.col);
  if (!isValid) return state;

  const battleResult = resolveBattle(attacker, defender);

  // Apply battle result to board
  const fromTerrain = getTerrain(board, from);
  const targetTerrain = getTerrain(board, target);

  if (battleResult.winner === 'attacker') {
    // Check flag capture
    if (battleResult.flagCaptured && canCaptureFlag(attacker.unitName)) {
      attacker.carryingFlag = true;
    }

    // Check if defender was carrying flag (flag drops)
    if (defender.carryingFlag) {
      // Flag stays on the defender's cell, attacker stays on their cell
      board[from.row][from.col].piece = null;
      board[target.row][target.col].piece = attacker;
      // Actually, when defender carrying flag is defeated on land,
      // flag remains on vacated space and winner stays where they are
      if (!isSeaTerrain(targetTerrain)) {
        board[target.row][target.col].piece = createFlagPiece(defender.player === 'yellow' ? 'blue' : 'yellow');
        board[from.row][from.col].piece = attacker;
      }
    } else if (battleResult.mineStays) {
      // Mine stays, defeated unit removed, mine doesn't move
      board[from.row][from.col].piece = null;
      // Mine (attacker) stays at from... wait, attacker is the one attacking.
      // If attacker is a mine... mines are immobile so they can't attack.
      // This case shouldn't happen for attacker. Mine stays only applies to defender mines.
      // Actually let me re-check: mineStays means the mine won and stays in place.
      // Since mines are immobile, only a defender can be a mine.
      // So this shouldn't happen.
      board[target.row][target.col].piece = attacker;
    } else {
      // Normal: attacker moves to defender's cell
      board[from.row][from.col].piece = null;
      board[target.row][target.col].piece = attacker;
    }

    // Handle life raft escape from defeated defender
    let lifeRaftEscape = null;
    if (battleResult.lifeRaftEscape && isSeaTerrain(targetTerrain)) {
      lifeRaftEscape = {
        lifeRaft: battleResult.lifeRaftEscape,
        sinkPosition: target,
      };
    }

    // Handle flag return (ship with flag sunk at sea without life raft or flag not on raft)
    let flagReturn = null;
    if (isSeaTerrain(targetTerrain) && hasEnemyFlagInCargo(defender) && !lifeRaftEscape) {
      // Flag goes back to its original owner
      const flagOwner = defender.player === 'yellow' ? 'blue' : 'yellow';
      // Actually the flag being carried is the ENEMY's flag, so the owner is the OTHER player
      flagReturn = { player: otherPlayer(attacker.player) };
    }

    // Add defender + cargo to captured pieces
    const captured = { ...state.capturedPieces };
    captured[defender.player] = [...captured[defender.player], defender];

    return {
      ...state,
      board,
      lastBattle: battleResult,
      showBattle: true,
      selectedPosition: null,
      selectedCargoIndex: null,
      actionMode: null,
      capturedPieces: captured,
      lifeRaftEscape,
      flagReturn,
    };
  } else if (battleResult.winner === 'defender') {
    if (battleResult.mineStays) {
      // Defender is a mine - stays in place, attacker removed
      board[from.row][from.col].piece = null;
    } else {
      // Defender wins normally
      board[from.row][from.col].piece = null;

      // If attacker was carrying flag on land, flag drops at attacker's position
      if (attacker.carryingFlag && !isSeaTerrain(fromTerrain)) {
        board[from.row][from.col].piece = createFlagPiece(
          attacker.player === 'yellow' ? 'blue' : 'yellow'
        );
        // Defender stays where it is (rule viii)
      }
    }

    // Life raft escape from defeated attacker ship
    let lifeRaftEscape = null;
    if (battleResult.lifeRaftEscape && isSeaTerrain(fromTerrain)) {
      lifeRaftEscape = {
        lifeRaft: battleResult.lifeRaftEscape,
        sinkPosition: from,
      };
    }

    const captured = { ...state.capturedPieces };
    captured[attacker.player] = [...captured[attacker.player], attacker];

    return {
      ...state,
      board,
      lastBattle: battleResult,
      showBattle: true,
      selectedPosition: null,
      selectedCargoIndex: null,
      actionMode: null,
      capturedPieces: captured,
      lifeRaftEscape,
    };
  } else {
    // Both die
    board[from.row][from.col].piece = null;
    board[target.row][target.col].piece = null;

    // Handle dropped flags
    if (attacker.carryingFlag && !isSeaTerrain(fromTerrain)) {
      board[from.row][from.col].piece = createFlagPiece(
        attacker.player === 'yellow' ? 'blue' : 'yellow'
      );
    }
    if (defender.carryingFlag && !isSeaTerrain(targetTerrain)) {
      board[target.row][target.col].piece = createFlagPiece(
        defender.player === 'yellow' ? 'blue' : 'yellow'
      );
    }

    const captured = { ...state.capturedPieces };
    captured[attacker.player] = [...captured[attacker.player], attacker];
    captured[defender.player] = [...captured[defender.player], defender];

    return {
      ...state,
      board,
      lastBattle: battleResult,
      showBattle: true,
      selectedPosition: null,
      selectedCargoIndex: null,
      actionMode: null,
      capturedPieces: captured,
    };
  }
}

function handleExecuteLoad(state: GameState, from: Position, onto: Position): GameState {
  const board = cloneBoard(state.board);
  const cargoUnit = board[from.row][from.col].piece;
  const transport = board[onto.row][onto.col].piece;

  if (!cargoUnit || !transport) return state;
  if (cargoUnit.player !== state.currentPlayer || transport.player !== state.currentPlayer) return state;
  if (!canLoad(transport, cargoUnit)) return state;

  // Check adjacency
  const adj = getAdjacent(onto);
  if (!adj.some(a => a.row === from.row && a.col === from.col)) return state;

  // Load the unit
  transport.cargo.push(clonePiece(cargoUnit));
  board[from.row][from.col].piece = null;

  return {
    ...state,
    board,
    selectedPosition: null,
    selectedCargoIndex: null,
    actionMode: null,
    phase: handoffPhase(state.currentPlayer),
  };
}

function handleExecuteUnload(state: GameState, to: Position): GameState {
  if (!state.selectedPosition || state.selectedCargoIndex === null) return state;

  const board = cloneBoard(state.board);
  const transport = board[state.selectedPosition.row][state.selectedPosition.col].piece;
  if (!transport || state.selectedCargoIndex >= transport.cargo.length) return state;

  const validTargets = getUnloadTargets(board, state.selectedPosition, state.selectedCargoIndex);
  if (!validTargets.some(t => t.row === to.row && t.col === to.col)) return state;

  const cargoUnit = transport.cargo.splice(state.selectedCargoIndex, 1)[0];
  board[to.row][to.col].piece = cargoUnit;

  return {
    ...state,
    board,
    selectedPosition: null,
    selectedCargoIndex: null,
    actionMode: null,
    phase: handoffPhase(state.currentPlayer),
  };
}

function handleDismissBattle(state: GameState): GameState {
  if (state.lifeRaftEscape) {
    return {
      ...state,
      showBattle: false,
      phase: 'life-raft-escape',
    };
  }
  if (state.flagReturn) {
    return {
      ...state,
      showBattle: false,
      phase: 'flag-return',
      lastBattle: null,
    };
  }

  const winner = checkVictory(state.board);
  return {
    ...state,
    showBattle: false,
    lastBattle: null,
    winner,
    phase: winner ? 'victory' : handoffPhase(state.currentPlayer),
  };
}

function handleLifeRaftEscape(state: GameState, to: Position): GameState {
  if (!state.lifeRaftEscape) return state;

  const board = cloneBoard(state.board);
  const { lifeRaft, sinkPosition } = state.lifeRaftEscape;

  // Place life raft at the escape position
  if (!board[to.row][to.col].piece && getTerrain(board, to) === 'S') {
    const adj = getAdjacent(sinkPosition);
    if (adj.some(a => a.row === to.row && a.col === to.col)) {
      board[to.row][to.col].piece = lifeRaft;
    }
  }

  const winner = checkVictory(board);
  return {
    ...state,
    board,
    lifeRaftEscape: null,
    phase: state.flagReturn
      ? 'flag-return'
      : winner
      ? 'victory'
      : handoffPhase(state.currentPlayer),
    winner,
  };
}

function handleSkipLifeRaftEscape(state: GameState): GameState {
  const winner = checkVictory(state.board);
  return {
    ...state,
    lifeRaftEscape: null,
    phase: state.flagReturn
      ? 'flag-return'
      : winner
      ? 'victory'
      : handoffPhase(state.currentPlayer),
    winner,
  };
}

function handlePlaceReturnedFlag(state: GameState, position: Position): GameState {
  if (!state.flagReturn) return state;

  const board = cloneBoard(state.board);
  const terrain = getTerrain(board, position);

  // Flag must be placed on land (not island)
  if (terrain !== 'L') return state;
  if (board[position.row][position.col].piece) return state;

  // Place the flag
  const flag: Piece = {
    id: generatePieceId(state.flagReturn.player, 'Flag'),
    unitName: 'Flag',
    player: state.flagReturn.player,
    carryingFlag: false,
    cargo: [],
  };
  board[position.row][position.col].piece = flag;

  const winner = checkVictory(board);
  return {
    ...state,
    board,
    flagReturn: null,
    phase: winner ? 'victory' : handoffPhase(state.currentPlayer),
    winner,
  };
}

function handleEndTurn(state: GameState): GameState {
  const next = otherPlayer(state.currentPlayer);
  return {
    ...state,
    currentPlayer: next,
    turnNumber: state.currentPlayer === 'yellow' ? state.turnNumber : state.turnNumber + 1,
    selectedPosition: null,
    selectedCargoIndex: null,
    actionMode: null,
    phase: 'play',
  };
}

function otherPlayer(player: Player): Player {
  return player === 'yellow' ? 'blue' : 'yellow';
}

function handoffPhase(player: Player): GameState['phase'] {
  return player === 'yellow' ? 'handoff-to-blue' : 'handoff-to-yellow';
}

function createFlagPiece(flagOwner: Player): Piece {
  return {
    id: generatePieceId(flagOwner, 'Flag-dropped'),
    unitName: 'Flag',
    player: flagOwner,
    carryingFlag: false,
    cargo: [],
  };
}
