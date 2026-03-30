import { getValidMoves, getValidAttackTargets } from "../engine/movement";
import { Cell, UnitInstance, MoveRecord, TerrainType } from "../engine/types";
import { getMap } from "../engine/map";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeBoard(): Cell[][] {
  const map = getMap();
  return map.map((row, r) =>
    row.map((terrain, c) => ({ row: r, col: c, terrain, unit: null }))
  );
}

let _unitCounter = 0;
function makeUnit(
  name: string,
  owner: "yellow" | "blue" = "yellow"
): UnitInstance {
  return {
    id: `${owner}-${name}-${_unitCounter++}`,
    name: name as any,
    owner,
    carryingFlag: false,
    cargo: [],
  };
}

// ─── 1. Foot unit orthogonal land/island moves ──────────────────────────────

describe("foot unit movement", () => {
  test("foot unit gets orthogonal land moves only (no diagonals)", () => {
    // row=3, col=8 is Land; neighbours: [2,8]=L, [4,8]=L, [3,7]=L, [3,9]=L
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[3][8].unit = unit;
    const moves = getValidMoves(board, unit, 3, 8, []);
    // All 4 orthogonal neighbours exist and are Land
    expect(moves).toHaveLength(4);
    // Verify no diagonal coordinates appear
    for (const [r, c] of moves) {
      const dr = Math.abs(r - 3);
      const dc = Math.abs(c - 8);
      expect(dr + dc).toBe(1); // orthogonal means dr+dc === 1
    }
  });

  test("foot unit blocked from moving to sea cell", () => {
    // row=2, col=5 is Land; neighbour [2,4]=S should be excluded
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[2][5].unit = unit;
    const moves = getValidMoves(board, unit, 2, 5, []);
    for (const [r, c] of moves) {
      expect(board[r][c].terrain).not.toBe("S");
    }
  });

  test("foot unit cannot move to occupied cell", () => {
    // row=3, col=8: surround all 4 neighbours with friendly units
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[3][8].unit = unit;
    board[2][8].unit = makeUnit("Samal");
    board[4][8].unit = makeUnit("Samal");
    board[3][7].unit = makeUnit("Samal");
    board[3][9].unit = makeUnit("Samal");
    const moves = getValidMoves(board, unit, 3, 8, []);
    expect(moves).toHaveLength(0);
  });

  test("no diagonal moves for foot unit", () => {
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[3][8].unit = unit;
    const moves = getValidMoves(board, unit, 3, 8, []);
    for (const [r, c] of moves) {
      // diagonal would have both row and col changed
      expect(r === 3 || c === 8).toBe(true);
    }
  });
});

// ─── 2. Navy Seal moves to sea ───────────────────────────────────────────────

describe("navy seal movement", () => {
  test("navy seal can move to sea cells", () => {
    // row=1, col=8 is Land; to its left [1,7]=S
    const board = makeBoard();
    const unit = makeUnit("Navy Seal");
    board[1][8].unit = unit;
    const moves = getValidMoves(board, unit, 1, 8, []);
    const terrains = moves.map(([r, c]) => board[r][c].terrain);
    expect(terrains).toContain("S");
  });
});

// ─── 3. Ship moves on sea only ───────────────────────────────────────────────

describe("ship movement", () => {
  test("ship moves to sea cells only", () => {
    // row=0, col=1 is Sea; neighbours [0,0]=S, [0,2]=S, [1,1]=S — all sea
    const board = makeBoard();
    const unit = makeUnit("Patrol Ship");
    board[0][1].unit = unit;
    const moves = getValidMoves(board, unit, 0, 1, []);
    for (const [r, c] of moves) {
      expect(board[r][c].terrain).toBe("S");
    }
    expect(moves.length).toBeGreaterThan(0);
  });

  test("ship cannot move to land cell", () => {
    // row=1, col=8 is Land; adjacent [0,8]=S, [2,8]=L, [1,7]=S, [1,9]=L
    const board = makeBoard();
    const unit = makeUnit("Patrol Ship");
    // Place ship on sea at [0,8]
    board[0][8].unit = unit;
    const moves = getValidMoves(board, unit, 0, 8, []);
    for (const [r, c] of moves) {
      expect(board[r][c].terrain).toBe("S");
    }
  });
});

