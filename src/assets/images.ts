import { Player } from '../types/game';

const blueImages: Record<string, any> = {
  'Rav Aluf': require('../../images-blue/Rav Aluf.png'),
  'Aluf': require('../../images-blue/Aluf.png'),
  'Sgan Aluf': require('../../images-blue/Sgan Aluf.png'),
  'Rav Seren': require('../../images-blue/Rav Seren.png'),
  'Seren': require('../../images-blue/Seren.png'),
  'Segen': require('../../images-blue/Segen.png'),
  'Rav Samal': require('../../images-blue/Rav Samal.png'),
  'Samal': require('../../images-blue/Samal.png'),
  'Rav Turai': require('../../images-blue/Rav Turai.png'),
  'Commando': require('../../images-blue/Commando.png'),
  'Navy Seal': require('../../images-blue/Navy Seal.png'),
  'M7 Ship': require('../../images-blue/M7 Ship.png'),
  'M4 Ship': require('../../images-blue/M4 Ship.png'),
  'Patrol Ship': require('../../images-blue/Patrol Ship.png'),
  'Life Raft': require('../../images-blue/Life Raft.png'),
  'Fighter Plane': require('../../images-blue/Fighter Plane.png'),
  'Reconnaissance Plane': require('../../images-blue/Reconnaissance Plane.png'),
  'Land mine': require('../../images-blue/Land mine.png'),
  'Naval mine': require('../../images-blue/Naval mine.png'),
  'Flag': require('../../images-blue/Flag.png'),
  'blank': require('../../images-blue/blank.png'),
};

const yellowImages: Record<string, any> = {
  'Rav Aluf': require('../../images-yellow/Rav Aluf.png'),
  'Aluf': require('../../images-yellow/Aluf.png'),
  'Sgan Aluf': require('../../images-yellow/Sgan Aluf.png'),
  'Rav Seren': require('../../images-yellow/Rav Seren.png'),
  'Seren': require('../../images-yellow/Seren.png'),
  'Segen': require('../../images-yellow/Segen.png'),
  'Rav Samal': require('../../images-yellow/Rav Samal.png'),
  'Samal': require('../../images-yellow/Samal.png'),
  'Rav Turai': require('../../images-yellow/Rav Turai.png'),
  'Commando': require('../../images-yellow/Commando.png'),
  'Navy Seal': require('../../images-yellow/Navy Seal.png'),
  'M7 Ship': require('../../images-yellow/M7 Ship.png'),
  'M4 Ship': require('../../images-yellow/M4 Ship.png'),
  'Patrol Ship': require('../../images-yellow/Patrol Ship.png'),
  'Life Raft': require('../../images-yellow/Life Raft.png'),
  'Fighter Plane': require('../../images-yellow/Fighter Plane.png'),
  'Reconnaissance Plane': require('../../images-yellow/Reconnaissance Plane.png'),
  'Land mine': require('../../images-yellow/Land mine.png'),
  'Naval mine': require('../../images-yellow/Naval mine.png'),
  'Flag': require('../../images-yellow/Flag.png'),
  'blank': require('../../images-yellow/blank.png'),
};

export const PIECE_IMAGES: Record<Player, Record<string, any>> = {
  blue: blueImages,
  yellow: yellowImages,
};

export function getPieceImage(unitName: string, player: Player): any {
  return PIECE_IMAGES[player][unitName] || PIECE_IMAGES[player]['blank'];
}

export function getBlankImage(player: Player): any {
  return PIECE_IMAGES[player]['blank'];
}
