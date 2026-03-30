import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  Cell,
  UnitInstance,
  Player,
  GamePhase,
  BattleResult,
  Coord,
  MoveRecord,
  UnitName,
} from "../engine/types";
import { UNIT_DEFINITIONS, BOARD_ROWS, BOARD_COLS, getUnitDef, isFootUnit, isShip } from "../engine/constants";
import { getMap, getTerrain, getIslandCells } from "../engine/map";
import { resolveBattle } from "../engine/combat";
import { getValidMoves, getValidAttackTargets } from "../engine/movement";
import { getLoadableAdjacentUnits, getUnloadTargets } from "../engine/loading";
import { getValidPlacementCells } from "../engine/placement";
import { validatePlacement } from "../engine/validation";
import { checkWinCondition } from "../engine/winCondition";

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------
let nextId = 1;
function genId(): string {
  return `u${nextId++}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface PlacementEntry {
  name: UnitName;
  remaining: number;
}

export interface GameState {
  board: Cell[][];
  phase: GamePhase;
  currentPlayer: Player;
  turnNumber: number;
  selectedCell: Coord | null;
  validMoves: Coord[];
  validAttacks: Coord[];
  validLoadTargets: Coord[];
  validUnloadTargets: Coord[];
  selectedCargoIndex: number | null;
  placementInventory: Record<Player, PlacementEntry[]>;
  selectedPlacementUnit: UnitName | null;
  moveHistory: MoveRecord[];
  eliminated: Record<Player, UnitInstance[]>;
  lastBattle: BattleResult | null;
  showBattleModal: boolean;
  pendingLifeRaftEscape: BattleResult["lifeRaftEscape"];
  pendingFlagReplacement: Player | null;
  winner: Player | null;
  placementErrors: string[];
  showTurnTransition: boolean;

  // Actions
  initGame: () => void;
  selectPlacementUnit: (name: UnitName) => void;
  placeUnit: (row: number, col: number) => void;
  removePlacedUnit: (row: number, col: number) => void;
  finishPlacement: () => void;
  selectCell: (row: number, col: number) => void;
  deselectCell: () => void;
  executeMove: (row: number, col: number) => void;
  executeAttack: (row: number, col: number) => void;
  executeLoad: (row: number, col: number) => void;
  selectCargoForUnload: (index: number) => void;
  executeUnload: (row: number, col: number) => void;
  resolveLifeRaftEscape: (soldierIds: string[], targetCell: Coord) => void;
  placeFlagAfterReturn: (row: number, col: number) => void;
  dismissBattle: () => void;
  endTurn: () => void;
  acknowledgeTurnTransition: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildEmptyBoard(): Cell[][] {
  const terrain = getMap();
  const board: Cell[][] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < BOARD_COLS; c++) {
      row.push({ row: r, col: c, terrain: terrain[r][c], unit: null });
    }
    board.push(row);
  }
  return board;
}

function buildInventory(): Record<Player, PlacementEntry[]> {
  const make = (): PlacementEntry[] =>
    UNIT_DEFINITIONS.map((d) => ({ name: d.name, remaining: d.count }));
  return { yellow: make(), blue: make() };
}

function opponent(p: Player): Player {
  return p === "yellow" ? "blue" : "yellow";
}

function createFlagUnit(owner: Player): UnitInstance {
  return { id: genId(), name: "Flag", owner, carryingFlag: false, cargo: [] };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useGameStore = create<GameState>()(
  immer((set, get) => ({
    // ---- initial state ----
    board: [],
    phase: "yellow_placement" as GamePhase,
    currentPlayer: "yellow" as Player,
    turnNumber: 0,
    selectedCell: null,
    validMoves: [],
    validAttacks: [],
    validLoadTargets: [],
    validUnloadTargets: [],
    selectedCargoIndex: null,
    placementInventory: { yellow: [], blue: [] },
    selectedPlacementUnit: null,
    moveHistory: [],
    eliminated: { yellow: [], blue: [] },
    lastBattle: null,
    showBattleModal: false,
    pendingLifeRaftEscape: null,
    pendingFlagReplacement: null,
    winner: null,
    placementErrors: [],
    showTurnTransition: false,

    // ======================================================================
    // initGame
    // ======================================================================
    initGame: () =>
      set((state) => {
        nextId = 1;
        state.board = buildEmptyBoard();
        state.phase = "yellow_placement";
        state.currentPlayer = "yellow";
        state.turnNumber = 0;
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;
        const inv = buildInventory();
        state.placementInventory = inv;
        state.selectedPlacementUnit = null;
        state.moveHistory = [];
        state.eliminated = { yellow: [], blue: [] };
        state.lastBattle = null;
        state.showBattleModal = false;
        state.pendingLifeRaftEscape = null;
        state.pendingFlagReplacement = null;
        state.winner = null;
        state.placementErrors = [];
        state.showTurnTransition = false;
      }),

    // ======================================================================
    // selectPlacementUnit
    // ======================================================================
    selectPlacementUnit: (name) =>
      set((state) => {
        state.selectedPlacementUnit = name;
        state.placementErrors = [];
      }),

    // ======================================================================
    // placeUnit
    // ======================================================================
    placeUnit: (row, col) =>
      set((state) => {
        const unitName = state.selectedPlacementUnit;
        if (!unitName) return;
        const player = state.currentPlayer;
        const inv = state.placementInventory[player];
        const entry = inv.find((e) => e.name === unitName);
        if (!entry || entry.remaining <= 0) return;

        // Validate placement cell
        const validCells = getValidPlacementCells(state.board as Cell[][], player, unitName);
        if (!validCells.some(([r, c]) => r === row && c === col)) return;

        const unit: UnitInstance = {
          id: genId(),
          name: unitName,
          owner: player,
          carryingFlag: false,
          cargo: [],
        };

        state.board[row][col].unit = unit;
        entry.remaining -= 1;
        state.placementErrors = [];
      }),

    // ======================================================================
    // removePlacedUnit
    // ======================================================================
    removePlacedUnit: (row, col) =>
      set((state) => {
        const cell = state.board[row][col];
        if (!cell.unit) return;
        if (cell.unit.owner !== state.currentPlayer) return;

        const unitName = cell.unit.name;
        const inv = state.placementInventory[state.currentPlayer];
        const entry = inv.find((e) => e.name === unitName);
        if (entry) entry.remaining += 1;

        cell.unit = null;
      }),

    // ======================================================================
    // finishPlacement
    // ======================================================================
    finishPlacement: () =>
      set((state) => {
        const player = state.currentPlayer;
        const inv = state.placementInventory[player];
        const allPlaced = inv.every((e) => e.remaining === 0);
        if (!allPlaced) {
          state.placementErrors = ["You must place all units before continuing."];
          return;
        }

        const result = validatePlacement(state.board as Cell[][], player);
        if (!result.valid) {
          state.placementErrors = result.errors;
          return;
        }

        state.placementErrors = [];
        state.selectedPlacementUnit = null;

        if (state.phase === "yellow_placement") {
          state.phase = "blue_placement";
          state.currentPlayer = "blue";
        } else if (state.phase === "blue_placement") {
          state.phase = "playing";
          state.currentPlayer = "yellow";
          state.turnNumber = 1;
        }
      }),

    // ======================================================================
    // selectCell
    // ======================================================================
    selectCell: (row, col) =>
      set((state) => {
        if (state.phase !== "playing") return;
        const cell = state.board[row][col];
        if (!cell.unit) return;
        if (cell.unit.owner !== state.currentPlayer) return;

        state.selectedCell = [row, col];
        state.selectedCargoIndex = null;
        state.validUnloadTargets = [];

        const unit = cell.unit as UnitInstance;
        state.validMoves = getValidMoves(
          state.board as Cell[][],
          unit,
          row,
          col,
          state.moveHistory as MoveRecord[]
        );
        state.validAttacks = getValidAttackTargets(
          state.board as Cell[][],
          unit,
          row,
          col
        );
        state.validLoadTargets = getLoadableAdjacentUnits(
          state.board as Cell[][],
          unit,
          row,
          col
        );
      }),

    // ======================================================================
    // deselectCell
    // ======================================================================
    deselectCell: () =>
      set((state) => {
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;
      }),

    // ======================================================================
    // executeMove
    // ======================================================================
    executeMove: (row, col) =>
      set((state) => {
        const sel = state.selectedCell;
        if (!sel) return;
        const [sr, sc] = sel;
        const unit = state.board[sr][sc].unit;
        if (!unit) return;

        // Move unit
        state.board[row][col].unit = unit;
        state.board[sr][sc].unit = null;

        // Record move
        state.moveHistory.push({
          unitId: unit.id,
          from: [sr, sc],
          to: [row, col],
        });

        // Check win: if unit carries flag and reaches opponent's island
        const opp = opponent(state.currentPlayer);
        if (unit.carryingFlag && isFootUnit(unit.name)) {
          if (checkWinCondition(state.board as Cell[][], opp)) {
            state.winner = opp;
            state.phase = "game_over";
          }
        }

        // Clear selection and end turn
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;

        // End turn
        if (!state.winner) {
          state.currentPlayer = opponent(state.currentPlayer);
          state.turnNumber += 1;
          state.showTurnTransition = true;
        }
      }),

    // ======================================================================
    // executeAttack
    // ======================================================================
    executeAttack: (row, col) =>
      set((state) => {
        const sel = state.selectedCell;
        if (!sel) return;
        const [sr, sc] = sel;
        const attacker = state.board[sr][sc].unit;
        const defender = state.board[row][col].unit;
        if (!attacker || !defender) return;

        const attackerTerrain = state.board[sr][sc].terrain;
        const defenderTerrain = state.board[row][col].terrain;

        const battleResult = resolveBattle(
          attacker as UnitInstance,
          defender as UnitInstance,
          attackerTerrain,
          defenderTerrain,
          [row, col]
        );

        state.lastBattle = battleResult;
        state.showBattleModal = true;

        const { outcome } = battleResult;

        // Helper to check if terrain is land
        const isLandTerrain = (t: string) => t === "L" || t === "I";

        if (outcome === "attacker_wins") {
          // Add defender to eliminated
          state.eliminated[defender.owner].push(defender as UnitInstance);

          // Special case: defender carrying flag on land -> flag drops, attacker STAYS
          if (defender.carryingFlag && isLandTerrain(defenderTerrain)) {
            // Flag drops at defender's position
            const flagUnit = createFlagUnit(defender.owner === "yellow" ? "blue" : "yellow");
            state.board[row][col].unit = flagUnit;
            // Attacker stays in original position (does NOT move)
            // board[sr][sc] already has attacker, nothing to do
          } else if (defender.name === "Flag") {
            // Attacker captures the flag
            attacker.carryingFlag = true;
            state.board[row][col].unit = attacker;
            state.board[sr][sc].unit = null;
          } else {
            // Normal: attacker moves to defender's cell
            state.board[row][col].unit = attacker;
            state.board[sr][sc].unit = null;
          }

          // Handle life raft escape
          if (battleResult.lifeRaftEscape) {
            state.pendingLifeRaftEscape = battleResult.lifeRaftEscape;
          }

          // Handle flag returned (cargo flag lost at sea)
          if (battleResult.flagReturned) {
            state.pendingFlagReplacement = battleResult.flagReturned;
          }
        } else if (outcome === "defender_wins") {
          // Add attacker to eliminated
          state.eliminated[attacker.owner].push(attacker as UnitInstance);

          // If attacker carries flag on land, flag drops at attacker's cell
          if (attacker.carryingFlag && isLandTerrain(attackerTerrain)) {
            const flagOwner: Player = attacker.owner === "yellow" ? "blue" : "yellow";
            const flagUnit = createFlagUnit(flagOwner);
            state.board[sr][sc].unit = flagUnit;
          } else {
            state.board[sr][sc].unit = null;
          }

          // Defender stays in place (including mines)

          // Handle life raft escape (if the attacker was a ship with cargo, unlikely but check)
          if (battleResult.lifeRaftEscape) {
            state.pendingLifeRaftEscape = battleResult.lifeRaftEscape;
          }

          if (battleResult.flagReturned) {
            state.pendingFlagReplacement = battleResult.flagReturned;
          }
        } else {
          // both_die
          state.eliminated[attacker.owner].push(attacker as UnitInstance);
          state.eliminated[defender.owner].push(defender as UnitInstance);

          // Handle flag drops for attacker
          if (attacker.carryingFlag && isLandTerrain(attackerTerrain)) {
            const flagOwner: Player = attacker.owner === "yellow" ? "blue" : "yellow";
            const flagUnit = createFlagUnit(flagOwner);
            state.board[sr][sc].unit = flagUnit;
          } else {
            state.board[sr][sc].unit = null;
          }

          // Handle flag drops for defender
          if (defender.carryingFlag && isLandTerrain(defenderTerrain)) {
            const flagOwner: Player = defender.owner === "yellow" ? "blue" : "yellow";
            const flagUnit = createFlagUnit(flagOwner);
            state.board[row][col].unit = flagUnit;
          } else {
            state.board[row][col].unit = null;
          }

          // Handle life raft escape
          if (battleResult.lifeRaftEscape) {
            state.pendingLifeRaftEscape = battleResult.lifeRaftEscape;
          }

          if (battleResult.flagReturned) {
            state.pendingFlagReplacement = battleResult.flagReturned;
          }
        }

        // Check win condition after attack
        const opp = opponent(state.currentPlayer);
        if (checkWinCondition(state.board as Cell[][], opp)) {
          state.winner = opp;
          state.phase = "game_over";
        }
        if (checkWinCondition(state.board as Cell[][], state.currentPlayer)) {
          state.winner = state.currentPlayer;
          state.phase = "game_over";
        }

        // Clear selection
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;
      }),

    // ======================================================================
    // executeLoad
    // ======================================================================
    executeLoad: (row, col) =>
      set((state) => {
        const sel = state.selectedCell;
        if (!sel) return;
        const [sr, sc] = sel;
        const transport = state.board[sr][sc].unit;
        const cargoUnit = state.board[row][col].unit;
        if (!transport || !cargoUnit) return;

        // Load cargo into transport
        transport.cargo.push(cargoUnit as UnitInstance);
        state.board[row][col].unit = null;

        // Clear selection and end turn
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;

        state.currentPlayer = opponent(state.currentPlayer);
        state.turnNumber += 1;
        state.showTurnTransition = true;
      }),

    // ======================================================================
    // selectCargoForUnload
    // ======================================================================
    selectCargoForUnload: (index) =>
      set((state) => {
        const sel = state.selectedCell;
        if (!sel) return;
        const [sr, sc] = sel;
        const transport = state.board[sr][sc].unit;
        if (!transport || !transport.cargo[index]) return;

        state.selectedCargoIndex = index;
        const cargoUnit = transport.cargo[index] as UnitInstance;
        state.validUnloadTargets = getUnloadTargets(
          state.board as Cell[][],
          cargoUnit,
          sr,
          sc
        );
      }),

    // ======================================================================
    // executeUnload
    // ======================================================================
    executeUnload: (row, col) =>
      set((state) => {
        const sel = state.selectedCell;
        if (!sel) return;
        const [sr, sc] = sel;
        const transport = state.board[sr][sc].unit;
        if (!transport || state.selectedCargoIndex === null) return;

        const cargoUnit = transport.cargo[state.selectedCargoIndex];
        if (!cargoUnit) return;

        // Remove from cargo
        transport.cargo.splice(state.selectedCargoIndex, 1);

        // Place on board
        state.board[row][col].unit = cargoUnit;

        // Clear selection and end turn
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;

        state.currentPlayer = opponent(state.currentPlayer);
        state.turnNumber += 1;
        state.showTurnTransition = true;
      }),

    // ======================================================================
    // resolveLifeRaftEscape
    // ======================================================================
    resolveLifeRaftEscape: (soldierIds, targetCell) =>
      set((state) => {
        const escape = state.pendingLifeRaftEscape;
        if (!escape) return;

        const raft = escape.raft as UnitInstance;

        // Clear raft cargo and add selected soldiers
        raft.cargo = [];
        const selected = escape.eligibleSoldiers.filter((s) =>
          soldierIds.includes(s.id)
        );
        for (const soldier of selected.slice(0, escape.maxEscapees)) {
          raft.cargo.push(soldier as UnitInstance);
        }

        // Place raft on the target sea cell
        const [tr, tc] = targetCell;
        state.board[tr][tc].unit = raft;

        state.pendingLifeRaftEscape = null;

        // If no other pending states, end turn
        if (!state.pendingFlagReplacement && !state.winner) {
          state.currentPlayer = opponent(state.currentPlayer);
          state.turnNumber += 1;
          state.showTurnTransition = true;
        }
      }),

    // ======================================================================
    // placeFlagAfterReturn
    // ======================================================================
    placeFlagAfterReturn: (row, col) =>
      set((state) => {
        const player = state.pendingFlagReplacement;
        if (!player) return;

        const terrain = getTerrain(row, col);
        if (terrain !== "L") return;
        if (state.board[row][col].unit !== null) return;

        // Ensure not on island
        const yellowIsland = getIslandCells("yellow");
        const blueIsland = getIslandCells("blue");
        const isIsland =
          yellowIsland.some(([r, c]) => r === row && c === col) ||
          blueIsland.some(([r, c]) => r === row && c === col);
        if (isIsland) return;

        const flagUnit = createFlagUnit(player);
        state.board[row][col].unit = flagUnit;

        state.pendingFlagReplacement = null;

        // End turn if no other pending states
        if (!state.pendingLifeRaftEscape && !state.winner) {
          state.currentPlayer = opponent(state.currentPlayer);
          state.turnNumber += 1;
          state.showTurnTransition = true;
        }
      }),

    // ======================================================================
    // dismissBattle
    // ======================================================================
    dismissBattle: () =>
      set((state) => {
        state.showBattleModal = false;

        // If no pending special states, end turn
        if (
          !state.pendingLifeRaftEscape &&
          !state.pendingFlagReplacement &&
          !state.winner
        ) {
          state.currentPlayer = opponent(state.currentPlayer);
          state.turnNumber += 1;
          state.showTurnTransition = true;
        }
      }),

    // ======================================================================
    // endTurn (public, can be called explicitly if needed)
    // ======================================================================
    endTurn: () =>
      set((state) => {
        state.currentPlayer = opponent(state.currentPlayer);
        state.turnNumber += 1;
        state.showTurnTransition = true;
        state.selectedCell = null;
        state.validMoves = [];
        state.validAttacks = [];
        state.validLoadTargets = [];
        state.validUnloadTargets = [];
        state.selectedCargoIndex = null;
      }),

    // ======================================================================
    // acknowledgeTurnTransition
    // ======================================================================
    acknowledgeTurnTransition: () =>
      set((state) => {
        state.showTurnTransition = false;
      }),
  }))
);
