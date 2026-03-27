import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { GameState, Action, ActionKind } from '../game/types';
import { UNIT_DEFS } from '../game/constants';

interface Props {
  state: GameState;
  onDeselect: () => void;
}

const KIND_LABELS: Record<ActionKind, string> = {
  move: 'זוז',
  attack: 'תקוף',
  load: 'טען',
  unload: 'פרוק',
};

const KIND_COLORS: Record<ActionKind, string> = {
  move: '#22c55e',
  attack: '#ef4444',
  load: '#3b82f6',
  unload: '#a855f7',
};

export default function ActionPanel({ state, onDeselect }: Props) {
  const { selected, board, validActions, currentPlayer } = state;

  if (!selected) return null;

  const unit = board[selected.row][selected.col];
  if (!unit || unit.player !== currentPlayer) return null;

  const def = UNIT_DEFS[unit.type];
  const kinds = new Set(validActions.map(a => a.kind));

  const cargoTypes = unit.cargo.map(c => UNIT_DEFS[c.type].hebrewName).join(', ');

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.unitName}>{def.hebrewName}</Text>
          {unit.cargo.length > 0 && (
            <Text style={styles.cargoInfo}>טוען: {cargoTypes}</Text>
          )}
          {unit.carryingFlag && (
            <Text style={styles.flagInfo}>🚩 נושא דגל אויב</Text>
          )}
        </View>
        <TouchableOpacity onPress={onDeselect} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {validActions.length === 0 && (
          <Text style={styles.noActions}>אין פעולות זמינות</Text>
        )}
        {Array.from(kinds).map(kind => {
          const actionsOfKind = validActions.filter(a => a.kind === kind);
          return (
            <View key={kind} style={styles.actionGroup}>
              <View style={[styles.kindBadge, { backgroundColor: KIND_COLORS[kind] + '22' }]}>
                <View style={[styles.kindDot, { backgroundColor: KIND_COLORS[kind] }]} />
                <Text style={[styles.kindLabel, { color: KIND_COLORS[kind] }]}>
                  {KIND_LABELS[kind]} ({actionsOfKind.length})
                </Text>
              </View>
            </View>
          );
        })}
        {validActions.length > 0 && (
          <Text style={styles.tapHint}>לחץ על תא מסומן לביצוע</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#0d1a2e',
    borderTopWidth: 1,
    borderTopColor: '#FFD70055',
    padding: 12,
    minHeight: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  unitName: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cargoInfo: {
    color: '#6eb6ff',
    fontSize: 11,
    marginTop: 2,
  },
  flagInfo: {
    color: '#ff6b6b',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#7a9cc0',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  actionGroup: {
    marginRight: 8,
    marginBottom: 4,
  },
  kindBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  kindDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  kindLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  noActions: {
    color: '#7a9cc0',
    fontSize: 13,
    fontStyle: 'italic',
  },
  tapHint: {
    color: '#4a6a8a',
    fontSize: 10,
    marginTop: 2,
  },
});
