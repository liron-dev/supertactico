// Static require() barrel - Metro needs string literals, no dynamic strings
import { Player, UnitType } from './types';

type ImageMap = Record<string, any>;

const blueImages: ImageMap = {
  'Aluf':                 require('../../assets/images/blue/Aluf.png'),
  'blank':                require('../../assets/images/blue/blank.png'),
  'Commando':             require('../../assets/images/blue/Commando.png'),
  'Fighter Plane':        require('../../assets/images/blue/Fighter Plane.png'),
  'Flag':                 require('../../assets/images/blue/Flag.png'),
  'Land mine':            require('../../assets/images/blue/Land mine.png'),
  'Life Raft':            require('../../assets/images/blue/Life Raft.png'),
  'M4 Ship':              require('../../assets/images/blue/M4 Ship.png'),
  'M7 Ship':              require('../../assets/images/blue/M7 Ship.png'),
  'Naval mine':           require('../../assets/images/blue/Naval mine.png'),
  'Navy Seal':            require('../../assets/images/blue/Navy Seal.png'),
  'Patrol Ship':          require('../../assets/images/blue/Patrol Ship.png'),
  'Rav Aluf':             require('../../assets/images/blue/Rav Aluf.png'),
  'Rav Samal':            require('../../assets/images/blue/Rav Samal.png'),
  'Rav Seren':            require('../../assets/images/blue/Rav Seren.png'),
  'Rav Turai':            require('../../assets/images/blue/Rav Turai.png'),
  'Reconnaissance Plane': require('../../assets/images/blue/Reconnaissance Plane.png'),
  'Samal':                require('../../assets/images/blue/Samal.png'),
  'Segen':                require('../../assets/images/blue/Segen.png'),
  'Seren':                require('../../assets/images/blue/Seren.png'),
  'Sgan Aluf':            require('../../assets/images/blue/Sgan Aluf.png'),
};

const yellowImages: ImageMap = {
  'Aluf':                 require('../../assets/images/yellow/Aluf.png'),
  'blank':                require('../../assets/images/yellow/blank.png'),
  'Commando':             require('../../assets/images/yellow/Commando.png'),
  'Fighter Plane':        require('../../assets/images/yellow/Fighter Plane.png'),
  'Flag':                 require('../../assets/images/yellow/Flag.png'),
  'Land mine':            require('../../assets/images/yellow/Land mine.png'),
  'Life Raft':            require('../../assets/images/yellow/Life Raft.png'),
  'M4 Ship':              require('../../assets/images/yellow/M4 Ship.png'),
  'M7 Ship':              require('../../assets/images/yellow/M7 Ship.png'),
  'Naval mine':           require('../../assets/images/yellow/Naval mine.png'),
  'Navy Seal':            require('../../assets/images/yellow/Navy Seal.png'),
  'Patrol Ship':          require('../../assets/images/yellow/Patrol Ship.png'),
  'Rav Aluf':             require('../../assets/images/yellow/Rav Aluf.png'),
  'Rav Samal':            require('../../assets/images/yellow/Rav Samal.png'),
  'Rav Seren':            require('../../assets/images/yellow/Rav Seren.png'),
  'Rav Turai':            require('../../assets/images/yellow/Rav Turai.png'),
  'Reconnaissance Plane': require('../../assets/images/yellow/Reconnaissance Plane.png'),
  'Samal':                require('../../assets/images/yellow/Samal.png'),
  'Segen':                require('../../assets/images/yellow/Segen.png'),
  'Seren':                require('../../assets/images/yellow/Seren.png'),
  'Sgan Aluf':            require('../../assets/images/yellow/Sgan Aluf.png'),
};

export const unitImages: Record<Player, ImageMap> = {
  blue: blueImages,
  yellow: yellowImages,
};

export function getUnitImage(player: Player, type: UnitType | 'blank'): any {
  return unitImages[player][type] ?? unitImages[player]['blank'];
}
