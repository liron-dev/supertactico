import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { UNIT_DEFINITIONS } from '../src/constants/units';
import { getUnitImage } from '../src/utils/imageMap';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View className="mb-3">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between bg-navy-700 rounded-xl px-4 py-3 active:opacity-80"
      >
        <Text className="text-gold-400 font-bold text-base flex-1">{title}</Text>
        <Text className="text-gold-400 text-lg">{open ? '−' : '+'}</Text>
      </Pressable>
      {open && (
        <View className="bg-navy-800/60 rounded-b-xl px-4 py-3 border border-navy-700 border-t-0">
          {children}
        </View>
      )}
    </View>
  );
}

function RuleText({ children }: { children: React.ReactNode }) {
  return <Text className="text-white/80 text-sm leading-5 mb-2">{children}</Text>;
}

function RuleItem({ number, text }: { number: string; text: string }) {
  return (
    <View className="flex-row mb-2">
      <Text className="text-gold-400 font-bold text-sm mr-2 mt-0.5" style={{ minWidth: 20 }}>
        {number}
      </Text>
      <Text className="text-white/80 text-sm leading-5 flex-1">{text}</Text>
    </View>
  );
}

function UnitCard({ type, count, rank, category, startTerrain }: {
  type: string;
  count: number;
  rank: number | null;
  category: string;
  startTerrain: string[];
}) {
  const terrainLabels = startTerrain.map(t =>
    t === 'S' ? 'Sea' : t === 'L' ? 'Land' : 'Island'
  ).join(', ');

  return (
    <View className="flex-row items-center bg-navy-700 rounded-lg p-2 mb-1.5">
      <Image
        source={getUnitImage(type as any, 'yellow')}
        style={{ width: 36, height: 36, borderRadius: 5 }}
        resizeMode="contain"
      />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Text className="text-white font-bold text-sm">{type}</Text>
          <Text className="text-white/40 text-xs ml-2">x{count}</Text>
        </View>
        <Text className="text-white/50 text-xs">
          {rank !== null ? `Rank ${rank}` : category === 'immobile' ? 'Immobile' : 'Special'}
          {' · '}Start: {terrainLabels}
        </Text>
      </View>
    </View>
  );
}

