import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  GameState, Player, Unit, UnitType, Position, Action, ActionKind,
  BattleResult, BackForthEntry,
} from "./types";
import {
  UNIT_DEFS, UNIT_ORDER, BOARD_SIZE, MAP_DATA,
  getOpponent, isFootUnit, isNavalUnit, isAirUnit, isMineUnit, isSea,
  YELLOW_ISLAND_CELLS, BLUE_ISLAND_CELLS,
} from "./constants";
import { resolveBattle } from "./battleLogic";
import {
  getValidMoves, getValidAttacks, getValidLoads, getValidUnloads,
  getAdjacentSeaCells, getEmptyLandCells,
} from "./movementLogic";
import { getValidPlacements, validateSetupCompletion } from "./setupLogic";

function createUnitsForPlayer(player: Player): Unit[] {
  const units: Unit[] = [];
  for (const type of UNIT_ORDER) {
    const def = UNIT_DEFS[type];
    for (let i = 0; i < def.count; i++) {
      units.push({
        id: `${player}-${type}-${i}`,
        type,
        player,
        cargo: [],
        isRevealed: false,
        carryingFlag: false,
      });
    }
  }
  return units;
}

function createEmptyBoard(): (Unit | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
}

function createInitialState(): GameState {
  return {
    phase: "setup_yellow",
    board: createEmptyBoard(),
    currentPlayer: "yellow",
    selected: null,
    selectedSetupUnitType: null,
    validActions: [],
    activeActionKind: null,
    unplacedUnits: {
      yellow: createUnitsForPlayer("yellow"),
      blue: createUnitsForPlayer("blue"),
    },
    backForthMap: {},
    winner: null,
    pendingBattle: null,
    pendingLifeRaftPlacement: null,
    pendingFlagReplacement: null,
    turnNumber: 0,
  };
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

function findUnitOnBoard(board: (Unit | null)[][], unitId: string): Position | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.id === unitId) return { row: r, col: c };
    }
  }
  return null;
}

function hasLifeRaftInCargo(unit: Unit): Unit | null {
  return unit.cargo.find((c) => c.type === "Life Raft") ?? null;
}

function isCarryingEnemyFlag(unit: Unit): boolean {
  if (unit.carryingFlag) return true;
  return unit.cargo.some((c) => c.carryingFlag || isCarryingEnemyFlag(c));
}

function collectAllCargo(unit: Unit): Unit[] {
  const all: Unit[] = [];
  for (const c of unit.cargo) {
    all.push(c);
    all.push(...collectAllCargo(c));
  }
  return all;
}

function checkWinCondition(board: (Unit | null)[][], player: Player): boolean {
  const islandCells = player === "yellow" ? YELLOW_ISLAND_CELLS : BLUE_ISLAND_CELLS;
  for (const cell of islandCells) {
    const unit = board[cell.row][cell.col];
    if (unit && unit.player === player && unit.carryingFlag) {
      return true;
    }
  }
  return false;
}

export interface GameActions {
  // Setup actions
  selectSetupUnitType: (type: UnitType | null) => void;
  placeUnit: (pos: Position) => void;
  removeUnit: (pos: Position) => void;
  confirmSetup: () => { valid: boolean; errors: string[] };

  // Turn transition
  acknowledgeTransition: () => void;

  // Playing actions
  selectCell: (pos: Position) => void;
  setActionKind: (kind: ActionKind | null) => void;
  executeAction: (action: Action) => void;
  clearSelection: () => void;

  // Special event resolution
  acknowledgeBattle: () => void;
  resolveLifeRaft: (targetPos: Position) => void;
  resolveFlagReplacement: (targetPos: Position) => void;

  // Game
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...createInitialState(),

    selectSetupUnitType: (type) => {
      set((state) => {
        state.selectedSetupUnitType = type;
        state.selected = null;
      });
    },

