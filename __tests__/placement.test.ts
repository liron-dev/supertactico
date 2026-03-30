import { getValidPlacementCells } from "../engine/placement";
import { validateIslandSpaces, validateFlagPath, validatePlacement } from "../engine/validation";
import { checkWinCondition } from "../engine/winCondition";
import { Cell, UnitInstance, Player, TerrainType } from "../engine/types";
import { getMap } from "../engine/map";

// Build a real board from MAP_DATA (no units)
function buildEmptyBoard(): Cell[][] {
  const map = getMap();
  return map.map((row, r) =>
    row.map((terrain, c) => ({ row: r, col: c, terrain, unit: null }))
  );
}

let idCounter = 0;
function makeUnit(name: UnitInstance["name"], owner: Player = "yellow", carryingFlag = false): UnitInstance {
  return { id: `u${++idCounter}`, name, owner, carryingFlag, cargo: [] };
}

function placeUnit(board: Cell[][], r: number, c: number, unit: UnitInstance) {
  board[r][c] = { ...board[r][c], unit };
}

// ── Placement tests ──────────────────────────────────────────────────────────

describe("getValidPlacementCells", () => {
  test("yellow foot unit: cells only in rows 0-8 with terrain L or I", () => {
    const board = buildEmptyBoard();
    const cells = getValidPlacementCells(board, "yellow", "Seren");
    // All returned coords must be in yellow rows (0-8)
    expect(cells.every(([r]) => r >= 0 && r <= 8)).toBe(true);
    // All returned coords must be land or island
    const map = getMap();
    expect(cells.every(([r, c]) => map[r][c] === "L" || map[r][c] === "I")).toBe(true);
    // There must be some results (rows 2-8 have land cells)
    expect(cells.length).toBeGreaterThan(0);
  });

  test("blue ship: cells only in rows 11-19 with terrain S", () => {
    const board = buildEmptyBoard();
    const cells = getValidPlacementCells(board, "blue", "Patrol Ship");
    expect(cells.every(([r]) => r >= 11 && r <= 19)).toBe(true);
    const map = getMap();
    expect(cells.every(([r, c]) => map[r][c] === "S")).toBe(true);
    expect(cells.length).toBeGreaterThan(0);
  });

  test("flag (immobile, startTerrain L/I) only on land in yellow rows 0-8", () => {
    const board = buildEmptyBoard();
    const cells = getValidPlacementCells(board, "yellow", "Flag");
    expect(cells.every(([r]) => r >= 0 && r <= 8)).toBe(true);
    const map = getMap();
    expect(cells.every(([r, c]) => map[r][c] === "L" || map[r][c] === "I")).toBe(true);
  });

  test("occupied cells are excluded from placement", () => {
    const board = buildEmptyBoard();
    // row 2, col 5 is "L" in yellow territory
    placeUnit(board, 2, 5, makeUnit("Seren"));
    const cells = getValidPlacementCells(board, "yellow", "Seren");
    expect(cells.some(([r, c]) => r === 2 && c === 5)).toBe(false);
  });

  test("yellow rows must not include row 9 or higher for foot units", () => {
    const board = buildEmptyBoard();
    const cells = getValidPlacementCells(board, "yellow", "Seren");
    expect(cells.every(([r]) => r <= 8)).toBe(true);
  });
});

// ── Validation tests ─────────────────────────────────────────────────────────

describe("validateIslandSpaces", () => {
  test("empty board passes island check (all 6 island cells free)", () => {
    const board = buildEmptyBoard();
    expect(validateIslandSpaces(board, "yellow")).toBe(true);
  });

  test("filling all 6 yellow island cells fails (0 empty)", () => {
    const board = buildEmptyBoard();
    // YELLOW_ISLAND_CELLS: [5,2],[6,2],[6,3],[7,2],[7,3],[7,4]
    [[5,2],[6,2],[6,3],[7,2],[7,3],[7,4]].forEach(([r, c]) =>
      placeUnit(board, r, c, makeUnit("Samal"))
    );
    expect(validateIslandSpaces(board, "yellow")).toBe(false);
  });

  test("3 empty island cells passes", () => {
    const board = buildEmptyBoard();
    // Fill 3 of 6
    [[5,2],[6,2],[6,3]].forEach(([r, c]) =>
      placeUnit(board, r, c, makeUnit("Samal"))
    );
    expect(validateIslandSpaces(board, "yellow")).toBe(true);
  });
});

