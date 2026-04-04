import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { UnitInstance, Player } from '../../types/unit';
import { getUnitImage } from '../../utils/imageMap';
import Modal from './Modal';

interface GraveyardProps {
  visible: boolean;
  defeated: { yellow: UnitInstance[]; blue: UnitInstance[] };
  onClose: () => void;
}

export default function Graveyard({ visible, defeated, onClose }: GraveyardProps) {
  const renderPlayerGraveyard = (player: Player, units: UnitInstance[]) => {
    const isYellow = player === 'yellow';
    if (units.length === 0) {
      return (
        <Text className="text-white/40 text-sm italic text-center py-2">
          No casualties
        </Text>
      );
    }

    // Group by type
    const grouped = new Map<string, number>();
    for (const u of units) {
      grouped.set(u.type, (grouped.get(u.type) || 0) + 1);
    }

    return (
      <View className="flex-row flex-wrap gap-2 justify-center">
        {Array.from(grouped.entries()).map(([type, count]) => (
          <View key={type} className="items-center bg-navy-700 rounded-lg p-1.5" style={{ width: 60 }}>
            <Image
              source={getUnitImage(type as any, player)}
              style={{ width: 30, height: 30, borderRadius: 4 }}
              resizeMode="contain"
            />
            <Text className="text-white/60 text-xs mt-0.5" numberOfLines={1}>{type}</Text>
            {count > 1 && (
              <Text className="text-red-400 text-xs font-bold">x{count}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} title="Graveyard" onClose={onClose}>
      <ScrollView style={{ maxHeight: 400 }}>
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 rounded-full bg-player-yellow mr-2" />
            <Text className="text-white font-bold">Yellow ({defeated.yellow.length})</Text>
          </View>
          {renderPlayerGraveyard('yellow', defeated.yellow)}
        </View>

        <View>
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 rounded-full bg-player-blue mr-2" />
            <Text className="text-white font-bold">Blue ({defeated.blue.length})</Text>
          </View>
          {renderPlayerGraveyard('blue', defeated.blue)}
        </View>
      </ScrollView>
    </Modal>
  );
}