    placeUnit: (pos) => {
      set((state) => {
        const { selectedSetupUnitType, currentPlayer } = state;
        if (!selectedSetupUnitType) return;

        const validCells = getValidPlacements(state, selectedSetupUnitType, currentPlayer);
        if (!validCells.some((c) => posEq(c, pos))) return;

        const idx = state.unplacedUnits[currentPlayer].findIndex(
          (u) => u.type === selectedSetupUnitType,
        );
        if (idx === -1) return;

        const unit = state.unplacedUnits[currentPlayer].splice(idx, 1)[0];
        state.board[pos.row][pos.col] = unit;

        // Check if any more of this type remain
        const remaining = state.unplacedUnits[currentPlayer].filter(
          (u) => u.type === selectedSetupUnitType,
        );
        if (remaining.length === 0) {
          state.selectedSetupUnitType = null;
        }
      });
    },

    removeUnit: (pos) => {
      set((state) => {
        const unit = state.board[pos.row][pos.col];
        if (!unit || unit.player !== state.currentPlayer) return;
        state.board[pos.row][pos.col] = null;
        state.unplacedUnits[state.currentPlayer].push(unit);
      });
    },

    confirmSetup: () => {
      const state = get();
      const result = validateSetupCompletion(state, state.currentPlayer);
      if (!result.valid) return result;

      set((state) => {
        if (state.phase === "setup_yellow") {
          state.phase = "turn_transition";
          state.currentPlayer = "blue";
          state.selectedSetupUnitType = null;
          state.selected = null;
        } else if (state.phase === "setup_blue") {
          state.phase = "turn_transition";
          state.currentPlayer = "yellow";
          state.selectedSetupUnitType = null;
          state.selected = null;
          state.turnNumber = 1;
        }
      });
      return result;
    },

    acknowledgeTransition: () => {
      set((state) => {
        if (state.phase === "turn_transition") {
          if (state.turnNumber === 0) {
            // Transitioning between setup phases
            if (state.currentPlayer === "blue") {
              state.phase = "setup_blue";
            } else {
              state.phase = "playing";
            }
          } else {
            state.phase = "playing";
          }
        }
      });
    },

    selectCell: (pos) => {
      set((state) => {
        if (state.phase !== "playing") return;
        if (state.pendingBattle || state.pendingLifeRaftPlacement || state.pendingFlagReplacement) return;

        const unit = state.board[pos.row][pos.col];

        if (unit && unit.player === state.currentPlayer) {
          state.selected = pos;
          state.activeActionKind = null;
          state.validActions = [];
        } else {
          state.selected = null;
          state.activeActionKind = null;
          state.validActions = [];
        }
      });
    },

    setActionKind: (kind) => {
      set((state) => {
        if (!state.selected) return;
        state.activeActionKind = kind;

        if (kind === null) {
          state.validActions = [];
          return;
        }

        const pos = state.selected;
        switch (kind) {
          case "move":
            state.validActions = getValidMoves(state, pos);
            break;
          case "attack":
            state.validActions = getValidAttacks(state, pos);
            break;
          case "load":
            state.validActions = getValidLoads(state, pos);
            break;
          case "unload":
            state.validActions = getValidUnloads(state, pos);
            break;
        }
      });
    },

    executeAction: (action) => {
      set((state) => {
        const { kind, from, to, cargoUnitId } = action;
        const unit = state.board[from.row][from.col];
        if (!unit) return;

        switch (kind) {
          case "move": {
            // Update back-and-forth tracking
            const entry = state.backForthMap[unit.id];
            if (entry && posEq(entry.prevPos, to)) {
              state.backForthMap[unit.id] = { prevPos: from, count: entry.count + 1 };
            } else {
              state.backForthMap[unit.id] = { prevPos: from, count: 1 };
            }

            state.board[to.row][to.col] = unit;
            state.board[from.row][from.col] = null;

            // Check win condition
            if (unit.carryingFlag && checkWinCondition(state.board, unit.player)) {
              state.winner = unit.player;
            }

            endTurn(state);
            break;
          }

          case "attack": {
            const defender = state.board[to.row][to.col];
            if (!defender) return;

            // Mark both as revealed
            unit.isRevealed = true;
            defender.isRevealed = true;

            const result = resolveBattle(unit, defender);
            state.pendingBattle = result;

            // Apply battle outcome
            applyBattleResult(state, result, from, to);
            break;
          }

          case "load": {
            const cargo = state.board[to.row][to.col];
            if (!cargo) return;

            unit.cargo.push(cargo);
            state.board[to.row][to.col] = null;
            endTurn(state);
            break;
          }

          case "unload": {
            if (!cargoUnitId) return;
            const idx = unit.cargo.findIndex((c) => c.id === cargoUnitId);
            if (idx === -1) return;

            const cargoUnit = unit.cargo.splice(idx, 1)[0];
            state.board[to.row][to.col] = cargoUnit;
            endTurn(state);
            break;
          }
        }
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selected = null;
        state.activeActionKind = null;
        state.validActions = [];
      });
    },

