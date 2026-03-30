import { canLoadUnit, getCargoStats } from "../engine/loading";
import { UnitInstance } from "../engine/types";

let idCounter = 0;
function makeUnit(name: UnitInstance["name"], owner: UnitInstance["owner"] = "yellow", carryingFlag = false, cargo: UnitInstance[] = []): UnitInstance {
  return { id: `u${++idCounter}`, name, owner, carryingFlag, cargo };
}

describe("canLoadUnit", () => {
  // 1. M7 can load a soldier
  test("M7 can load a soldier", () => {
    const ship = makeUnit("M7 Ship");
    const soldier = makeUnit("Seren");
    expect(canLoadUnit(ship, soldier)).toBe(true);
  });

  // 2. M7 cannot exceed 4 soldiers
  test("M7 cannot load 5th soldier when at capacity", () => {
    const ship = makeUnit("M7 Ship", "yellow", false, [
      makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"),
    ]);
    const soldier = makeUnit("Segen");
    expect(canLoadUnit(ship, soldier)).toBe(false);
  });

  // 3. M7 with 4 soldiers can load empty Life Raft
  test("M7 with 4 soldiers can load an empty Life Raft", () => {
    const ship = makeUnit("M7 Ship", "yellow", false, [
      makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"),
    ]);
    const raft = makeUnit("Life Raft", "yellow", false, []);
    expect(canLoadUnit(ship, raft)).toBe(true);
  });

  // 4. M7 cannot load Life Raft with passengers if at soldier limit
  test("M7 cannot load Life Raft with 1 passenger when M7 already has 4 soldiers", () => {
    const ship = makeUnit("M7 Ship", "yellow", false, [
      makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"),
    ]);
    const raft = makeUnit("Life Raft", "yellow", false, [makeUnit("Segen")]);
    expect(canLoadUnit(ship, raft)).toBe(false);
  });

  // 5. Life Raft max 2 soldiers
  test("Life Raft cannot load a 3rd soldier", () => {
    const raft = makeUnit("Life Raft", "yellow", false, [makeUnit("Seren"), makeUnit("Seren")]);
    const soldier = makeUnit("Segen");
    expect(canLoadUnit(raft, soldier)).toBe(false);
  });

  // 6. Fighter Plane cannot carry flag
  test("Fighter Plane cannot load a soldier carrying the flag", () => {
    const plane = makeUnit("Fighter Plane");
    const flagSoldier = makeUnit("Seren", "yellow", true);
    expect(canLoadUnit(plane, flagSoldier)).toBe(false);
  });

  // 7. M7 can load Reconnaissance Plane
  test("M7 can load a Reconnaissance Plane", () => {
    const ship = makeUnit("M7 Ship");
    const plane = makeUnit("Reconnaissance Plane");
    expect(canLoadUnit(ship, plane)).toBe(true);
  });

  // 8. M4 cannot load a plane
  test("M4 cannot load a Reconnaissance Plane", () => {
    const ship = makeUnit("M4 Ship");
    const plane = makeUnit("Reconnaissance Plane");
    expect(canLoadUnit(ship, plane)).toBe(false);
  });

  // 9a. M7 can load 1 mine
  test("M7 can load a Naval mine", () => {
    const ship = makeUnit("M7 Ship");
    const mine = makeUnit("Naval mine");
    expect(canLoadUnit(ship, mine)).toBe(true);
  });

  // 9b. M7 cannot load 2 mines
  test("M7 cannot load a second mine when already carrying one", () => {
    const ship = makeUnit("M7 Ship", "yellow", false, [makeUnit("Naval mine")]);
    const mine = makeUnit("Land mine");
    expect(canLoadUnit(ship, mine)).toBe(false);
  });

  // 10. Patrol Ship cannot load another ship
  test("Patrol Ship cannot load a Life Raft", () => {
    const patrol = makeUnit("Patrol Ship");
    const raft = makeUnit("Life Raft");
    expect(canLoadUnit(patrol, raft)).toBe(false);
  });

  // 11. Soldier carrying flag counts as 1 slot
  test("Soldier carrying flag counts as 1 soldier slot in M7", () => {
    const ship = makeUnit("M7 Ship", "yellow", false, [
      makeUnit("Seren"), makeUnit("Seren"), makeUnit("Seren"),
    ]);
    const flagSoldier = makeUnit("Segen", "yellow", true);
    // 3 soldiers + 1 flag soldier = 4, should still fit
    expect(canLoadUnit(ship, flagSoldier)).toBe(true);
  });

  // 12. M7 can load Patrol Ship
  test("M7 can load a Patrol Ship", () => {
    const ship = makeUnit("M7 Ship");
    const patrol = makeUnit("Patrol Ship");
    expect(canLoadUnit(ship, patrol)).toBe(true);
  });
});

describe("getCargoStats", () => {
  test("empty cargo returns zeros", () => {
    const ship = makeUnit("M7 Ship");
    expect(getCargoStats(ship)).toEqual({ soldiers: 0, mines: 0, ships: 0, planes: 0, hasFlag: false });
  });

  test("nested Life Raft passengers count as soldiers in parent stats", () => {
    const raft = makeUnit("Life Raft", "yellow", false, [makeUnit("Seren"), makeUnit("Seren")]);
    const ship = makeUnit("M7 Ship", "yellow", false, [raft]);
    const stats = getCargoStats(ship);
    expect(stats.soldiers).toBe(2);
    expect(stats.ships).toBe(1);
  });

  test("flag carrier in nested raft propagates hasFlag", () => {
    const flagSoldier = makeUnit("Seren", "yellow", true);
    const raft = makeUnit("Life Raft", "yellow", false, [flagSoldier]);
    const ship = makeUnit("M7 Ship", "yellow", false, [raft]);
    const stats = getCargoStats(ship);
    expect(stats.hasFlag).toBe(true);
  });
});