// ─── 4. Plane moves unlimited with clear path ────────────────────────────────

describe("plane movement", () => {
  test("plane can move multiple squares in a straight line", () => {
    // row=0 is all Sea — plane at [0,0] should be able to reach [0,3] etc.
    const board = makeBoard();
    const unit = makeUnit("Fighter Plane");
    board[0][0].unit = unit;
    const moves = getValidMoves(board, unit, 0, 0, []);
    // Should include cells beyond just 1 step away
    const cols = moves.filter(([r]) => r === 0).map(([, c]) => c);
    expect(cols.length).toBeGreaterThan(1);
    // Should include [0,2] at minimum (2 squares right)
    expect(moves.some(([r, c]) => r === 0 && c === 2)).toBe(true);
  });

  test("plane is blocked by a unit in the path (cannot fly over)", () => {
    // row=0 all sea; place blocker at [0,2]; plane at [0,0]
    const board = makeBoard();
    const plane = makeUnit("Fighter Plane");
    const blocker = makeUnit("Patrol Ship", "blue");
    board[0][0].unit = plane;
    board[0][2].unit = blocker;
    const moves = getValidMoves(board, plane, 0, 0, []);
    // [0,1] should be reachable (clear), [0,2] and beyond should not
    expect(moves.some(([r, c]) => r === 0 && c === 1)).toBe(true);
    expect(moves.some(([r, c]) => r === 0 && c === 2)).toBe(false);
    expect(moves.some(([r, c]) => r === 0 && c === 3)).toBe(false);
  });
});

// ─── 5. Immobile unit has no moves ───────────────────────────────────────────

describe("immobile units", () => {
  test("land mine has no valid moves", () => {
    const board = makeBoard();
    const mine = makeUnit("Land mine");
    board[3][8].unit = mine;
    const moves = getValidMoves(board, mine, 3, 8, []);
    expect(moves).toHaveLength(0);
  });

  test("flag has no valid moves", () => {
    const board = makeBoard();
    const flag = makeUnit("Flag");
    board[3][8].unit = flag;
    const moves = getValidMoves(board, flag, 3, 8, []);
    expect(moves).toHaveLength(0);
  });
});

// ─── 6. Back-and-forth blocked after 4 moves ────────────────────────────────

describe("back-and-forth limit", () => {
  test("move is allowed before reaching 4 oscillations", () => {
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[3][9].unit = unit; // unit is currently at [3,9]
    // 3 moves between [3,8] and [3,9]
    const history: MoveRecord[] = [
      { unitId: unit.id, from: [3, 8], to: [3, 9] },
      { unitId: unit.id, from: [3, 9], to: [3, 8] },
      { unitId: unit.id, from: [3, 8], to: [3, 9] },
    ];
    // Currently at [3,9], want to go back to [3,8] — count is 3, should still be allowed
    const moves = getValidMoves(board, unit, 3, 9, history);
    expect(moves.some(([r, c]) => r === 3 && c === 8)).toBe(true);
  });

  test("back-and-forth is blocked after 4 moves between same two cells", () => {
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[3][8].unit = unit;
    // 4 moves between [3,8] and [3,9]
    const history: MoveRecord[] = [
      { unitId: unit.id, from: [3, 8], to: [3, 9] },
      { unitId: unit.id, from: [3, 9], to: [3, 8] },
      { unitId: unit.id, from: [3, 8], to: [3, 9] },
      { unitId: unit.id, from: [3, 9], to: [3, 8] },
    ];
    // Currently at [3,8], [3,9] should now be blocked
    const moves = getValidMoves(board, unit, 3, 8, history);
    expect(moves.some(([r, c]) => r === 3 && c === 9)).toBe(false);
  });

  test("back-and-forth limit does not affect other pairs of cells", () => {
    const board = makeBoard();
    const unit = makeUnit("Segen");
    board[3][8].unit = unit;
    // 4 moves between [3,8] and [3,9]
    const history: MoveRecord[] = [
      { unitId: unit.id, from: [3, 8], to: [3, 9] },
      { unitId: unit.id, from: [3, 9], to: [3, 8] },
      { unitId: unit.id, from: [3, 8], to: [3, 9] },
      { unitId: unit.id, from: [3, 9], to: [3, 8] },
    ];
    // [2,8] and [4,8] are unaffected by the [3,8]↔[3,9] oscillation
    const moves = getValidMoves(board, unit, 3, 8, history);
    expect(moves.some(([r, c]) => r === 2 && c === 8)).toBe(true);
  });
});

