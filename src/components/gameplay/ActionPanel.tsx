import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useGame } from '../../state/GameContext';
import { Position, posEqual } from '../../types/board';
import { UnitInstance } from '../../types/unit';
import { getUnitImage } from '../../utils/imageMap';
import { getValidUnloadTargets } from '../../engine/GameEngine';
import Button from '../ui/Button';

interface ActionPanelProps {
  onEndTurn: () => void;
  onShowGraveyard: () => void;
  actionTaken: boolean;
}

export default function ActionPanel({ onEndTurn, onShowGraveyard, actionTaken }: ActionPanelProps) {
  const { state, dispatch, unloadableItems } = useGame();
  const [showUnload, setShowUnload] = useState(false);
  const [selectedCargoUnit, setSelectedCargoUnit] = useState<UnitInstance | null>(null);

  const selectedUnit = state.selectedCell
    ? state.board[state.selectedCell.row][state.selectedCell.col].unit
    : null;

  const currentPlayer = state.phase.type === 'gameplay' ? state.phase.currentTurn : null;
  const isOwnUnit = selectedUnit?.owner === currentPlayer;

  const handleUnload = (cargoUnit: UnitInstance) => {
    if (!state.selectedCell) return;
    setSelectedCargoUnit(cargoUnit);

    // Get valid unload targets
    const targets = getValidUnloadTargets(state, state.selectedCell, cargoUnit);
    if (targets.length === 1) {
      // Only one option, auto-unload
      dispatch({ type: 'UNLOAD_UNIT', unitId: cargoUnit.id, targetPosition: targets[0] });
      setShowUnload(false);
      setSelectedCargoUnit(null);
    }
    // If multiple targets, the user will click on the board to choose
  };

  return (
    <View className="bg-navy-800 border-t border-navy-600 px-4 py-2">
      {/* Selected unit info */}
      {selectedUnit && isOwnUnit && (
        <View className="flex-row items-center mb-2">
          <Image
            source={getUnitImage(selectedUnit.type, selectedUnit.owner)}
            style={{ width: 36, height: 36, borderRadius: 4 }}
            resizeMode="contain"
          />
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold text-sm">
              {selectedUnit.type}
              {selectedUnit.rank !== null ? ` (Rank ${selectedUnit.rank})` : ''}
            </Text>
            {selectedUnit.carryingEnemyFlag && (
              <Text className="text-amber-400 text-xs">Carrying enemy flag!</Text>
            )}
          </View>
        </View>
      )}

      {/* Cargo section */}
      {selectedUnit && isOwnUnit && unloadableItems.length > 0 && !actionTaken && (
        <View className="mb-2">
          <Pressable
            onPress={() => setShowUnload(!showUnload)}
            className="bg-navy-700 rounded-lg px-3 py-1.5 mb-1"
          >
            <Text className="text-blue-400 text-xs font-bold">
              {showUnload ? 'Hide' : 'Show'} Cargo ({unloadableItems.length} units)
            </Text>
          </Pressable>

          {showUnload && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {unloadableItems.map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleUnload(item)}
                    className="items-center p-1.5 bg-navy-700 rounded-lg"
                    style={{ width: 64 }}
                  >
                    <Image
                      source={getUnitImage(item.type, item.owner)}
                      style={{ width: 32, height: 32, borderRadius: 4 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white text-xs mt-0.5" numberOfLines={1}>
                      {item.type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View className="flex-row items-center justify-between">
        <Button
          title="Graveyard"
          onPress={onShowGraveyard}
          variant="secondary"
          small
        />
        <Button
          title="End Turn"
          onPress={onEndTurn}
          disabled={!actionTaken}
          small
        />
      </View>
    </View>
  );
}
