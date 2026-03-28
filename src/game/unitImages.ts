import { ImageSourcePropType } from "react-native";
import { Player, UnitType } from "./types";

type ImageSource = ImageSourcePropType;

const blueImages: Record<UnitType, ImageSource> = {
  "Rav Aluf": require("../../assets/images/blue/Rav Aluf.png"),
  "Aluf": require("../../assets/images/blue/Aluf.png"),
  "Sgan Aluf": require("../../assets/images/blue/Sgan Aluf.png"),
  "Rav Seren": require("../../assets/images/blue/Rav Seren.png"),
  "Seren": require("../../assets/images/blue/Seren.png"),
  "Segen": require("../../assets/images/blue/Segen.png"),
  "Rav Samal": require("../../assets/images/blue/Rav Samal.png"),
  "Samal": require("../../assets/images/blue/Samal.png"),
  "Rav Turai": require("../../assets/images/blue/Rav Turai.png"),
  "Commando": require("../../assets/images/blue/Commando.png"),
  "Navy Seal": require("../../assets/images/blue/Navy Seal.png"),
  "M7 Ship": require("../../assets/images/blue/M7 Ship.png"),
  "M4 Ship": require("../../assets/images/blue/M4 Ship.png"),
  "Patrol Ship": require("../../assets/images/blue/Patrol Ship.png"),
  "Life Raft": require("../../assets/images/blue/Life Raft.png"),
  "Fighter Plane": require("../../assets/images/blue/Fighter Plane.png"),
  "Reconnaissance Plane": require("../../assets/images/blue/Reconnaissance Plane.png"),
  "Land mine": require("../../assets/images/blue/Land mine.png"),
  "Naval mine": require("../../assets/images/blue/Naval mine.png"),
  "Flag": require("../../assets/images/blue/Flag.png"),
};

const yellowImages: Record<UnitType, ImageSource> = {
  "Rav Aluf": require("../../assets/images/yellow/Rav Aluf.png"),
  "Aluf": require("../../assets/images/yellow/Aluf.png"),
  "Sgan Aluf": require("../../assets/images/yellow/Sgan Aluf.png"),
  "Rav Seren": require("../../assets/images/yellow/Rav Seren.png"),
  "Seren": require("../../assets/images/yellow/Seren.png"),
  "Segen": require("../../assets/images/yellow/Segen.png"),
  "Rav Samal": require("../../assets/images/yellow/Rav Samal.png"),
  "Samal": require("../../assets/images/yellow/Samal.png"),
  "Rav Turai": require("../../assets/images/yellow/Rav Turai.png"),
  "Commando": require("../../assets/images/yellow/Commando.png"),
  "Navy Seal": require("../../assets/images/yellow/Navy Seal.png"),
  "M7 Ship": require("../../assets/images/yellow/M7 Ship.png"),
  "M4 Ship": require("../../assets/images/yellow/M4 Ship.png"),
  "Patrol Ship": require("../../assets/images/yellow/Patrol Ship.png"),
  "Life Raft": require("../../assets/images/yellow/Life Raft.png"),
  "Fighter Plane": require("../../assets/images/yellow/Fighter Plane.png"),
  "Reconnaissance Plane": require("../../assets/images/yellow/Reconnaissance Plane.png"),
  "Land mine": require("../../assets/images/yellow/Land mine.png"),
  "Naval mine": require("../../assets/images/yellow/Naval mine.png"),
  "Flag": require("../../assets/images/yellow/Flag.png"),
};

const blankImages: Record<Player, ImageSource> = {
  blue: require("../../assets/images/blue/blank.png"),
  yellow: require("../../assets/images/yellow/blank.png"),
};

export const UNIT_IMAGES: Record<Player, Record<UnitType, ImageSource>> = {
  blue: blueImages,
  yellow: yellowImages,
};

export function getUnitImage(player: Player, type: UnitType): ImageSource {
  return UNIT_IMAGES[player][type];
}

export function getBlankImage(player: Player): ImageSource {
  return blankImages[player];
}
