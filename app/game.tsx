import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../src/state/GameContext';
import Board from '../src/components/board/Board';
import SetupPanel from '../src/components/setup/SetupPanel';
import ActionBar from '../src/components/gameplay/ActionBar';
import BattleModal from '../src/components/gameplay/BattleModal';
import HandoffScreen from '../src/components/gameplay/HandoffScreen';
import VictoryModal from '../src/components/gameplay/VictoryModal';
import LifeRaftEscapeModal from '../src/components/gameplay/LifeRaftEscapeModal';
import FlagReturnOverlay from '../src/components/gameplay/FlagReturnOverlay';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  // Handoff screen
  if (
    state.phase === 'handoff-to-blue' ||
    state.phase === 'handoff-to-yellow'
  ) {
    return <HandoffScreen />;
  }

  const isSetup = state.phase === 'setup-yellow' || state.phase === 'setup-blue';
  const playerColor = state.currentPlayer === 'yellow' ? '#f59e0b' : '#3b82f6';

  return (
    <View style={{ flex: 1, backgroundColor: '#0a1929' }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: '#1a2d42',
        }}
      >
        <Pressable
          onPress={() => {
            dispatch({ type: 'RESET_GAME' });
            router.back();
          }}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Text style={{ color: '#829ab1', fontSize: 12 }}>
            ← Home
          </Text>
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#627d98', fontSize: 12, fontWeight: '600', letterSpacing: 2 }}>
            SUPER TACTICO
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: playerColor,
              marginRight: 6,
            }}
          />
          <Text style={{ color: playerColor, fontSize: 12, fontWeight: '700' }}>
            {state.currentPlayer.toUpperCase()}
            {!isSetup && ` · Turn ${state.turnNumber}`}
          </Text>
        </View>
      </View>

      {/* Flag return overlay */}
      {state.phase === 'flag-return' && <FlagReturnOverlay />}

      {/* Main content */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 12,
        }}
      >
        {/* Side panel */}
        <View style={{ justifyContent: 'center' }}>
          {isSetup ? <SetupPanel /> : <ActionBar />}
        </View>

        {/* Board */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Board />
        </View>
      </View>

      {/* Modals */}
      <BattleModal />
      <VictoryModal />
      <LifeRaftEscapeModal />
    </View>
  );
}
