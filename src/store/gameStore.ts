import { create } from "zustand";
import {
  GameState,
  GamePhase,
  Player,
  PieceId,
  Position,
  UnitType,
  ActionType,
  Piece,
} from "../types";
import { parseMap } from "../engine/mapParser";
import {
  canPlacePiece,
  placePiece,
  getRemainingToPlace,
  validateSetupComplete,
  finalizeSetup,
  resetIdCounter,
} from "../engine/setup";
import { getValidMoves } from "../engine/movement";
import { canAttack } from "../engine/combat";
import { executeAction, GameAction } from "../engine/turnManager";
import {
  canLoad,
  getLoadableTargets,
  getUnloadPositions,
} from "../engine/transport";
import { TRANSPORT_CAPACITIES } from "../constants/units";

interface UIState {
  selectedPieceId: PieceId | null;
  validMoves: Position[];
  viewingPlayer: Player;
  setupSelectedUnit: UnitType | null;
  setupErrors: string[];
  lastCombat: {
    attackerType: UnitType;
    defenderType: UnitType;
    winner: "attacker" | "defender" | "draw";
    attackerOwner: Player;
    defenderOwner: Player;
  } | null;
  showPassDevice: boolean;
}

interface GameStore extends GameState, UIState {
  initGame: () => void;
  selectPiece: (pieceId: PieceId | null) => void;
  handleCellTap: (row: number, col: number) => void;
  setSetupUnit: (unitType: UnitType | null) => void;
  finishSetup: () => void;
  switchView: () => void;
  dismissPassDevice: () => void;
  dismissCombat: () => void;
  getRemainingUnits: () => Record<UnitType, number>;
}

const initialUIState: UIState = {
  selectedPieceId: null,
  validMoves: [],
  viewingPlayer: Player.Yellow,
  setupSelectedUnit: null,
  setupErrors: [],
  lastCombat: null,
  showPassDevice: false,
};

