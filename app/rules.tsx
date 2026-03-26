import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { UNIT_DEFINITIONS } from '../src/constants/units';
import { getPieceImage } from '../src/assets/images';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          color: '#f59e0b',
          fontSize: 18,
          fontWeight: '800',
          letterSpacing: 1,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#1a2d42',
          paddingBottom: 6,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <Text style={{ color: '#bcccdc', fontSize: 13, lineHeight: 22, marginBottom: 6 }}>
      {text}
    </Text>
  );
}

function UnitRow({ name, count, rank, category }: { name: string; count: number; rank: number | null; category: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#102a4310',
      }}
    >
      <Image
        source={getPieceImage(name, 'blue')}
        style={{ width: 28, height: 28, borderRadius: 4, marginRight: 10 }}
        resizeMode="cover"
      />
      <Text style={{ color: '#e2e8f0', fontSize: 12, flex: 1, fontWeight: '500' }}>{name}</Text>
      <Text style={{ color: '#627d98', fontSize: 11, width: 30, textAlign: 'center' }}>×{count}</Text>
      {rank !== null && (
        <Text style={{ color: '#f59e0b', fontSize: 11, width: 40, textAlign: 'center', fontWeight: '600' }}>
          Rank {rank}
        </Text>
      )}
      {rank === null && (
        <Text style={{ color: '#486581', fontSize: 10, width: 40, textAlign: 'center' }}>{category}</Text>
      )}
    </View>
  );
}

