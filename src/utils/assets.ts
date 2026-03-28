import { UnitType, Player } from "../types";
import { UNIT_ASSET_FILENAME } from "../constants/units";

export function getPieceImageUri(player: Player, unitType: UnitType): string {
  const filename = UNIT_ASSET_FILENAME[unitType];
  return `/pieces/${player}/${encodeURIComponent(filename)}`;
}

export function getBlankImageUri(player: Player): string {
  return `/pieces/${player}/blank.png`;
}
