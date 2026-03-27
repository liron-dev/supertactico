import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, Animated, StyleSheet, Modal,
} from 'react-native';
import { BattleResult } from '../game/types';
import { UNIT_DEFS } from '../game/constants';
import { getUnitImage } from '../game/unitImages';

interface Props {
  battle: BattleResult | null;
  onAcknowledge: () => void;
}

export default function BattleModal({ battle, onAcknowledge }: Props) {
  const loserOpacity = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!battle) {
      loserOpacity.setValue(1);
      flashOpacity.setValue(0);
      return;
    }

    // After 1s, flash red on loser then fade out
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(loserOpacity, { toValue: 0.15, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 1000);

    return () => clearTimeout(timer);
  }, [battle]);

  if (!battle) return null;

  const { attacker, defender, winner } = battle;
  const attackerWon = winner === 'attacker';
  const defenderWon = winner === 'defender';
  const bothDie = winner === 'both_die';

  const attackerDef = UNIT_DEFS[attacker.type];
  const defenderDef = UNIT_DEFS[defender.type];

  const resultText = bothDie
    ? '⚔️ שניהם נהרסו'
    : attackerWon
    ? `✅ ${attackerDef.hebrewName} ניצח`
    : `✅ ${defenderDef.hebrewName} ניצח`;

  return (
    <Modal transparent animationType="fade" visible={!!battle}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>⚔️ קרב!</Text>

          <View style={styles.combatants}>
            {/* Attacker */}
            <Animated.View style={[
              styles.combatant,
              !attackerWon && !bothDie ? { opacity: loserOpacity } : undefined,
            ]}>
              {!attackerWon && !bothDie ? (
                <Animated.View style={[styles.redFlash, { opacity: flashOpacity }]} />
              ) : null}
              <Image
                source={getUnitImage(attacker.player, attacker.type)}
                style={styles.unitImage}
                resizeMode="contain"
              />
              <Text style={[styles.playerLabel, { color: attacker.player === 'yellow' ? '#FFD700' : '#5599ff' }]}>
                {attacker.player === 'yellow' ? '🟡' : '🔵'} תוקף
              </Text>
              <Text style={styles.unitLabel}>{attackerDef.hebrewName}</Text>
            </Animated.View>

            <Text style={styles.vs}>VS</Text>

            {/* Defender */}
            <Animated.View style={[
              styles.combatant,
              !defenderWon && !bothDie ? { opacity: loserOpacity } : undefined,
            ]}>
              {!defenderWon && !bothDie ? (
                <Animated.View style={[styles.redFlash, { opacity: flashOpacity }]} />
              ) : null}
              <Image
                source={getUnitImage(defender.player, defender.type)}
                style={styles.unitImage}
                resizeMode="contain"
              />
              <Text style={[styles.playerLabel, { color: defender.player === 'yellow' ? '#FFD700' : '#5599ff' }]}>
                {defender.player === 'yellow' ? '🟡' : '🔵'} מגן
              </Text>
              <Text style={styles.unitLabel}>{defenderDef.hebrewName}</Text>
            </Animated.View>
          </View>

          {bothDie && (
            <View style={styles.bothDieBadge}>
              <Text style={styles.bothDieText}>שניהם נהרסו</Text>
            </View>
          )}

          <Text style={styles.result}>{resultText}</Text>

          {battle.lifeRaftEscape && (
            <Text style={styles.lifeRaftNote}>
              🚣 רפסודת הצלה ניצחת! בחר תא סמוך.
            </Text>
          )}

          <TouchableOpacity onPress={onAcknowledge} style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>המשך</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0d1a2e',
    borderRadius: 16,
    padding: 24,
    width: 340,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#FFD70055',
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  combatants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  combatant: {
    alignItems: 'center',
    width: 110,
  },
  unitImage: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  playerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  unitLabel: {
    color: '#ddeeff',
    fontSize: 12,
    textAlign: 'center',
  },
  redFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    zIndex: 1,
  },
  vs: {
    color: '#7a9cc0',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  bothDieBadge: {
    backgroundColor: '#6b2222',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
  },
  bothDieText: {
    color: '#ffaaaa',
    fontWeight: 'bold',
  },
  result: {
    color: '#aaddcc',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  lifeRaftNote: {
    color: '#6eb6ff',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  continueBtnText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
