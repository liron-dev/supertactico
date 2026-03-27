import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform,
} from 'react-native';
import { GameState, Player, UnitType } from '../game/types';
import { UNIT_DEFS, FOOT_UNITS, NAVAL_UNITS, AIR_UNITS, IMMOBILE_UNITS } from '../game/constants';
import { getUnitImage } from '../game/unitImages';

interface Props {
  state: GameState;
  player: Player;
  onSelectUnit: (type: UnitType) => void;
  onConfirm: () => void;
}

const CATEGORIES = [
  { label: 'חיל רגלים', units: FOOT_UNITS },
  { label: 'חיל ים', units: NAVAL_UNITS },
  { label: 'חיל אוויר', units: AIR_UNITS },
  { label: 'לא ניידים', units: IMMOBILE_UNITS },
];

export default function SetupPanel({ state, player, onSelectUnit, onConfirm }: Props) {
  const unplaced = state.unplacedUnits[player];
  const remaining = (type: UnitType) => unplaced.filter(u => u.type === type).length;
  const isSelected = (type: UnitType) => state.setupSelectedUnitType === type;
  const totalRemaining = unplaced.length;

  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={styles.sidebarWeb}>
        <Text style={styles.title}>
          {player === 'yellow' ? '🟡 צהוב' : '🔵 כחול'}
        </Text>
        <Text style={styles.subtitle}>הצב יחידות</Text>
        <Text style={styles.remainCount}>{totalRemaining} נותרו</Text>

        <ScrollView style={styles.scrollWeb} showsVerticalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <View key={cat.label}>
              <Text style={styles.catLabel}>{cat.label}</Text>
              {cat.units.map(type => {
                const count = remaining(type);
                if (count === 0) return null;
                const def = UNIT_DEFS[type];
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => onSelectUnit(type)}
                    style={[
                      styles.unitRow,
                      isSelected(type) && styles.unitRowSelected,
                    ]}
                  >
                    <Image
                      source={getUnitImage(player, type)}
                      style={styles.unitThumb}
                      resizeMode="contain"
                    />
                    <View style={styles.unitInfo}>
                      <Text style={styles.unitName}>{def.hebrewName}</Text>
                      <Text style={styles.unitCount}>×{count}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={onConfirm}
          style={[styles.confirmBtn, totalRemaining > 0 && styles.confirmBtnDisabled]}
          disabled={totalRemaining > 0}
        >
          <Text style={styles.confirmBtnText}>
            {totalRemaining > 0 ? `${totalRemaining} נותרו` : 'אשר הצבה ✓'}
          </Text>
        </TouchableOpacity>

        {!!state.message && state.message.includes('must') && (
          <Text style={styles.errorText}>{state.message}</Text>
        )}
      </View>
    );
  }

  // Mobile: horizontal strip at bottom
  return (
    <View style={styles.mobileStrip}>
      <View style={styles.mobileHeader}>
        <Text style={styles.mobileTitleText}>
          {player === 'yellow' ? '🟡 צהוב' : '🔵 כחול'} – {totalRemaining} נותרו
        </Text>
        <TouchableOpacity
          onPress={onConfirm}
          style={[styles.confirmBtnMobile, totalRemaining > 0 && styles.confirmBtnDisabled]}
          disabled={totalRemaining > 0}
        >
          <Text style={styles.confirmBtnText}>
            {totalRemaining > 0 ? `${totalRemaining}` : 'אשר ✓'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileScroll}>
        {CATEGORIES.flatMap(cat =>
          cat.units.map(type => {
            const count = remaining(type);
            if (count === 0) return null;
            const def = UNIT_DEFS[type];
            return (
              <TouchableOpacity
                key={type}
                onPress={() => onSelectUnit(type)}
                style={[styles.mobileUnit, isSelected(type) && styles.mobileUnitSelected]}
              >
                <Image
                  source={getUnitImage(player, type)}
                  style={styles.mobileThumb}
                  resizeMode="contain"
                />
                <Text style={styles.mobileUnitCount}>×{count}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Web sidebar
  sidebarWeb: {
    width: 200,
    backgroundColor: '#0d1a2e',
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#1e3a5f',
    flexShrink: 0,
  },
  title: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: '#aac4e0',
    fontSize: 13,
    marginBottom: 4,
  },
  remainCount: {
    color: '#6eb6ff',
    fontSize: 12,
    marginBottom: 8,
  },
  scrollWeb: {
    flex: 1,
  },
  catLabel: {
    color: '#7a9cc0',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 2,
  },
  unitRowSelected: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  unitThumb: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    color: '#ddeeff',
    fontSize: 11,
  },
  unitCount: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmBtnDisabled: {
    backgroundColor: '#3a4a5a',
  },
  confirmBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },

  // Mobile strip
  mobileStrip: {
    backgroundColor: '#0d1a2e',
    borderTopWidth: 1,
    borderTopColor: '#1e3a5f',
    paddingBottom: 8,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  mobileTitleText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
  },
  confirmBtnMobile: {
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mobileScroll: {
    paddingHorizontal: 8,
  },
  mobileUnit: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    marginRight: 6,
    backgroundColor: '#1a2a40',
    width: 54,
  },
  mobileUnitSelected: {
    backgroundColor: 'rgba(255,215,0,0.25)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  mobileThumb: {
    width: 40,
    height: 40,
  },
  mobileUnitCount: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