    acknowledgeBattle: () => {
      set((state) => {
        state.pendingBattle = null;

        // If there are pending special events, don't end turn yet
        if (state.pendingLifeRaftPlacement || state.pendingFlagReplacement) return;

        // Check win condition
        if (state.winner) return;

        endTurn(state);
      });
    },

    resolveLifeRaft: (targetPos) => {
      set((state) => {
        if (!state.pendingLifeRaftPlacement) return;
        const { lifeRaft } = state.pendingLifeRaftPlacement;
        state.board[targetPos.row][targetPos.col] = lifeRaft;
        state.pendingLifeRaftPlacement = null;

        if (!state.pendingFlagReplacement && !state.pendingBattle) {
          endTurn(state);
        }
      });
    },

    resolveFlagReplacement: (targetPos) => {
      set((state) => {
        if (!state.pendingFlagReplacement) return;
        const { ownerPlayer } = state.pendingFlagReplacement;
        const flagUnit: Unit = {
          id: `${ownerPlayer}-Flag-0`,
          type: "Flag",
          player: ownerPlayer,
          cargo: [],
          isRevealed: false,
          carryingFlag: false,
        };
        state.board[targetPos.row][targetPos.col] = flagUnit;
        state.pendingFlagReplacement = null;

        if (!state.pendingLifeRaftPlacement && !state.pendingBattle) {
          endTurn(state);
        }
      });
    },

    resetGame: () => {
      set(() => createInitialState());
    },
  })),
);

function endTurn(state: GameState) {
  state.selected = null;
  state.activeActionKind = null;
  state.validActions = [];

  if (state.winner) return;

  state.currentPlayer = getOpponent(state.currentPlayer);
  if (state.currentPlayer === "yellow") {
    state.turnNumber++;
  }
  state.phase = "turn_transition";
}

function applyBattleResult(
  state: GameState,
  result: BattleResult,
  attackerPos: Position,
  defenderPos: Position,
) {
  const attacker = state.board[attackerPos.row][attackerPos.col]!;
  const defender = state.board[defenderPos.row][defenderPos.col]!;

  if (result.winner === "attacker") {
    // Flag capture: soldier moves to flag's cell and picks it up
    if (defender.type === "Flag") {
      attacker.carryingFlag = true;
      attacker.cargo.push(defender);
      state.board[defenderPos.row][defenderPos.col] = attacker;
      state.board[attackerPos.row][attackerPos.col] = null;
      if (checkWinCondition(state.board, attacker.player)) {
        state.winner = attacker.player;
      }
      return;
    }

    // Check if defeated defender was carrying the enemy flag (on land)
    if (defenderIsCarryingFlag(defender)) {
      const flagOwner = getOpponent(defender.player);
      handleFlagOnDefeat(state, defender, defenderPos, flagOwner);
      // Winner stays in own cell (per rule viii)
      state.board[attackerPos.row][attackerPos.col] = attacker;
      return;
    }

    // Handle defeated transport's cargo (life raft escape, flag at sea)
    handleDefeatedTransportCargo(state, defender, defenderPos);

    // Attacker moves to defender's position
    state.board[defenderPos.row][defenderPos.col] = attacker;
    state.board[attackerPos.row][attackerPos.col] = null;

  } else if (result.winner === "defender") {
    // Mine: stays in place, attacker removed
    if (isMineUnit(defender.type)) {
      handleAttackerCarryingFlagDefeated(state, attacker, attackerPos);
      state.board[attackerPos.row][attackerPos.col] = null;
      return;
    }

    // Check if defeated attacker was carrying the enemy flag
    if (defenderIsCarryingFlag(attacker)) {
      const flagOwner = getOpponent(attacker.player);
      handleFlagOnDefeat(state, attacker, attackerPos, flagOwner);
      // Defender stays in own cell
      return;
    }

    // Handle defeated transport's cargo
    handleDefeatedTransportCargo(state, attacker, attackerPos);

    // Attacker is removed
    state.board[attackerPos.row][attackerPos.col] = null;

  } else {
    // Both die — handle cargo for both
    handleAttackerCarryingFlagDefeated(state, attacker, attackerPos);
    handleAttackerCarryingFlagDefeated(state, defender, defenderPos);
    handleDefeatedTransportCargo(state, attacker, attackerPos);
    handleDefeatedTransportCargo(state, defender, defenderPos);

    state.board[attackerPos.row][attackerPos.col] = null;
    state.board[defenderPos.row][defenderPos.col] = null;
  }
}

