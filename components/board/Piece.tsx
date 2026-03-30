import { View, Image, Text } from "react-native";
import { UnitInstance, Player } from "../../engine/types";
import { getUnitImage, getBlankImage } from "../../utils/imageMap";

interface PieceProps {
  unit: UnitInstance;
  currentPlayer: Player;
  cellSize: number;
}

export default function Piece({ unit, currentPlayer, cellSize }: PieceProps) {
  const isOwn = unit.owner === currentPlayer;
  const imageSource = isOwn ? getUnitImage(unit.name, unit.owner) : getBlankImage(unit.owner);
  const cargoCount = unit.cargo.length;
  const imgSize = cellSize * 0.85;

  return (
    <View style={{ width: imgSize, height: imgSize, position: "relative" }}>
      <Image source={imageSource} style={{ width: imgSize, height: imgSize, borderRadius: 4 }} resizeMode="contain" />
      {cargoCount > 0 && (
        <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: isOwn ? "#f59e0b" : "#ef4444", borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: isOwn ? "#0a0f1e" : "#fff", fontSize: 10, fontWeight: "bold" }}>{cargoCount}</Text>
        </View>
      )}
      {isOwn && unit.carryingFlag && (
        <View style={{ position: "absolute", bottom: -2, left: -2, backgroundColor: "#dc2626", borderRadius: 7, width: 14, height: 14, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 8, fontWeight: "bold" }}>F</Text>
        </View>
      )}
    </View>
  );
}
