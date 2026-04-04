import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { UnitInstance } from '../../types/unit';
import { getUnitImage } from '../../utils/imageMap';
import { resolveBattleResult, BattleResult } from '../../constants/battleRules';

interface BattleAnimationProps {
  attacker: UnitInstance;
  defender: UnitInstance;
  onResolve: () => void;
}

export default function BattleAnimation({ attacker, defender, onResolve }: BattleAnimationProps) {
  const [showResult, setShowResult] = useState(false);
  const result = resolveBattleResult(attacker.type, defender.type);

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getResultText = (): string => {
    if (result === 'attacker_wins') {
      return `${attacker.type} defeats ${defender.type}!`;
    }
    if (result === 'defender_wins') {
      return `${defender.type} defeats ${attacker.type}!`;
    }
    return 'Both units destroyed!';
  };

  const getResultColor = (): string => {
    if (result === 'attacker_wins') {
      return attacker.owner === 'yellow' ? '#f1c40f' : '#3498db';
    }
    if (result === 'defender_wins') {
      return defender.owner === 'yellow' ? '#f1c40f' : '#3498db';
    }
    return '#e74c3c';
  };

  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
    >
      <Text className="text-white/60 text-lg mb-6 font-bold">BATTLE!</Text>

      <View className="flex-row items-center justify-center mb-8">
        {/* Attacker */}
        <View className="items-center mx-4">
          <View
            className="rounded-xl p-2 mb-2"
            style={{
              backgroundColor: attacker.owner === 'yellow' ? 'rgba(241,196,15,0.2)' : 'rgba(52,152,219,0.2)',
              borderWidth: 2,
              borderColor: attacker.owner === 'yellow' ? '#f1c40f' : '#3498db',
              opacity: showResult && result === 'defender_wins' ? 0.3 : 1,
            }}
          >
            <Image
              source={getUnitImage(attacker.type, attacker.owner)}
              style={{ width: 80, height: 80, borderRadius: 10 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-white font-bold text-sm">{attacker.type}</Text>
          {attacker.rank !== null && (
            <Text className="text-white/60 text-xs">Rank {attacker.rank}</Text>
          )}
          <Text className="text-white/40 text-xs mt-1">
            {attacker.owner === 'yellow' ? 'Yellow' : 'Blue'} (Attacker)
          </Text>
        </View>

        <Text className="text-white/40 text-3xl font-bold mx-2">VS</Text>

        {/* Defender */}
        <View className="items-center mx-4">
          <View
            className="rounded-xl p-2 mb-2"
            style={{
              backgroundColor: defender.owner === 'yellow' ? 'rgba(241,196,15,0.2)' : 'rgba(52,152,219,0.2)',
              borderWidth: 2,
              borderColor: defender.owner === 'yellow' ? '#f1c40f' : '#3498db',
              opacity: showResult && result === 'attacker_wins' ? 0.3 : 1,
            }}
          >
            <Image
              source={getUnitImage(defender.type, defender.owner)}
              style={{ width: 80, height: 80, borderRadius: 10 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-white font-bold text-sm">{defender.type}</Text>
          {defender.rank !== null && (
            <Text className="text-white/60 text-xs">Rank {defender.rank}</Text>
          )}
          <Text className="text-white/40 text-xs mt-1">
            {defender.owner === 'yellow' ? 'Yellow' : 'Blue'} (Defender)
          </Text>
        </View>
      </View>

      {/* Result */}
      {showResult && (
        <View className="items-center">
          <Text
            className="text-xl font-bold mb-6"
            style={{ color: getResultColor() }}
          >
            {getResultText()}
          </Text>
          <Pressable
            onPress={onResolve}
            className="bg-white/20 border border-white/40 rounded-xl px-8 py-3 active:bg-white/30"
          >
            <Text className="text-white font-bold text-lg">Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
