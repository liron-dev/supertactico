import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { UnitInstance } from '../../types/unit';
import { Position } from '../../types/board';
import { getUnitImage } from '../../utils/imageMap';
import Button from '../ui/Button';

interface LifeRaftEscapeProps {
  raft: UnitInstance;
  availableSoldiers: UnitInstance[];
  maxEscapees: number;
  adjacentSeaCells: Position[];
  onEscape: (survivorIds: string[], targetPosition: Position) => void;
  onSkip: () => void;
}

export default function LifeRaftEscape({
  raft,
  availableSoldiers,
  maxEscapees,
  adjacentSeaCells,
  onEscape,
  onSkip,
}: LifeRaftEscapeProps) {
  const [selectedSoldiers, setSelectedSoldiers] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<Position | null>(
    adjacentSeaCells.length === 1 ? adjacentSeaCells[0] : null
  );

  const toggleSoldier = (id: string) => {
    const newSet = new Set(selectedSoldiers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size < maxEscapees) {
        newSet.add(id);
      }
    }
    setSelectedSoldiers(newSet);
  };

  const canConfirm = selectedSoldiers.size > 0 && selectedCell !== null;

  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
    >
      <View className="bg-navy-800 rounded-2xl p-6 mx-4 max-w-md w-full">
        <Text className="text-gold-400 text-xl font-bold mb-2 text-center">
          Life Raft Escape!
        </Text>
        <Text className="text-white/70 text-sm mb-4 text-center">
          Your ship was defeated, but the life raft can save up to {maxEscapees} soldiers.
        </Text>

        {/* Soldier selection */}
        <Text className="text-white font-bold text-sm mb-2">
          Select soldiers to rescue ({selectedSoldiers.size}/{maxEscapees}):
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {availableSoldiers.map(soldier => {
            const isSelected = selectedSoldiers.has(soldier.id);
            return (
              <Pressable
                key={soldier.id}
                onPress={() => toggleSoldier(soldier.id)}
                className={`items-center p-2 rounded-lg ${
                  isSelected ? 'bg-gold-400/30 border border-gold-400' : 'bg-navy-700'
                }`}
                style={{ width: 72 }}
              >
                <Image
                  source={getUnitImage(soldier.type, soldier.owner)}
                  style={{ width: 36, height: 36, borderRadius: 4 }}
                  resizeMode="contain"
                />
                <Text className="text-white text-xs mt-1" numberOfLines={1}>
                  {soldier.type}
                </Text>
                {soldier.carryingEnemyFlag && (
                  <Text className="text-amber-400 text-xs">+ Flag</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Target cell selection */}
        {adjacentSeaCells.length > 1 && (
          <>
            <Text className="text-white font-bold text-sm mb-2">
              Select escape cell:
            </Text>
            <View className="flex-row gap-2 mb-4">
              {adjacentSeaCells.map((cell, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSelectedCell(cell)}
                  className={`px-3 py-2 rounded-lg ${
                    selectedCell && cell.row === selectedCell.row && cell.col === selectedCell.col
                      ? 'bg-blue-500'
                      : 'bg-navy-700'
                  }`}
                >
                  <Text className="text-white text-xs">
                    ({cell.row}, {cell.col})
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Action buttons */}
        <View className="flex-row justify-between mt-2">
          <Button title="Skip Escape" onPress={onSkip} variant="danger" small />
          <Button
            title="Escape!"
            onPress={() => {
              if (canConfirm && selectedCell) {
                onEscape(Array.from(selectedSoldiers), selectedCell);
              }
            }}
            disabled={!canConfirm}
            small
          />
        </View>
      </View>
    </View>
  );
}