export default function RulesScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy-900">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-navy-800 px-4 py-3 pt-4">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Text className="text-white/70 text-sm">← Back</Text>
        </Pressable>
        <Text className="text-gold-400 font-bold text-lg">Game Rules</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <Section title="Objective" defaultOpen>
          <RuleText>
            Capture the enemy's flag and return it to your own island home base. Play tactically and strategically, exercising discretion, planning, and thinking.
          </RuleText>
          <RuleText>
            The game is played by 2 players on a 20×20 board with Sea, Land, and Island terrain. Each player has 52 game pieces.
          </RuleText>
        </Section>

        <Section title="Game Pieces - Foot Soldiers" defaultOpen>
          <RuleText>
            Foot soldiers are ranked from 10 (highest) to 0 (lowest). Higher rank wins in battle. Equal ranks destroy each other.
          </RuleText>
          {UNIT_DEFINITIONS.filter(d => d.category === 'foot').map(d => (
            <UnitCard key={d.type} type={d.type} count={d.count} rank={d.rank} category={d.category} startTerrain={d.startTerrain} />
          ))}
        </Section>

        <Section title="Game Pieces - Naval Ships">
          <RuleText>
            Ships operate on the sea and can transport soldiers, mines, and other units. Ship strength: M7 {'>'} M4 {'>'} Patrol Ship {'>'} Life Raft.
          </RuleText>
          {UNIT_DEFINITIONS.filter(d => d.category === 'naval').map(d => (
            <UnitCard key={d.type} type={d.type} count={d.count} rank={d.rank} category={d.category} startTerrain={d.startTerrain} />
          ))}
        </Section>

        <Section title="Game Pieces - Aircraft">
          <RuleText>
            Aircraft start over sea and can move to any terrain. Planes move unlimited distance in a straight line but cannot fly over any other piece.
          </RuleText>
          {UNIT_DEFINITIONS.filter(d => d.category === 'aircraft').map(d => (
            <UnitCard key={d.type} type={d.type} count={d.count} rank={d.rank} category={d.category} startTerrain={d.startTerrain} />
          ))}
        </Section>

        <Section title="Game Pieces - Mines & Flag">
          <RuleText>
            Mines and the flag are immobile - they cannot move on their own but can be transported by ships and planes. Mines can be placed during initial setup.
          </RuleText>
          {UNIT_DEFINITIONS.filter(d => d.category === 'immobile').map(d => (
            <UnitCard key={d.type} type={d.type} count={d.count} rank={d.rank} category={d.category} startTerrain={d.startTerrain} />
          ))}
        </Section>

        <Section title="Initial Setup">
          <RuleItem number="1." text="Yellow places all units first, then Blue. Each player places units in their own 9 rows." />
          <RuleItem number="2." text="The middle 2 rows remain empty at the start." />
          <RuleItem number="3." text="Each player must leave 3 empty spaces on their island for enemy invasion." />
          <RuleItem number="4." text="You must leave a viable path to your flag — you cannot surround it with mines on all sides." />
          <RuleItem number="5." text="All units are hidden from the opponent. Only revealed during battle." />
          <View className="bg-navy-600/50 rounded-lg p-3 mt-2">
            <Text className="text-white/60 text-xs font-bold mb-1">STARTING TERRAIN:</Text>
            <Text className="text-white/50 text-xs">• Foot soldiers → Land or Island</Text>
            <Text className="text-white/50 text-xs">• Navy Seal → Anywhere (Land, Island, Sea)</Text>
            <Text className="text-white/50 text-xs">• Ships → Sea only</Text>
            <Text className="text-white/50 text-xs">• Aircraft → Over Sea</Text>
            <Text className="text-white/50 text-xs">• Land mines → Land or Island</Text>
            <Text className="text-white/50 text-xs">• Naval mines → Anywhere</Text>
            <Text className="text-white/50 text-xs">• Flag → Land only</Text>
          </View>
        </Section>

        <Section title="Gameplay">
          <RuleItem number="1." text="Yellow goes first." />
          <RuleItem number="2." text="Each turn, a player performs exactly one action: Move, Attack, Load, or Unload." />
          <RuleItem number="3." text="No diagonal movement — only up, down, left, or right." />
          <RuleItem number="4." text="All mobile pieces move one square, except planes which move unlimited distance in a straight line (must have clear path — cannot fly over any piece)." />
          <RuleItem number="5." text="A unit may move back-and-forth between the same two spaces at most twice. Then it must move elsewhere." />
          <RuleItem number="6." text="The winner is the player who captures the enemy flag and brings it to their own island." />
        </Section>

        <Section title="Battle Rules">
          <RuleText>
            Any mobile unit may attack an enemy unit on an adjacent square. The lower-ranked unit is destroyed. Equal ranks destroy each other.
          </RuleText>
          <RuleItem number="•" text="No marine attacks: you cannot attack across the land/sea boundary." />
          <RuleItem number="•" text="If the attacker wins, it moves to the defeated unit's square." />
          <RuleItem number="•" text="If a mine wins the battle, the mine stays in place." />

          <View className="bg-navy-600/50 rounded-lg p-3 mt-2 mb-2">
            <Text className="text-gold-400 text-xs font-bold mb-2">SPECIAL BATTLE RULES:</Text>
            <Text className="text-white/60 text-xs mb-1">• Commando (Rank 1) defeats Rav Aluf (Rank 10) when attacking</Text>
            <Text className="text-white/60 text-xs mb-1">• Navy Seal (Rank 0) defeats M7 Ship and Rav Aluf when attacking</Text>
            <Text className="text-white/60 text-xs mb-1">• Commando defeats: Navy Seal, mines, Flag, planes</Text>
            <Text className="text-white/60 text-xs mb-1">• Navy Seal defeats: Naval mine, planes, Flag</Text>
            <Text className="text-white/60 text-xs mb-1">• Land mine defeats ALL units except Commando</Text>
            <Text className="text-white/60 text-xs mb-1">• Naval mine defeats ALL except Navy Seal, Commando, M7 Ship</Text>
            <Text className="text-white/60 text-xs mb-1">• Flag defeats: Navy Seal, Fighter Plane, Recon Plane</Text>
          </View>
        </Section>

        <Section title="Flag Rules">
          <RuleItem number="1." text="Any foot unit (except Navy Seal) can capture and carry the enemy flag." />
          <RuleItem number="2." text="Planes cannot transport the flag." />
          <RuleItem number="3." text="Ships can only transport the flag if a soldier carrying it is loaded onto the ship." />
          <RuleItem number="4." text="When a soldier carrying the flag is defeated on land, the flag remains on that square." />
          <RuleItem number="5." text="When a ship without a life raft transporting the flag is defeated at sea, the flag returns to its original owner for re-placement on any land cell." />
          <RuleItem number="6." text="To win: bring the captured flag to your own island home base." />
        </Section>

        <Section title="Loading & Transport">
          <RuleText>
            Units can be loaded between adjacent cells (including across land/sea boundaries). One unit per turn. A soldier carrying the flag counts as one unit.
          </RuleText>

          <View className="bg-navy-600/50 rounded-lg p-3 mt-1 mb-2">
            <Text className="text-gold-400 text-xs font-bold mb-2">TRANSPORT CAPACITIES:</Text>
            <Text className="text-white/60 text-xs mb-1">• M7 Ship: 4 soldiers + 1 mine + 1 ship (Patrol/Life Raft) + 1 Recon Plane</Text>
            <Text className="text-white/60 text-xs mb-1">• M4 Ship: 4 soldiers + 1 mine + 1 ship (Patrol/Life Raft)</Text>
            <Text className="text-white/60 text-xs mb-1">• Patrol Ship: 4 soldiers + 1 mine</Text>
            <Text className="text-white/60 text-xs mb-1">• Life Raft: 2 soldiers</Text>
            <Text className="text-white/60 text-xs mb-1">• Fighter Plane: 5 soldiers + 1 mine (NO flag!)</Text>
            <Text className="text-white/60 text-xs mb-1">• Recon Plane: 2 soldiers + 1 mine (NO flag!)</Text>
          </View>

          <RuleItem number="!" text="A Life Raft or Patrol Ship must be emptied before loading it onto an M7 or M4 Ship." />
          <RuleItem number="!" text="Nested unloading requires multiple turns (e.g., unload Life Raft from M7, then unload soldiers from Life Raft)." />
        </Section>

        <Section title="Attack & Transport Combat">
          <RuleItem number="1." text="When attacking a transport, the battle uses the transport's own strength, not its cargo." />
          <RuleItem number="2." text="If a transport is defeated, all its cargo is destroyed." />
          <RuleItem number="3." text="Exception: If the defeated ship has a Life Raft, up to 2 soldiers can escape to an adjacent sea cell." />
          <RuleItem number="4." text="A soldier carrying the enemy flag can be one of the 2 escapees." />
        </Section>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
