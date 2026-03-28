import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { UnitType, Player } from "../src/types";
import { UNIT_DISPLAY_NAME, COMBAT_RANK, UNIT_COUNTS } from "../src/constants/units";
import { getPieceImageUri } from "../src/utils/assets";

const RANKED_UNITS: { type: UnitType; rank: number }[] = [
  { type: UnitType.RavAluf, rank: 10 },
  { type: UnitType.Aluf, rank: 9 },
  { type: UnitType.SganAluf, rank: 8 },
  { type: UnitType.RavSeren, rank: 7 },
  { type: UnitType.Seren, rank: 6 },
  { type: UnitType.Segen, rank: 5 },
  { type: UnitType.RavSamal, rank: 4 },
  { type: UnitType.Samal, rank: 3 },
  { type: UnitType.RavTurai, rank: 2 },
  { type: UnitType.Commando, rank: 1 },
  { type: UnitType.NavySeal, rank: 0 },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className="text-amber-400 text-xl font-bold mb-2">{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text className="text-slate-300 text-sm leading-5 mb-2">{children}</Text>;
}

export default function RulesScreen() {
  return (
    <View className="flex-1 bg-slate-900">
      <View className="flex-row items-center p-4 border-b border-slate-700">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-amber-400 text-lg">Back</Text>
        </Pressable>
        <Text className="text-white text-2xl font-bold">
          Rules — Super Tactico
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ maxWidth: 720 }}>
        <Section title="Objective">
          <P>
            Capture the enemy's Flag and return it to your own island home base
            to win the game.
          </P>
        </Section>

        <Section title="Unit Hierarchy (Combat Rank)">
          <P>Higher rank defeats lower rank. Equal ranks — both units are destroyed.</P>
          <View className="bg-slate-800 rounded-lg p-3">
            {RANKED_UNITS.map(({ type, rank }) => (
              <View
                key={type}
                className="flex-row items-center py-1 border-b border-slate-700"
              >
                <Image
                  source={{ uri: getPieceImageUri(Player.Blue, type) }}
                  style={{ width: 28, height: 28, borderRadius: 4 }}
                />
                <Text className="text-white text-sm ml-3 flex-1">
                  {UNIT_DISPLAY_NAME[type]}
                </Text>
                <Text className="text-amber-400 font-bold w-8 text-center">
                  {rank}
                </Text>
                <Text className="text-slate-500 text-xs w-8 text-center">
                  x{UNIT_COUNTS[type]}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Special Combat Rules">
          <P>Commando (rank 1) defeats Rav Aluf (rank 10) when attacking.</P>
          <P>Navy Seal defeats M7 Ship and Rav Aluf when attacking.</P>
          <P>Land Mine destroys all units except Commando.</P>
          <P>Naval Mine destroys all units except Navy Seal, Commando, and M7 Ship.</P>
          <P>Flag cannot be captured by Navy Seal, Fighter Plane, or Recon Plane.</P>
        </Section>

        <Section title="Movement">
          <P>Each turn, move one piece one square in any cardinal direction (up, down, left, right). No diagonal moves.</P>
          <P>Aircraft (Fighter Plane, Recon Plane) move unlimited distance in a straight line, but the path must be completely clear.</P>
          <P>Navy Seal is the only unit that can move on Land, Sea, and Island.</P>
          <P>Ships move only on Sea. Foot soldiers move only on Land and Island.</P>
          <P>Mines and Flag do not move.</P>
          <P>No marine attacks: cannot attack from Sea to Land/Island or vice versa.</P>
        </Section>

        <Section title="Transport">
          <P>Ships and aircraft can carry units. Load/unload from adjacent cells (cardinal only).</P>
          <View className="bg-slate-800 rounded-lg p-3 mt-2">
            <View className="flex-row border-b border-slate-600 pb-1 mb-1">
              <Text className="text-amber-400 font-bold flex-1">Transport</Text>
              <Text className="text-amber-400 font-bold w-16 text-center">Soldiers</Text>
              <Text className="text-amber-400 font-bold w-12 text-center">Mines</Text>
              <Text className="text-amber-400 font-bold w-12 text-center">Ships</Text>
              <Text className="text-amber-400 font-bold w-12 text-center">Planes</Text>
            </View>
            {[
              { name: "M7 Ship", s: 4, m: 1, sh: 1, p: 1 },
              { name: "M4 Ship", s: 4, m: 1, sh: 1, p: 0 },
              { name: "Patrol Ship", s: 4, m: 1, sh: 0, p: 0 },
              { name: "Life Raft", s: 2, m: 0, sh: 0, p: 0 },
              { name: "Fighter Plane", s: 5, m: 1, sh: 0, p: 0 },
              { name: "Recon Plane", s: 2, m: 1, sh: 0, p: 0 },
            ].map((t) => (
              <View key={t.name} className="flex-row py-1 border-b border-slate-700">
                <Text className="text-white text-sm flex-1">{t.name}</Text>
                <Text className="text-slate-300 w-16 text-center">{t.s}</Text>
                <Text className="text-slate-300 w-12 text-center">{t.m}</Text>
                <Text className="text-slate-300 w-12 text-center">{t.sh}</Text>
                <Text className="text-slate-300 w-12 text-center">{t.p}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Setup">
          <P>Yellow places all units first, then Blue.</P>
          <P>Each player places units in their 9 rows. The middle 2 rows stay empty.</P>
          <P>Must leave 3 empty spaces on your island for the enemy.</P>
          <P>Flag must have a viable attack path (not completely surrounded by mines).</P>
        </Section>

        <Section title="Winning">
          <P>
            Capture the enemy Flag by attacking it with a foot soldier. The soldier
            picks up the flag and must carry it back to their own island to win.
          </P>
          <P>
            If the flag carrier is defeated on land, the flag drops at that location.
            If defeated at sea (ship sunk without life raft), the flag returns to
            its original owner.
          </P>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
