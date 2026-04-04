import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useGame } from '../../state/GameContext';
import { Player, UnitInstance } from '../../types/unit';
import { UNIT_DEFINITIONS, UNIT_CATEGORIES, TOTAL_UNITS_PER_PLAYER } from '../../constants/units';
import { getUnitImage } from '../../utils/imageMap';
import Button from '../ui/Button';

interface PlacementTrayProps {
  player: Player;
  onFinishPlacement: () => void;
  validationError: string | null;
}

export default function PlacementTray({ player, onFinishPlacement, validationError }: PlacementTrayProps) {
  const { state, dispatch } = useGame();
  const [activeCategory, setActiveCategory] = useState(0);

  const unplacedUnits = state.unplacedUnits[player];
  const placedCount = TOTAL_UNITS_PER_PLAYER - unplacedUnits.length;

  // Group unplaced units by type
  const unitCountByType = new Map<string, UnitInstance[]>();
  for (const u of unplacedUnits) {
    const existing = unitCountByType.get(u.type) || [];
    existing.push(u);
    unitCountByType.set(u.type, existing);
  }

  const category = UNIT_CATEGORIES[activeCategory];
  const categoryDefs = UNIT_DEFINITIONS.filter(category.filter);

  return (
    <View className="bg-navy-800/95 border-t border-navy-600 px-3 pt-2 pb-3">
      {/* Progress bar */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white/70 text-sm">
          {placedCount}/{TOTAL_UNITS_PER_PLAYER} placed
        </Text>
        <View className="flex-1 mx-3 h-2 bg-navy-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-gold-400 rounded-full"
            style={{ width: `${(placedCount / TOTAL_UNITS_PER_PLAYER) * 100}%` }}
          />
        </View>
        <Button
          title="Done"
          onPress={onFinishPlacement}
          disabled={unplacedUnits.length > 0}
          small
        />
      </View>

      {validationError && (
        <Text className="text-red-400 text-sm mb-2 text-center">{validationError}</Text>
      )}

      {/* Category tabs */}
      <View className="flex-row mb-2">
        {UNIT_CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat.label}
            onPress={() => setActiveCategory(i)}
            className={`flex-1 py-1.5 rounded-lg mx-0.5 items-center ${
              i === activeCategory ? 'bg-gold-400' : 'bg-navy-700'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                i === activeCategory ? 'text-navy-900' : 'text-white/70'
              }`}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Units grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {categoryDefs.map(def => {
            const available = unitCountByType.get(def.type) || [];
            const isSelected = state.selectedUnplacedUnit?.type === def.type;
            const hasAvailable = available.length > 0;

            return (
              <Pressable
                key={def.type}
                onPress={() => {
                  if (hasAvailable) {
                    dispatch({ type: 'SELECT_UNPLACED_UNIT', unit: available[0] });
                  }
                }}
                className={`items-center p-1.5 rounded-lg ${
                  isSelected ? 'bg-gold-400/30 border border-gold-400' : 'bg-navy-700'
                } ${!hasAvailable ? 'opacity-30' : ''}`}
                style={{ width: 72 }}
                disabled={!hasAvailable}
              >
                <Image
                  source={getUnitImage(def.type, player)}
                  style={{ width: 40, height: 40, borderRadius: 5 }}
                  resizeMode="contain"
                />
                <Text className="text-white text-xs mt-1 text-center" numberOfLines={1}>
                  {def.type}
                </Text>
                <Text className={`text-xs font-bold ${hasAvailable ? 'text-gold-400' : 'text-gray-500'}`}>
                  x{available.length}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Selected unit info */}
      {state.selectedUnplacedUnit && (
        <Text className="text-gold-400 text-sm mt-2 text-center">
          Tap a cell to place: {state.selectedUnplacedUnit.type}
          {state.selectedUnplacedUnit.rank !== null && ` (Rank ${state.selectedUnplacedUnit.rank})`}
        </Text>
      )}
    </View>
  );
}