describe("validateFlagPath", () => {
  test("flag with a free adjacent cell passes", () => {
    const board = buildEmptyBoard();
    // Place yellow flag at [5,2] (island terrain "I"), neighbor [5,3] is "S" (sea, no unit)
    placeUnit(board, 5, 2, makeUnit("Flag", "yellow"));
    expect(validateFlagPath(board, "yellow")).toBe(true);
  });

  test("flag surrounded by mines on all sides fails", () => {
    const board = buildEmptyBoard();
    // Place flag at row 7 col 8 (terrain "L", within rows 0-8)
    placeUnit(board, 7, 8, makeUnit("Flag", "yellow"));
    // Surround it: [6,8],[8,8],[7,7],[7,9]
    placeUnit(board, 6, 8, makeUnit("Land mine", "yellow"));
    placeUnit(board, 8, 8, makeUnit("Land mine", "yellow"));
    placeUnit(board, 7, 7, makeUnit("Land mine", "yellow"));
    placeUnit(board, 7, 9, makeUnit("Land mine", "yellow"));
    expect(validateFlagPath(board, "yellow")).toBe(false);
  });

  test("flag with one non-mine neighbor passes", () => {
    const board = buildEmptyBoard();
    // Place flag at [7,8]
    placeUnit(board, 7, 8, makeUnit("Flag", "yellow"));
    // Surround with mines on 3 sides but leave [8,8] free
    placeUnit(board, 6, 8, makeUnit("Land mine", "yellow"));
    placeUnit(board, 7, 7, makeUnit("Land mine", "yellow"));
    placeUnit(board, 7, 9, makeUnit("Land mine", "yellow"));
    expect(validateFlagPath(board, "yellow")).toBe(true);
  });

  test("returns false if no flag found for player", () => {
    const board = buildEmptyBoard();
    expect(validateFlagPath(board, "yellow")).toBe(false);
  });
});

describe("validatePlacement", () => {
  test("empty board returns valid for yellow (island spaces ok, flag path false)", () => {
    const board = buildEmptyBoard();
    const result = validatePlacement(board, "yellow");
    // No flag placed → flag path fails
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Your flag must have a viable path — it cannot be surrounded by mines on all sides.");
  });

  test("with flag and enough island space, returns valid", () => {
    const board = buildEmptyBoard();
    placeUnit(board, 5, 2, makeUnit("Flag", "yellow"));
    const result = validatePlacement(board, "yellow");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ── Win condition tests ───────────────────────────────────────────────────────

describe("checkWinCondition", () => {
  test("foot unit carrying flag on own island returns true", () => {
    const board = buildEmptyBoard();
    // YELLOW_ISLAND_CELLS[0] = [5,2]
    placeUnit(board, 5, 2, makeUnit("Seren", "yellow", true));
    expect(checkWinCondition(board, "yellow")).toBe(true);
  });

  test("foot unit WITHOUT flag on own island returns false", () => {
    const board = buildEmptyBoard();
    placeUnit(board, 5, 2, makeUnit("Seren", "yellow", false));
    expect(checkWinCondition(board, "yellow")).toBe(false);
  });

  test("foot unit with flag NOT on own island returns false", () => {
    const board = buildEmptyBoard();
    // Row 3 col 5 is "L" but not island
    placeUnit(board, 3, 5, makeUnit("Seren", "yellow", true));
    expect(checkWinCondition(board, "yellow")).toBe(false);
  });

  test("enemy unit with flag on yellow island does not count as yellow win", () => {
    const board = buildEmptyBoard();
    placeUnit(board, 5, 2, makeUnit("Seren", "blue", true));
    expect(checkWinCondition(board, "yellow")).toBe(false);
  });

  test("blue foot unit with flag on blue island returns true", () => {
    const board = buildEmptyBoard();
    // BLUE_ISLAND_CELLS[0] = [12,2]
    placeUnit(board, 12, 2, makeUnit("Samal", "blue", true));
    expect(checkWinCondition(board, "blue")).toBe(true);
  });
});
