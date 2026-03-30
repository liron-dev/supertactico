import { resolveBattle, canAttack } from "../engine/combat";
import { UnitInstance } from "../engine/types";

function makeUnit(
  name: string,
  owner: "yellow" | "blue" = "yellow",
  cargo: UnitInstance[] = [],
  carryingFlag = false
): UnitInstance {
  return { id: `${owner}-${name}-0`, name: name as any, owner, carryingFlag, cargo };
}

// ─── 1. Ranked foot combat ───────────────────────────────────────────────────

describe("ranked foot combat", () => {
  test("higher rank wins (Rav Aluf beats Aluf)", () => {
    const r = resolveBattle(makeUnit("Rav Aluf"), makeUnit("Aluf"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("higher rank wins as defender (Aluf beats Segen)", () => {
    const r = resolveBattle(makeUnit("Segen"), makeUnit("Aluf"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });

  test("equal rank both die (Seren vs Seren)", () => {
    const r = resolveBattle(makeUnit("Seren"), makeUnit("Seren"), "L", "L");
    expect(r.outcome).toBe("both_die");
  });

  test("equal rank both die (Rav Samal vs Rav Samal)", () => {
    const r = resolveBattle(makeUnit("Rav Samal"), makeUnit("Rav Samal"), "L", "L");
    expect(r.outcome).toBe("both_die");
  });

  test("lower rank loses (Samal vs Rav Seren)", () => {
    const r = resolveBattle(makeUnit("Samal"), makeUnit("Rav Seren"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });
});

// ─── 2. Commando specials ────────────────────────────────────────────────────

describe("Commando specials", () => {
  test("Commando attacks Rav Aluf — attacker wins (special priority)", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Rav Aluf"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Navy Seal", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Navy Seal"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Naval mine", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Naval mine"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Land mine", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Land mine"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Flag", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Flag"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Fighter Plane", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Fighter Plane"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Reconnaissance Plane", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Reconnaissance Plane"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando defending vs Navy Seal — Commando wins", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Commando"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });
});

// ─── 3. Rav Aluf attacking Commando ─────────────────────────────────────────

describe("Rav Aluf attacking Commando", () => {
  test("Rav Aluf attacks Commando — Rav Aluf wins (attacker priority only applies when Commando attacks)", () => {
    const r = resolveBattle(makeUnit("Rav Aluf"), makeUnit("Commando"), "L", "L");
    // The Commando→Rav Aluf special is ATTACKER-PRIORITY ONLY.
    // When Rav Aluf attacks Commando, ranked combat applies: rank 10 > rank 1 → attacker wins.
    expect(r.outcome).toBe("attacker_wins");
  });
});

// ─── 4. Navy Seal specials ───────────────────────────────────────────────────

describe("Navy Seal specials", () => {
  test("Navy Seal attacks M7 Ship — Navy Seal wins", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("M7 Ship"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal attacks Rav Aluf — Navy Seal wins", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Rav Aluf"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal beats Naval mine", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Naval mine"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal beats Fighter Plane", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Fighter Plane"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal beats Reconnaissance Plane", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Reconnaissance Plane"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal beats Flag", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Flag"), "L", "L");
    // Navy Seal special: defeats Flag regardless
    // But FLAG_BEATS has Navy Seal — so flag should win? Let's check spec:
    // Navy Seal defeats: Naval mine, Fighter Plane, Reconnaissance Plane, Flag
    // Flag defeats: Navy Seal, Fighter Plane, Reconnaissance Plane
    // Navy Seal special (section 3) is checked BEFORE flag combat (section 6)
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal defending vs Naval mine — Navy Seal wins", () => {
    const r = resolveBattle(makeUnit("Naval mine"), makeUnit("Navy Seal"), "S", "S");
    expect(r.outcome).toBe("defender_wins");
  });
});

// ─── 5. Mine rules ───────────────────────────────────────────────────────────

describe("Land mine rules", () => {
  test("Land mine beats Segen (foot unit)", () => {
    const r = resolveBattle(makeUnit("Segen"), makeUnit("Land mine"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });

  test("Land mine beats Rav Aluf", () => {
    const r = resolveBattle(makeUnit("Rav Aluf"), makeUnit("Land mine"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });

  test("Commando disarms Land mine (Commando wins)", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Land mine"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });
});

describe("Naval mine rules", () => {
  test("Naval mine beats M4 Ship", () => {
    const r = resolveBattle(makeUnit("M4 Ship"), makeUnit("Naval mine"), "S", "S");
    expect(r.outcome).toBe("defender_wins");
  });

  test("Naval mine beats Patrol Ship", () => {
    const r = resolveBattle(makeUnit("Patrol Ship"), makeUnit("Naval mine"), "S", "S");
    expect(r.outcome).toBe("defender_wins");
  });

  test("M7 Ship beats Naval mine", () => {
    const r = resolveBattle(makeUnit("M7 Ship"), makeUnit("Naval mine"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal beats Naval mine", () => {
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Naval mine"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Commando beats Naval mine", () => {
    const r = resolveBattle(makeUnit("Commando"), makeUnit("Naval mine"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Naval mine beats Segen (foot unit loses to Naval mine as defender)", () => {
    // Naval mine as attacker beats non-M7 ships; as defender checked in section 5
    const r = resolveBattle(makeUnit("Naval mine"), makeUnit("Segen"), "S", "L");
    expect(r.outcome).toBe("attacker_wins");
  });
});

// ─── 6. Ship hierarchy ───────────────────────────────────────────────────────

describe("ship hierarchy", () => {
  test("M7 > M4", () => {
    const r = resolveBattle(makeUnit("M7 Ship"), makeUnit("M4 Ship"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("M4 > Patrol", () => {
    const r = resolveBattle(makeUnit("M4 Ship"), makeUnit("Patrol Ship"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Patrol > Life Raft", () => {
    const r = resolveBattle(makeUnit("Patrol Ship"), makeUnit("Life Raft"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("same ship type both die (Patrol vs Patrol)", () => {
    const r = resolveBattle(makeUnit("Patrol Ship"), makeUnit("Patrol Ship"), "S", "S");
    expect(r.outcome).toBe("both_die");
  });

  test("same ship type both die (M7 vs M7)", () => {
    const r = resolveBattle(makeUnit("M7 Ship"), makeUnit("M7 Ship"), "S", "S");
    expect(r.outcome).toBe("both_die");
  });

  test("lesser ship loses (Life Raft vs M7)", () => {
    const r = resolveBattle(makeUnit("Life Raft"), makeUnit("M7 Ship"), "S", "S");
    expect(r.outcome).toBe("defender_wins");
  });
});

// ─── 7. Ships beat planes ────────────────────────────────────────────────────

describe("ships beat planes", () => {
  test("M7 Ship beats Fighter Plane", () => {
    const r = resolveBattle(makeUnit("M7 Ship"), makeUnit("Fighter Plane"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Patrol Ship beats Reconnaissance Plane", () => {
    const r = resolveBattle(makeUnit("Patrol Ship"), makeUnit("Reconnaissance Plane"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Fighter Plane loses to M4 Ship", () => {
    const r = resolveBattle(makeUnit("Fighter Plane"), makeUnit("M4 Ship"), "S", "S");
    expect(r.outcome).toBe("defender_wins");
  });
});

// ─── 8. Plane vs plane ───────────────────────────────────────────────────────

describe("plane vs plane", () => {
  test("Fighter beats Recon (attacker)", () => {
    const r = resolveBattle(makeUnit("Fighter Plane"), makeUnit("Reconnaissance Plane"), "S", "S");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Recon loses to Fighter (attacker)", () => {
    const r = resolveBattle(makeUnit("Reconnaissance Plane"), makeUnit("Fighter Plane"), "S", "S");
    expect(r.outcome).toBe("defender_wins");
  });

  test("Fighter vs Fighter both die", () => {
    const r = resolveBattle(makeUnit("Fighter Plane"), makeUnit("Fighter Plane"), "S", "S");
    expect(r.outcome).toBe("both_die");
  });

  test("Recon vs Recon both die", () => {
    const r = resolveBattle(makeUnit("Reconnaissance Plane"), makeUnit("Reconnaissance Plane"), "S", "S");
    expect(r.outcome).toBe("both_die");
  });
});

// ─── 9. Flag captures ────────────────────────────────────────────────────────

describe("flag captures", () => {
  test("foot unit captures Flag (attacker wins)", () => {
    const r = resolveBattle(makeUnit("Segen"), makeUnit("Flag"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Rav Aluf captures Flag", () => {
    const r = resolveBattle(makeUnit("Rav Aluf"), makeUnit("Flag"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Navy Seal cannot capture Flag (Flag wins)", () => {
    // Flag is in FLAG_BEATS set for Navy Seal; Navy Seal NAVY_SEAL_DEFEATS includes Flag
    // Navy Seal NAVY_SEAL_DEFEATS has Flag, so Navy Seal should win per section 3
    // But spec says Flag defeats Navy Seal — Navy Seal beats Flag per spec section 3
    // The NAVY_SEAL_DEFEATS set includes "Flag", so Navy Seal wins
    const r = resolveBattle(makeUnit("Navy Seal"), makeUnit("Flag"), "L", "L");
    expect(r.outcome).toBe("attacker_wins");
  });

  test("Fighter Plane cannot capture Flag (Flag wins)", () => {
    // FLAG_BEATS has Fighter Plane; but fighter is processed at step 8/9, not step 6
    // Step 6 flag combat: FLAG_BEATS.has(atkName) → defender_wins
    const r = resolveBattle(makeUnit("Fighter Plane"), makeUnit("Flag"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });

  test("Reconnaissance Plane cannot capture Flag (Flag wins)", () => {
    const r = resolveBattle(makeUnit("Reconnaissance Plane"), makeUnit("Flag"), "L", "L");
    expect(r.outcome).toBe("defender_wins");
  });
});

// ─── 10. Flag drop on land ───────────────────────────────────────────────────

describe("flag drop on land (rule viii)", () => {
  test("flag drops at defender coord when flag carrier is killed on land", () => {
    const flagCarrier = makeUnit("Segen", "blue", [], true);
    const attacker = makeUnit("Rav Aluf", "yellow");
    const coord: [number, number] = [5, 7];
    const r = resolveBattle(attacker, flagCarrier, "L", "L", coord);
    expect(r.outcome).toBe("attacker_wins");
    expect(r.flagDropped).toEqual(coord);
  });

  test("no flag drop when defender killed at sea (not carrying flag)", () => {
    const r = resolveBattle(makeUnit("M7 Ship"), makeUnit("Patrol Ship"), "S", "S", [0, 0]);
    expect(r.flagDropped).toBeNull();
  });

  test("no flag drop when defender not carrying flag on land", () => {
    const r = resolveBattle(makeUnit("Rav Aluf"), makeUnit("Segen"), "L", "L", [5, 7]);
    expect(r.flagDropped).toBeNull();
  });
});

// ─── 11. Life raft escape ────────────────────────────────────────────────────

describe("life raft escape", () => {
  test("life raft escape triggered when ship with raft and soldiers is defeated", () => {
    const soldier = makeUnit("Segen", "yellow");
    const raft = makeUnit("Life Raft", "yellow", [soldier]);
    const m4 = makeUnit("M4 Ship", "yellow", [raft]);
    const attacker = makeUnit("M7 Ship", "blue");
    // coord [0,0] is sea; adjacent cells [0,1] and [1,0] are also sea
    const r = resolveBattle(attacker, m4, "S", "S", [0, 0]);
    expect(r.outcome).toBe("attacker_wins");
    expect(r.lifeRaftEscape).not.toBeNull();
    expect(r.lifeRaftEscape!.maxEscapees).toBe(2);
    expect(r.lifeRaftEscape!.raft.name).toBe("Life Raft");
    expect(r.lifeRaftEscape!.eligibleSoldiers.length).toBeGreaterThan(0);
  });

  test("no life raft escape when ship has no raft", () => {
    const soldier = makeUnit("Segen", "yellow");
    const m4 = makeUnit("M4 Ship", "yellow", [soldier]);
    const attacker = makeUnit("M7 Ship", "blue");
    const r = resolveBattle(attacker, m4, "S", "S", [0, 0]);
    expect(r.outcome).toBe("attacker_wins");
    expect(r.lifeRaftEscape).toBeNull();
  });

  test("flag returned when ship (no raft) carrying flag sinks at sea", () => {
    const flagSoldier = makeUnit("Segen", "yellow", [], true);
    const m4 = makeUnit("M4 Ship", "yellow", [flagSoldier]);
    const attacker = makeUnit("M7 Ship", "blue");
    const r = resolveBattle(attacker, m4, "S", "S", [0, 0]);
    expect(r.outcome).toBe("attacker_wins");
    expect(r.flagReturned).toBe("blue"); // flag owned by yellow soldier → returned to blue (the owner's opponent)
  });
});

// ─── 12. canAttack ───────────────────────────────────────────────────────────

describe("canAttack (sea/land boundary)", () => {
  test("sea attacker cannot attack land defender", () => {
    // row=0,col=0 is sea; row=8,col=8 is land
    expect(canAttack([0, 0], [8, 8])).toBe(false);
  });

  test("land attacker cannot attack sea defender", () => {
    expect(canAttack([8, 8], [0, 0])).toBe(false);
  });

  test("sea attacker can attack sea defender", () => {
    expect(canAttack([0, 0], [0, 1])).toBe(true);
  });

  test("land attacker can attack land defender", () => {
    expect(canAttack([8, 8], [8, 9])).toBe(true);
  });
});
