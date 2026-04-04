export type Player = 'yellow' | 'blue';

export type UnitCategory = 'foot' | 'naval' | 'aircraft' | 'immobile';

export type UnitTypeName =
  | 'Rav Aluf'
  | 'Aluf'
  | 'Sgan Aluf'
  | 'Rav Seren'
  | 'Seren'
  | 'Segen'
  | 'Rav Samal'
  | 'Samal'
  | 'Rav Turai'
  | 'Commando'
  | 'Navy Seal'
  | 'M7 Ship'
  | 'M4 Ship'
  | 'Patrol Ship'
  | 'Life Raft'
  | 'Fighter Plane'
  | 'Reconnaissance Plane'
  | 'Land mine'
  | 'Naval mine'
  | 'Flag';

export interface Cargo {
  soldiers: UnitInstance[];
  mines: UnitInstance[];
  ship: UnitInstance | null;
  plane: UnitInstance | null;
}

export interface UnitInstance {
  id: string;
  type: UnitTypeName;
  owner: Player;
  category: UnitCategory;
  rank: number | null;
  cargo: Cargo;
  carryingEnemyFlag: boolean;
  revealed: boolean;
}

export function emptyCargo(): Cargo {
  return { soldiers: [], mines: [], ship: null, plane: null };
}

export function cargoCount(cargo: Cargo): number {
  return (
    cargo.soldiers.length +
    cargo.mines.length +
    (cargo.ship ? 1 : 0) +
    (cargo.plane ? 1 : 0)
  );
}

export function totalCargoCount(cargo: Cargo): number {
  let count = cargo.soldiers.length + cargo.mines.length;
  if (cargo.ship) {
    count += 1 + totalCargoCount(cargo.ship.cargo);
  }
  if (cargo.plane) {
    count += 1 + totalCargoCount(cargo.plane.cargo);
  }
  return count;
}
