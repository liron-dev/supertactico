import { Player, UnitTypeName } from '../types/unit';

// Static require map for all unit images
// React Native requires static imports for bundled images

const BLUE_IMAGES: Record<string, any> = {
  'Rav Aluf': require('../../assets/images-blue/Rav Aluf.png'),
  'Aluf': require('../../assets/images-blue/Aluf.png'),
  'Sgan Aluf': require('../../assets/images-blue/Sgan Aluf.png'),
  'Rav Seren': require('../../assets/images-blue/Rav Seren.png'),
  'Seren': require('../../assets/images-blue/Seren.png'),
  'Segen': require('../../assets/images-blue/Segen.png'),
  'Rav Samal': require('../../assets/images-blue/Rav Samal.png'),
  'Samal': require('../../assets/images-blue/Samal.png'),
  'Rav Turai': require('../../assets/images-blue/Rav Turai.png'),
  'Commando': require('../../assets/images-blue/Commando.png'),
  'Navy Seal': require('../../assets/images-blue/Navy Seal.png'),
  'M7 Ship': require('../../assets/images-blue/M7 Ship.png'),
  'M4 Ship': require('../../assets/images-blue/M4 Ship.png'),
  'Patrol Ship': require('../../assets/images-blue/Patrol Ship.png'),
  'Life Raft': require('../../assets/images-blue/Life Raft.png'),
  'Fighter Plane': require('../../assets/images-blue/Fighter Plane.png'),
  'Reconnaissance Plane': require('../../assets/images-blue/Reconnaissance Plane.png'),
  'Land mine': require('../../assets/images-blue/Land mine.png'),
  'Naval mine': require('../../assets/images-blue/Naval mine.png'),
  'Flag': require('../../assets/images-blue/Flag.png'),
  'blank': require('../../assets/images-blue/blank.png'),
};

const YELLOW_IMAGES: Record<string, any> = {
  'Rav Aluf': require('../../assets/images-yellow/Rav Aluf.png'),
  'Aluf': require('../../assets/images-yellow/Aluf.png'),
  'Sgan Aluf': require('../../assets/images-yellow/Sgan Aluf.png'),
  'Rav Seren': require('../../assets/images-yellow/Rav Seren.png'),
  'Seren': require('../../assets/images-yellow/Seren.png'),
  'Segen': require('../../assets/images-yellow/Segen.png'),
  'Rav Samal': require('../../assets/images-yellow/Rav Samal.png'),
  'Samal': require('../../assets/images-yellow/Samal.png'),
  'Rav Turai': require('../../assets/images-yellow/Rav Turai.png'),
  'Commando': require('../../assets/images-yellow/Commando.png'),
  'Navy Seal': require('../../assets/images-yellow/Navy Seal.png'),
  'M7 Ship': require('../../assets/images-yellow/M7 Ship.png'),
  'M4 Ship': require('../../assets/images-yellow/M4 Ship.png'),
  'Patrol Ship': require('../../assets/images-yellow/Patrol Ship.png'),
  'Life Raft': require('../../assets/images-yellow/Life Raft.png'),
  'Fighter Plane': require('../../assets/images-yellow/Fighter Plane.png'),
  'Reconnaissance Plane': require('../../assets/images-yellow/Reconnaissance Plane.png'),
  'Land mine': require('../../assets/images-yellow/Land mine.png'),
  'Naval mine': require('../../assets/images-yellow/Naval mine.png'),
  'Flag': require('../../assets/images-yellow/Flag.png'),
  'blank': require('../../assets/images-yellow/blank.png'),
};

export function getUnitImage(type: UnitTypeName, owner: Player): any {
  const images = owner === 'blue' ? BLUE_IMAGES : YELLOW_IMAGES;
  return images[type];
}

export function getBlankImage(owner: Player): any {
  const images = owner === 'blue' ? BLUE_IMAGES : YELLOW_IMAGES;
  return images['blank'];
}