/** Check if a unit or its cargo chain is carrying the enemy flag */
function defenderIsCarryingFlag(unit: Unit): boolean {
  if (unit.carryingFlag) return true;
  return unit.cargo.some((c) => defenderIsCarryingFlag(c));
}

/** Handle the case where a flag-carrying unit is defeated on land:
 *  flag drops at the unit's position, winner stays in its own cell */
function handleFlagOnDefeat(
  state: GameState,
  defeatedUnit: Unit,
  pos: Position,
  flagOwner: Player,
) {
  const droppedFlag: Unit = {
    id: `${flagOwner}-Flag-0`,
    type: "Flag",
    player: flagOwner,
    cargo: [],
    isRevealed: false,
    carryingFlag: false,
  };
  state.board[pos.row][pos.col] = droppedFlag;
}

/** Handle when a simple flag-carrier (attacker) is defeated — drops flag */
function handleAttackerCarryingFlagDefeated(
  state: GameState,
  unit: Unit,
  pos: Position,
) {
  if (!defenderIsCarryingFlag(unit)) return;
  const flagOwner = getOpponent(unit.player);
  const t = MAP_DATA[pos.row][pos.col];
  if (isSea(t)) {
    // Flag at sea: return to owner for re-placement
    const validCells = getEmptyLandCells(state.board);
    if (validCells.length > 0) {
      state.pendingFlagReplacement = { ownerPlayer: flagOwner, validCells };
    }
  } else {
    // Flag on land: drops at this position
    handleFlagOnDefeat(state, unit, pos, flagOwner);
  }
}

/** Handle defeated transport ship's cargo: life raft escape or flag return */
function handleDefeatedTransportCargo(
  state: GameState,
  defeatedUnit: Unit,
  pos: Position,
) {
  if (defeatedUnit.cargo.length === 0) return;

  const t = MAP_DATA[pos.row][pos.col];

  // Life raft escape: only at sea for naval units
  if (isSea(t) && isNavalUnit(defeatedUnit.type)) {
    const lifeRaft = hasLifeRaftInCargo(defeatedUnit);
    if (lifeRaft) {
      const adjacentCells = getAdjacentSeaCells(state.board, pos);
      if (adjacentCells.length > 0) {
        state.pendingLifeRaftPlacement = { lifeRaft, adjacentCells };
        return;
      }
    }
  }

  // If no life raft escape, check for flag in cargo
  if (defenderIsCarryingFlag(defeatedUnit) && isSea(t)) {
    const flagOwner = getOpponent(defeatedUnit.player);
    const validCells = getEmptyLandCells(state.board);
    if (validCells.length > 0) {
      state.pendingFlagReplacement = { ownerPlayer: flagOwner, validCells };
    }
  }
}