export default function RulesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#0a1929' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#1a2d42',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Text style={{ color: '#829ab1', fontSize: 12 }}>← Back</Text>
        </Pressable>
        <Text
          style={{
            color: '#e2e8f0',
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: 2,
            flex: 1,
            textAlign: 'center',
            marginRight: 60,
          }}
        >
          GAME RULES
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          maxWidth: 700,
          alignSelf: 'center',
          width: '100%',
        }}
      >
        <Section title="Objective">
          <Rule text="Capture the enemy's flag and return it to your own island home base to win!" />
          <Rule text="Play tactically and strategically, exercising discretion, planning, and thinking." />
        </Section>

        <Section title="Game Pieces">
          <Text style={{ color: '#829ab1', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 1 }}>
            FOOT UNITS (ranked, descending)
          </Text>
          {UNIT_DEFINITIONS.filter(u => u.category === 'foot').map(u => (
            <UnitRow key={u.name} name={u.name} count={u.count} rank={u.rank} category={u.category} />
          ))}

          <Text style={{ color: '#829ab1', fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 6, letterSpacing: 1 }}>
            NAVAL SHIPS
          </Text>
          {UNIT_DEFINITIONS.filter(u => u.category === 'naval').map(u => (
            <UnitRow key={u.name} name={u.name} count={u.count} rank={u.rank} category={u.category} />
          ))}

          <Text style={{ color: '#829ab1', fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 6, letterSpacing: 1 }}>
            AIRCRAFT
          </Text>
          {UNIT_DEFINITIONS.filter(u => u.category === 'aircraft').map(u => (
            <UnitRow key={u.name} name={u.name} count={u.count} rank={u.rank} category={u.category} />
          ))}

          <Text style={{ color: '#829ab1', fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 6, letterSpacing: 1 }}>
            IMMOBILE UNITS
          </Text>
          {UNIT_DEFINITIONS.filter(u => u.category === 'mine' || u.category === 'flag').map(u => (
            <UnitRow key={u.name} name={u.name} count={u.count} rank={u.rank} category={u.category} />
          ))}
        </Section>

        <Section title="Initial Setup">
          <Rule text="Each player sets up their units in their own 9 rows (Yellow: bottom, Blue: top). The middle 2 rows remain empty." />
          <Rule text="Only you can see your own pieces — opponents see blank tiles." />
          <Rule text="You must leave at least 3 empty spaces on your island for the enemy to invade." />
          <Rule text="You must leave a viable path to your flag — you cannot surround it with mines on all sides." />
          <Rule text="Yellow sets up first, then Blue. Yellow takes the first turn." />
        </Section>

        <Section title="Movement">
          <Rule text="On your turn, you perform exactly one action: Move, Attack, or Load/Unload." />
          <Rule text="No diagonal movement is allowed." />
          <Rule text="Most mobile units move one square in any cardinal direction." />
          <Rule text="Planes can move unlimited distance in any cardinal direction, as long as the path is clear (no pieces in the way)." />
          <Rule text="Navy Seals can move on Land, Island, and Sea." />
          <Rule text="A unit may move back-and-forth between the same two spaces at most twice." />
        </Section>

        <Section title="Battle Rules">
          <Rule text="Any mobile unit can attack an adjacent enemy unit." />
          <Rule text="No marine attacks: you cannot attack land from sea or vice versa." />
          <Rule text="For ranked foot units: higher rank wins. Equal rank = both die." />
          <Rule text="Special: Commando (rank 1) defeats Rav Aluf (rank 10) when attacking." />
          <Rule text="Special: Navy Seal defeats M7 Ship and Rav Aluf when attacking." />
          <Rule text="Commando also defeats: Navy Seal, mines, Flag, and all aircraft." />
          <Rule text="Navy Seal also defeats: Naval mines, aircraft, and Flag." />
          <Rule text="Ship hierarchy: M7 > M4 > Patrol Ship > Life Raft." />
          <Rule text="Land mines destroy everything except Commando." />
          <Rule text="Naval mines destroy everything except Navy Seal, Commando, and M7 Ship." />
          <Rule text="Mines that win a battle stay in place — they don't move." />
          <Rule text="When attacking a transport, you fight the transport itself, not its cargo." />
          <Rule text="If a transport is defeated, all cargo is also removed (unless a Life Raft escapes)." />
        </Section>

        <Section title="Flag Capture">
          <Rule text="Any foot unit (except Navy Seal) can capture the enemy flag by defeating it in battle." />
          <Rule text="The capturing soldier moves to the flag's square and carries it." />
          <Rule text="Planes cannot transport the flag." />
          <Rule text="Ships can only carry the flag if a soldier carrying it is loaded aboard." />
          <Rule text="When a flag carrier is defeated on land, the flag drops on the vacated space." />
          <Rule text="When a ship carrying the flag (without life raft escape) is sunk at sea, the flag returns to its owner to re-place on any land cell." />
          <Rule text="Win by carrying the enemy flag to your own island!" />
        </Section>

        <Section title="Loading & Transport">
          <Rule text="Units can be loaded between adjacent cells (including land-to-sea)." />
          <Rule text="No diagonal loading." />
          <Rule text="Only one unit may be loaded per turn." />
          <Rule text="A soldier carrying the enemy flag counts as a single unit for loading." />
          <Rule text="M7 Ship: 4 soldiers, 1 mine, 1 small ship (Patrol/Life Raft), 1 Recon Plane." />
          <Rule text="M4 Ship: 4 soldiers, 1 mine, 1 small ship (Patrol/Life Raft)." />
          <Rule text="Patrol Ship: 4 soldiers, 1 mine." />
          <Rule text="Life Raft: 2 soldiers." />
          <Rule text="Fighter Plane: 5 soldiers, 1 mine (cannot carry the flag)." />
          <Rule text="Reconnaissance Plane: 2 soldiers, 1 mine (cannot carry the flag)." />
          <Rule text="Important: When loading a Life Raft onto an M7, the raft's passengers count toward the M7's soldier limit. An M7 with 4 soldiers can only load an empty raft." />
        </Section>

        <Section title="Life Raft Escape">
          <Rule text="When a ship carrying a Life Raft is defeated, up to 2 soldiers (or 1 soldier + flag) can escape on the Life Raft." />
          <Rule text="The Life Raft is placed on an adjacent sea cell." />
          <Rule text="All other cargo on the defeated ship is lost." />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
