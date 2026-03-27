import { GameState, GameAction, Unit, Position, Player, UnitType } from './types';
import { MAP_DATA, UNIT_DEFS, ISLAND_CELLS_BY_PLAYER, FOOT_RANKS, NAVAL_UNIT_TYPES } from './constants';
import { resolveBattle, computeLifeRaftEscape } from './battleLogic';
import { getAllValidActions, getValidMoves } from './movementLogic';
import { getValidPlacements, validateSetupCompletion, createInitialUnits } from './setupLogic';

// ── Initial state ─────────────────────────────────────────────────────────────
export function createInitialState(): GameState {
  const board: (Unit | null)[][] = Array.from({ length: 20 }, () =>
    Array(20).fill(null),
  );
  return {
    phase: 'setup_yellow',
    board,
    currentPlayer: 'yellow',
    selected: null,
    validActions: [],
    unplacedUnits: {
      yellow: createInitialUnits('yellow'),
      blue: createInitialUnits('blue'),
    },
    backForthMap: {},
    winner: null,
    battleLog: [],
    pendingBattle: null,
    pendingLifeRaftPlacement: null,
    pendingFlagReplacement: null,
    setupSelectedUnitType: null,
    message: 'Yellow player: place your units',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function posEq(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

function cloneBoard(board: (Unit | null)[][]): (Unit | null)[][] {
  return board.map(row => [...row]);
}

function removeUnitFromBoard(board: (Unit | null)[][], pos: Position): void {
  board[pos.row][pos.col] = null;
}

function isFootUnit(type: UnitType): boolean {
  return FOOT_RANKS[type] !== undefined;
}

/**
 * Check win condition: a foot unit on the current player's island carrying the enemy flag.
 */
function checkWin(board: (Unit | null)[][], player: Player): boolean {
  const islandCells = ISLAND_CELLS_BY_PLAYER[player];
  for (const { row, col } of islandCells) {
    const unit = board[row][col];
    if (unit && unit.player === player && unit.carryingFlag) {
      return true;
    }
    // Also check cargo (e.g. soldier is on ship which is on island - not possible since ships can't reach island)
    // Islands are I terrain, ships can't go there, so just check direct unit
  }
  return false;
}

/**
 * Update back-and-forth tracking after a move from → to.
 */
function updateBackForth(
  backForthMap: Record<string, { prevPos: Position; count: number }>,
  unitId: string,
  from: Position,
  to: Position,
): Record<string, { prevPos: Position; count: number }> {
  const newMap = { ...backForthMap };
  const entry = newMap[unitId];
  if (entry && posEq(entry.prevPos, to)) {
    newMap[unitId] = { prevPos: from, count: entry.count + 1 };
  } else {
    newMap[unitId] = { prevPos: from, count: 1 };
  }
  return newMap;
}

function nextPlayer(p: Player): Player {
  return p === 'yellow' ? 'blue' : 'yellow';
}

// ── Main reducer ──────────────────────────────────────────────────────────────
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'RESET_GAME':
      return createInitialState();

    // ─── Setup phase ────────────────────────────────────────────────────────
    case 'SETUP_SELECT_UNIT': {
      if (state.phase !== 'setup_yellow' && state.phase !== 'setup_blue') return state;
      const player = state.currentPlayer;
      const available = state.unplacedUnits[player].some(u => u.type === action.unitType);
      if (!available) return state;
      const validCells = getValidPlacements(state, action.unitType, player);
      return {
        ...state,
        setupSelectedUnitType: action.unitType,
        selected: null,
        validActions: validCells.map(pos => ({
          kind: 'move' as const,
          from: { row: -1, col: -1 },
          to: pos,
        })),
      };
    }

    case 'PLACE_UNIT': {
      if (state.phase !== 'setup_yellow' && state.phase !== 'setup_blue') return state;
      if (!state.setupSelectedUnitType) return state;
      const player = state.currentPlayer;
      const unitType = state.setupSelectedUnitType;

      // Find first unplaced unit of this type
      const unitIdx = state.unplacedUnits[player].findIndex(u => u.type === unitType);
      if (unitIdx === -1) return state;
      const unit = state.unplacedUnits[player][unitIdx];

      // Validate placement is in validActions
      const isValid = state.validActions.some(a => posEq(a.to, action.pos));
      if (!isValid) return state;

      const newBoard = cloneBoard(state.board);
      newBoard[action.pos.row][action.pos.col] = unit;

      const newUnplaced = {
        ...state.unplacedUnits,
        [player]: state.unplacedUnits[player].filter((_, i) => i !== unitIdx),
      };

      // Recompute valid placements for same unit type (if more remain)
      const remainingCount = newUnplaced[player].filter(u => u.type === unitType).length;
      const tempState = { ...state, board: newBoard, unplacedUnits: newUnplaced };
      const validCells = remainingCount > 0
        ? getValidPlacements(tempState, unitType, player)
        : [];

      return {
        ...state,
        board: newBoard,
        unplacedUnits: newUnplaced,
        validActions: remainingCount > 0
          ? validCells.map(pos => ({ kind: 'move' as const, from: { row: -1, col: -1 }, to: pos }))
          : [],
        setupSelectedUnitType: remainingCount > 0 ? unitType : null,
        message: `${player === 'yellow' ? 'Yellow' : 'Blue'}: ${newUnplaced[player].length} units remaining`,
      };
    }

    case 'CONFIRM_SETUP': {
      if (state.phase !== 'setup_yellow' && state.phase !== 'setup_blue') return state;
      const player = state.currentPlayer;
      const result = validateSetupCompletion(state, player);
      if (!result.valid) {
        return { ...state, message: result.error ?? 'Setup incomplete' };
      }

      if (state.phase === 'setup_yellow') {
        return {
          ...state,
          phase: 'setup_blue',
          currentPlayer: 'blue',
          selected: null,
          validActions: [],
          setupSelectedUnitType: null,
          message: 'Blue player: place your units',
        };
      } else {
        return {
          ...state,
          phase: 'playing',
          currentPlayer: 'yellow',
          selected: null,
          validActions: [],
          setupSelectedUnitType: null,
          message: "Yellow's turn",
        };
      }
    }

    // ─── Playing phase: select a cell ────────────────────────────────────────
    case 'SELECT_CELL': {
      if (state.phase !== 'playing') return state;
      if (state.pendingBattle || state.pendingLifeRaftPlacement || state.pendingFlagReplacement) return state;

      const { pos } = action;

      // Deselect if clicking same cell
      if (state.selected && posEq(state.selected, pos)) {
        return { ...state, selected: null, validActions: [] };
      }

      const cell = state.board[pos.row][pos.col];

      // If we have a selected unit and click a valid action target, execute the action
      if (state.selected) {
        const matchingAction = state.validActions.find(a => posEq(a.to, pos));
        if (matchingAction) {
          // Dispatch internally
          if (matchingAction.kind === 'move') {
            return gameReducer(state, { type: 'MOVE_UNIT', from: state.selected, to: pos });
          }
          if (matchingAction.kind === 'attack') {
            return gameReducer(state, { type: 'ATTACK', from: state.selected, to: pos });
          }
          if (matchingAction.kind === 'load') {
            return gameReducer(state, { type: 'LOAD_UNIT', transportPos: state.selected, cargoPos: pos });
          }
          if (matchingAction.kind === 'unload' && matchingAction.cargoUnit) {
            return gameReducer(state, {
              type: 'UNLOAD_UNIT',
              transportPos: state.selected,
              cargoUnitId: matchingAction.cargoUnit.id,
              targetPos: pos,
            });
          }
        }
      }

      // Select a new cell with current player's unit
      if (cell && cell.player === state.currentPlayer) {
        const actions = getAllValidActions(state, pos);
        return {
          ...state,
          selected: pos,
          validActions: actions,
          message: `Selected ${cell.type}`,
        };
      }

      // Clicked empty or enemy cell with nothing selected → deselect
      return { ...state, selected: null, validActions: [] };
    }

    // ─── Move ────────────────────────────────────────────────────────────────
    case 'MOVE_UNIT': {
      const { from, to } = action;
      const unit = state.board[from.row][from.col];
      if (!unit) return state;

      const newBoard = cloneBoard(state.board);
      newBoard[from.row][from.col] = null;
      newBoard[to.row][to.col] = unit;

      const newBackForth = updateBackForth(state.backForthMap, unit.id, from, to);
      const newPlayer = nextPlayer(state.currentPlayer);

      return {
        ...state,
        board: newBoard,
        backForthMap: newBackForth,
        currentPlayer: newPlayer,
        selected: null,
        validActions: [],
        message: `${newPlayer === 'yellow' ? 'Yellow' : 'Blue'}'s turn`,
      };
    }

    // ─── Attack ──────────────────────────────────────────────────────────────
    case 'ATTACK': {
      const { from, to } = action;
      const attacker = state.board[from.row][from.col];
      const defender = state.board[to.row][to.col];
      if (!attacker || !defender) return state;

      // Reveal both units
      const revealedAttacker = { ...attacker, isRevealed: true };
      const revealedDefender = { ...defender, isRevealed: true };

      const battleResult = resolveBattle(revealedAttacker, revealedDefender, from, to);

      // Compute life raft escape if applicable
      if (battleResult.winner === 'attacker' && NAVAL_UNIT_TYPES.has(defender.type)) {
        const escape = computeLifeRaftEscape(revealedDefender, state.board, to);
        if (escape) {
          battleResult.lifeRaftEscape = escape;
        }
      }
      if (battleResult.winner === 'defender' && NAVAL_UNIT_TYPES.has(attacker.type)) {
        const escape = computeLifeRaftEscape(revealedAttacker, state.board, from);
        if (escape) {
          battleResult.lifeRaftEscape = escape;
        }
      }

      const newBoard = cloneBoard(state.board);
      let newBackForth = { ...state.backForthMap };
      let pendingLifeRaft = state.pendingLifeRaftPlacement;
      let pendingFlag = state.pendingFlagReplacement;
      let winnerPlayer = state.winner;

      const { winner } = battleResult;

      if (winner === 'attacker') {
        // Remove defender and handle its cargo
        newBoard[to.row][to.col] = null;

        // Life raft escape
        if (battleResult.lifeRaftEscape && battleResult.lifeRaftEscape.adjacentCells.length > 0) {
          pendingLifeRaft = {
            lifeRaft: battleResult.lifeRaftEscape.lifeRaft,
            passengers: battleResult.lifeRaftEscape.passengers,
            adjacentCells: battleResult.lifeRaftEscape.adjacentCells,
            defenderPos: to,
          };
        }

        // Handle flag drop when defender carries flag
        if (revealedDefender.carryingFlag) {
          // Flag stays on the vacated cell; check if at sea (handled below)
          const terrain = MAP_DATA[to.row][to.col];
          if (terrain === 'S') {
            // Flag at sea - returned to owner for re-placement on land
            pendingFlag = { player: revealedDefender.player };
          } else {
            // Place standalone flag unit on vacated cell
            const flagUnit: Unit = {
              id: `${revealedDefender.player}-Flag-0`,
              type: 'Flag',
              player: revealedDefender.player,
              cargo: [],
              isRevealed: true,
              carryingFlag: false,
            };
            newBoard[to.row][to.col] = flagUnit;
          }
        }

        // Attacker captures flag if it was on the defender unit (Flag type)
        if (revealedDefender.type === 'Flag') {
          const updatedAttacker = {
            ...revealedAttacker,
            carryingFlag: true,
          };
          newBoard[from.row][from.col] = null;
          newBoard[to.row][to.col] = updatedAttacker;
          newBackForth = updateBackForth(newBackForth, updatedAttacker.id, from, to);
        } else if (!revealedDefender.carryingFlag) {
          // Normal move: attacker advances
          newBoard[from.row][from.col] = null;
          newBoard[to.row][to.col] = revealedAttacker;
          newBackForth = updateBackForth(newBackForth, revealedAttacker.id, from, to);
        } else {
          // Attacker wins vs flag-carrying defender (flag dropped already)
          newBoard[from.row][from.col] = null;
          // Attacker stays put (rule viii: winner stays in its square)
        }

      } else if (winner === 'defender') {
        if (revealedDefender.type === 'Land mine' || revealedDefender.type === 'Naval mine') {
          // Mine stays; attacker removed
          newBoard[from.row][from.col] = null;
        } else {
          // Regular defender win: attacker removed, defender stays
          newBoard[from.row][from.col] = null;
          // Also handle life raft from losing attacker ship
          if (battleResult.lifeRaftEscape && battleResult.lifeRaftEscape.adjacentCells.length > 0) {
            pendingLifeRaft = {
              lifeRaft: battleResult.lifeRaftEscape.lifeRaft,
              passengers: battleResult.lifeRaftEscape.passengers,
              adjacentCells: battleResult.lifeRaftEscape.adjacentCells,
              defenderPos: from,
            };
          }
        }

      } else { // both_die
        newBoard[from.row][from.col] = null;
        newBoard[to.row][to.col] = null;

        // Handle flag drop
        if (revealedDefender.carryingFlag) {
          const terrain = MAP_DATA[to.row][to.col];
          if (terrain === 'S') {
            pendingFlag = { player: revealedDefender.player };
          } else {
            const flagUnit: Unit = {
              id: `${revealedDefender.player}-Flag-dropped`,
              type: 'Flag',
              player: revealedDefender.player,
              cargo: [],
              isRevealed: true,
              carryingFlag: false,
            };
            newBoard[to.row][to.col] = flagUnit;
          }
        }
        if (revealedAttacker.carryingFlag) {
          const terrain = MAP_DATA[from.row][from.col];
          if (terrain === 'S') {
            pendingFlag = { player: revealedAttacker.player };
          } else {
            const flagUnit: Unit = {
              id: `${revealedAttacker.player}-Flag-dropped`,
              type: 'Flag',
              player: revealedAttacker.player,
              cargo: [],
              isRevealed: true,
              carryingFlag: false,
            };
            newBoard[from.row][from.col] = flagUnit;
          }
        }
      }

      // Check win condition
      if (!winnerPlayer) {
        if (checkWin(newBoard, attacker.player)) winnerPlayer = attacker.player;
        else if (checkWin(newBoard, defender.player)) winnerPlayer = defender.player;
      }

      const newPlayer = nextPlayer(state.currentPlayer);

      return {
        ...state,
        board: newBoard,
        backForthMap: newBackForth,
        currentPlayer: newPlayer,
        selected: null,
        validActions: [],
        pendingBattle: battleResult,
        pendingLifeRaftPlacement: pendingLifeRaft,
        pendingFlagReplacement: pendingFlag,
        winner: winnerPlayer,
        battleLog: [...state.battleLog, battleResult],
        message: winnerPlayer
          ? `${winnerPlayer === 'yellow' ? 'Yellow' : 'Blue'} wins! 🎉`
          : `${newPlayer === 'yellow' ? 'Yellow' : 'Blue'}'s turn`,
      };
    }

    // ─── Load ────────────────────────────────────────────────────────────────
    case 'LOAD_UNIT': {
      const { transportPos, cargoPos } = action;
      const transport = state.board[transportPos.row][transportPos.col];
      const cargo = state.board[cargoPos.row][cargoPos.col];
      if (!transport || !cargo) return state;

      const newBoard = cloneBoard(state.board);
      const updatedTransport: Unit = {
        ...transport,
        cargo: [...transport.cargo, cargo],
      };
      newBoard[transportPos.row][transportPos.col] = updatedTransport;
      newBoard[cargoPos.row][cargoPos.col] = null;

      const newPlayer = nextPlayer(state.currentPlayer);
      return {
        ...state,
        board: newBoard,
        currentPlayer: newPlayer,
        selected: null,
        validActions: [],
        message: `${newPlayer === 'yellow' ? 'Yellow' : 'Blue'}'s turn`,
      };
    }

    // ─── Unload ──────────────────────────────────────────────────────────────
    case 'UNLOAD_UNIT': {
      const { transportPos, cargoUnitId, targetPos } = action;
      const transport = state.board[transportPos.row][transportPos.col];
      if (!transport) return state;

      const cargoUnit = transport.cargo.find(u => u.id === cargoUnitId);
      if (!cargoUnit) return state;

      const newBoard = cloneBoard(state.board);
      const updatedTransport: Unit = {
        ...transport,
        cargo: transport.cargo.filter(u => u.id !== cargoUnitId),
      };
      newBoard[transportPos.row][transportPos.col] = updatedTransport;
      newBoard[targetPos.row][targetPos.col] = cargoUnit;

      const newPlayer = nextPlayer(state.currentPlayer);
      return {
        ...state,
        board: newBoard,
        currentPlayer: newPlayer,
        selected: null,
        validActions: [],
        message: `${newPlayer === 'yellow' ? 'Yellow' : 'Blue'}'s turn`,
      };
    }

    // ─── Acknowledge battle result ────────────────────────────────────────────
    case 'ACKNOWLEDGE_BATTLE': {
      return { ...state, pendingBattle: null };
    }

    // ─── Life raft placement ─────────────────────────────────────────────────
    case 'RESOLVE_LIFE_RAFT': {
      if (!state.pendingLifeRaftPlacement) return state;
      const { lifeRaft, passengers, adjacentCells } = state.pendingLifeRaftPlacement;

      // Validate target is in adjacentCells
      const valid = adjacentCells.some(c => posEq(c, action.targetPos));
      if (!valid) return state;

      const newBoard = cloneBoard(state.board);
      const raftWithPassengers: Unit = {
        ...lifeRaft,
        cargo: passengers,
      };
      newBoard[action.targetPos.row][action.targetPos.col] = raftWithPassengers;

      return {
        ...state,
        board: newBoard,
        pendingLifeRaftPlacement: null,
        message: `${state.currentPlayer === 'yellow' ? 'Yellow' : 'Blue'}'s turn`,
      };
    }

    // ─── Flag replacement ─────────────────────────────────────────────────────
    case 'RESOLVE_FLAG_REPLACEMENT': {
      if (!state.pendingFlagReplacement) return state;
      const { player } = state.pendingFlagReplacement;
      const { targetPos } = action;

      // Validate: must be a land cell in player's territory
      const terrain = MAP_DATA[targetPos.row][targetPos.col];
      if (terrain !== 'L') return state;
      if (state.board[targetPos.row][targetPos.col] !== null) return state;

      const newBoard = cloneBoard(state.board);
      const flagUnit: Unit = {
        id: `${player}-Flag-0`,
        type: 'Flag',
        player,
        cargo: [],
        isRevealed: true,
        carryingFlag: false,
      };
      newBoard[targetPos.row][targetPos.col] = flagUnit;

      return {
        ...state,
        board: newBoard,
        pendingFlagReplacement: null,
        message: `${state.currentPlayer === 'yellow' ? 'Yellow' : 'Blue'}'s turn`,
      };
    }

    default:
      return state;
  }
}