export const useGameStore = create<GameStore>()((set, get) => ({
  // Game state
  grid: [],
  piecesById: {},
  currentPhase: GamePhase.YellowSetup,
  currentPlayer: Player.Yellow,
  moveHistory: [],
  positionHistory: {},
  winner: null,
  pendingLifeRaftEscape: null,
  pendingFlagReturn: null,

  // UI state
  ...initialUIState,

  initGame: () => {
    resetIdCounter();
    const grid = parseMap();
    set({
      grid,
      piecesById: {},
      currentPhase: GamePhase.YellowSetup,
      currentPlayer: Player.Yellow,
      moveHistory: [],
      positionHistory: {},
      winner: null,
      pendingLifeRaftEscape: null,
      pendingFlagReturn: null,
      ...initialUIState,
    });
  },

  selectPiece: (pieceId) => {
    if (!pieceId) {
      set({ selectedPieceId: null, validMoves: [] });
      return;
    }
    const state = get();
    const piece = state.piecesById[pieceId];
    if (!piece || piece.owner !== state.currentPlayer) {
      set({ selectedPieceId: null, validMoves: [] });
      return;
    }

    const moves = getValidMoves(state, pieceId);
    set({ selectedPieceId: pieceId, validMoves: moves });
  },

  handleCellTap: (row, col) => {
    const state = get();

    // === Setup Phase ===
    if (
      state.currentPhase === GamePhase.YellowSetup ||
      state.currentPhase === GamePhase.BlueSetup
    ) {
      const owner = state.currentPlayer;
      const unitType = state.setupSelectedUnit;
      if (!unitType) return;

      if (canPlacePiece(state, unitType, owner, row, col)) {
        const remaining = getRemainingToPlace(state, owner);
        if ((remaining[unitType] || 0) <= 0) return;

        const newState = placePiece(state, unitType, owner, row, col);
        set({
          grid: newState.grid,
          piecesById: newState.piecesById,
          setupErrors: [],
        });
      }
      return;
    }

    // === Play Phase ===
    const { selectedPieceId, validMoves } = state;
    const cell = state.grid[row][col];

    if (!selectedPieceId) {
      // Select a piece
      if (cell.pieceId) {
        const piece = state.piecesById[cell.pieceId];
        if (piece.owner === state.currentPlayer) {
          get().selectPiece(cell.pieceId);
        }
      }
      return;
    }

    // Check if tapping on own piece (switch selection or load)
    if (cell.pieceId) {
      const targetPiece = state.piecesById[cell.pieceId];
      const selectedPiece = state.piecesById[selectedPieceId];

      // Tapping same piece — deselect
      if (cell.pieceId === selectedPieceId) {
        set({ selectedPieceId: null, validMoves: [] });
        return;
      }

      // Try to load: selected is transport, target is cargo
      if (
        targetPiece.owner === state.currentPlayer &&
        canLoad(state, selectedPieceId, cell.pieceId)
      ) {
        const action: GameAction = {
          type: ActionType.Load,
          pieceId: selectedPieceId,
          cargoId: cell.pieceId,
        };
        const newState = executeAction(state, action);
        set({
          ...newState,
          selectedPieceId: null,
          validMoves: [],
          showPassDevice: true,
          viewingPlayer: newState.currentPlayer,
        });
        return;
      }

      // Try attack if enemy
      if (targetPiece.owner !== state.currentPlayer) {
        const isValidTarget = validMoves.some(
          (m) => m.row === row && m.col === col
        );
        if (isValidTarget) {
          const attacker = state.piecesById[selectedPieceId];
          const action: GameAction = {
            type: ActionType.Attack,
            pieceId: selectedPieceId,
            targetPosition: { row, col },
          };
          const newState = executeAction(state, action);
          set({
            ...newState,
            selectedPieceId: null,
            validMoves: [],
            lastCombat: {
              attackerType: attacker.type,
              defenderType: targetPiece.type,
              winner:
                newState.piecesById[selectedPieceId]?.isAlive === false
                  ? newState.piecesById[cell.pieceId]?.isAlive === false
                    ? "draw"
                    : "defender"
                  : "attacker",
              attackerOwner: attacker.owner,
              defenderOwner: targetPiece.owner,
            },
            showPassDevice: false,
          });
          return;
        }
      }

      // Switch selection to a friendly piece
      if (targetPiece.owner === state.currentPlayer) {
        get().selectPiece(cell.pieceId);
        return;
      }
    }

    // Move to empty cell
    const isValidMove = validMoves.some(
      (m) => m.row === row && m.col === col
    );
    if (isValidMove) {
      const action: GameAction = {
        type: ActionType.Move,
        pieceId: selectedPieceId,
        targetPosition: { row, col },
      };
      const newState = executeAction(state, action);
      set({
        ...newState,
        selectedPieceId: null,
        validMoves: [],
        showPassDevice: true,
        viewingPlayer: newState.currentPlayer,
      });
    }
  },

  setSetupUnit: (unitType) => {
    set({ setupSelectedUnit: unitType });
  },

  finishSetup: () => {
    const state = get();
    const player = state.currentPlayer;
    const validation = validateSetupComplete(state, player);

    if (!validation.valid) {
      set({ setupErrors: validation.errors });
      return;
    }

    const newState = finalizeSetup(state);
    set({
      ...newState,
      setupSelectedUnit: null,
      setupErrors: [],
      viewingPlayer: newState.currentPlayer,
      showPassDevice:
        newState.currentPhase === GamePhase.BlueSetup,
    });
  },

  switchView: () => {
    const state = get();
    set({
      viewingPlayer:
        state.viewingPlayer === Player.Yellow
          ? Player.Blue
          : Player.Yellow,
    });
  },

  dismissPassDevice: () => {
    set({ showPassDevice: false });
  },

  dismissCombat: () => {
    const state = get();
    set({
      lastCombat: null,
      showPassDevice: true,
      viewingPlayer: state.currentPlayer,
    });
  },

  getRemainingUnits: () => {
    const state = get();
    return getRemainingToPlace(state, state.currentPlayer);
  },
}));