// ─── 7. Attack targets ───────────────────────────────────────────────────────

describe("attack targets", () => {
  test("attack targets include adjacent enemy unit", () => {
    const board = makeBoard();
    const attacker = makeUnit("Segen", "yellow");
    const enemy = makeUnit("Samal", "blue");
    board[3][8].unit = attacker;
    board[3][9].unit = enemy;
    const targets = getValidAttackTargets(board, attacker, 3, 8);
    expect(targets.some(([r, c]) => r === 3 && c === 9)).toBe(true);
  });

  test("attack targets exclude own units", () => {
    const board = makeBoard();
    const attacker = makeUnit("Segen", "yellow");
    const ally = makeUnit("Samal", "yellow");
    board[3][8].unit = attacker;
    board[3][9].unit = ally;
    const targets = getValidAttackTargets(board, attacker, 3, 8);
    expect(targets.some(([r, c]) => r === 3 && c === 9)).toBe(false);
  });

  test("no marine boundary attack: land unit cannot attack sea unit", () => {
    // row=1, col=8 Land; [0,8] is Sea
    const board = makeBoard();
    const footUnit = makeUnit("Segen", "yellow");
    const shipUnit = makeUnit("Patrol Ship", "blue");
    board[1][8].unit = footUnit;
    board[0][8].unit = shipUnit;
    const targets = getValidAttackTargets(board, footUnit, 1, 8);
    expect(targets.some(([r, c]) => r === 0 && c === 8)).toBe(false);
  });

  test("no marine boundary attack: sea unit cannot attack land unit", () => {
    // [0,8] Sea attacking [1,8] Land
    const board = makeBoard();
    const ship = makeUnit("Patrol Ship", "yellow");
    const footUnit = makeUnit("Segen", "blue");
    board[0][8].unit = ship;
    board[1][8].unit = footUnit;
    const targets = getValidAttackTargets(board, ship, 0, 8);
    expect(targets.some(([r, c]) => r === 1 && c === 8)).toBe(false);
  });

  test("immobile unit (flag) has no attack targets", () => {
    const board = makeBoard();
    const flag = makeUnit("Flag", "yellow");
    const enemy = makeUnit("Segen", "blue");
    board[3][8].unit = flag;
    board[3][9].unit = enemy;
    const targets = getValidAttackTargets(board, flag, 3, 8);
    expect(targets).toHaveLength(0);
  });

  test("land-to-land attack is valid", () => {
    const board = makeBoard();
    const attacker = makeUnit("Rav Aluf", "yellow");
    const defender = makeUnit("Aluf", "blue");
    board[3][8].unit = attacker;
    board[2][8].unit = defender;
    const targets = getValidAttackTargets(board, attacker, 3, 8);
    expect(targets.some(([r, c]) => r === 2 && c === 8)).toBe(true);
  });

  test("sea-to-sea attack is valid", () => {
    // [0,0] and [0,1] are both Sea
    const board = makeBoard();
    const ship1 = makeUnit("M7 Ship", "yellow");
    const ship2 = makeUnit("Patrol Ship", "blue");
    board[0][0].unit = ship1;
    board[0][1].unit = ship2;
    const targets = getValidAttackTargets(board, ship1, 0, 0);
    expect(targets.some(([r, c]) => r === 0 && c === 1)).toBe(true);
  });
});
