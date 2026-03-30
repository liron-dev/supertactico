// components/rules/RulesContent.tsx
import { View, Text, Image, ScrollView } from "react-native";
import { getUnitImage } from "../../utils/imageMap";
import { UNIT_DEFINITIONS } from "../../engine/constants";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-amber-400 text-xl font-bold mb-3 tracking-wider">
        {title}
      </Text>
      <View className="bg-navy-700/50 rounded-xl p-4 border border-navy-600">
        {children}
      </View>
    </View>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <View className="flex-row mb-2">
      <Text className="text-amber-500 mr-2">&#x2022;</Text>
      <Text className="text-white/80 text-sm flex-1 leading-5">{text}</Text>
    </View>
  );
}

export default function RulesContent() {
  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Section title="Objective">
        <Text className="text-white/80 text-sm leading-5">
          Capture the enemy's flag and return it to your own island home base.
          Play tactically and strategically, exercising discretion, planning, and thinking.
        </Text>
      </Section>

      <Section title="Game Pieces">
        <Text className="text-white/60 text-xs mb-3">52 pieces per player (104 total)</Text>

        <Text className="text-amber-400/80 font-bold text-sm mb-2">Foot Units (Ranked)</Text>
        {UNIT_DEFINITIONS.filter((u) => u.category === "foot").map((u) => (
          <View key={u.name} className="flex-row items-center mb-2">
            <Image
              source={getUnitImage(u.name, "blue")}
              style={{ width: 32, height: 32, borderRadius: 4 }}
              resizeMode="contain"
            />
            <Text className="text-white text-sm ml-3 flex-1">{u.name}</Text>
            <Text className="text-amber-400/60 text-xs mr-3">
              {u.rank !== null ? `Rank ${u.rank}` : ""}
            </Text>
            <Text className="text-white/40 text-xs">x{u.count}</Text>
          </View>
        ))}

        <Text className="text-amber-400/80 font-bold text-sm mb-2 mt-4">Naval Ships</Text>
        {UNIT_DEFINITIONS.filter((u) => u.category === "ship").map((u) => (
          <View key={u.name} className="flex-row items-center mb-2">
            <Image
              source={getUnitImage(u.name, "blue")}
              style={{ width: 32, height: 32, borderRadius: 4 }}
              resizeMode="contain"
            />
            <Text className="text-white text-sm ml-3 flex-1">{u.name}</Text>
            <Text className="text-white/40 text-xs">x{u.count}</Text>
          </View>
        ))}

        <Text className="text-amber-400/80 font-bold text-sm mb-2 mt-4">Aircraft</Text>
        {UNIT_DEFINITIONS.filter((u) => u.category === "aircraft").map((u) => (
          <View key={u.name} className="flex-row items-center mb-2">
            <Image
              source={getUnitImage(u.name, "blue")}
              style={{ width: 32, height: 32, borderRadius: 4 }}
              resizeMode="contain"
            />
            <Text className="text-white text-sm ml-3 flex-1">{u.name}</Text>
            <Text className="text-white/40 text-xs">x{u.count}</Text>
          </View>
        ))}

        <Text className="text-amber-400/80 font-bold text-sm mb-2 mt-4">Immobile Units</Text>
        {UNIT_DEFINITIONS.filter((u) => u.category === "immobile").map((u) => (
          <View key={u.name} className="flex-row items-center mb-2">
            <Image
              source={getUnitImage(u.name, "blue")}
              style={{ width: 32, height: 32, borderRadius: 4 }}
              resizeMode="contain"
            />
            <Text className="text-white text-sm ml-3 flex-1">{u.name}</Text>
            <Text className="text-white/40 text-xs">x{u.count}</Text>
          </View>
        ))}
      </Section>

      <Section title="Setup">
        <Rule text="Players each set up their units in the first 9 rows on their side of the board." />
        <Rule text="The middle two rows remain empty at the start." />
        <Rule text="Units are hidden from the opponent — only you can see your own pieces." />
        <Rule text="You must leave at least 3 empty spaces on your island for the opponent to invade." />
        <Rule text="You must leave a viable path to your flag — you cannot surround it with mines on all sides." />
        <Rule text="Yellow places first, then Blue, then Yellow takes the first turn." />
      </Section>

      <Section title="Movement">
        <Rule text="Yellow opens. Players take turns, one action per turn." />
        <Rule text="On your turn, choose one action: Move, Load/Unload, or Attack." />
        <Rule text="No diagonal movement — only forward, backward, left, or right." />
        <Rule text="All mobile units move one square per turn, except planes." />
        <Rule text="Planes may move unlimited distance in any straight direction, but their path must be completely clear (no flying over any piece)." />
        <Rule text="Any unit may move back and forth between the same two squares at most twice." />
        <Rule text="Navy Seal can move on Land, Island, and Sea." />
        <Rule text="Foot units move on Land and Island only (need transport for Sea)." />
        <Rule text="Ships move on Sea only." />
        <Rule text="Mines and Flag do not move." />
      </Section>

      <Section title="Battle Rules">
        <Rule text="Any mobile unit may attack an enemy on an adjacent square (not diagonal)." />
        <Rule text="No marine attacks: you cannot attack from sea to land or vice versa." />
        <Rule text="For ranked foot units: higher rank wins. Equal rank = both eliminated." />
        <Rule text="Land mine defeats ALL attackers except Commando." />
        <Rule text="Naval mine defeats ALL except Navy Seal, Commando, and M7 Ship." />
        <Rule text="Mines stay in place when they win — the attacker is removed." />

        <Text className="text-amber-400/80 font-bold text-sm mt-3 mb-2">Special Unit Rules</Text>
        <Rule text="Commando (Rank 1): Defeats Navy Seal, all mines, Flag, and planes. When attacking Rav Aluf, Commando wins." />
        <Rule text="Navy Seal (Rank 0): Defeats Naval mine, planes, and Flag. When attacking M7 Ship or Rav Aluf, Navy Seal wins." />
        <Rule text="Ship hierarchy: M7 > M4 > Patrol > Life Raft. All ships defeat planes." />
        <Rule text="Fighter Plane defeats Reconnaissance Plane." />
        <Rule text="Flag defeats Navy Seal and planes. Captured by any foot unit (except Navy Seal)." />
      </Section>

      <Section title="Loading & Transport">
        <Rule text="You may only transport your own units and the enemy flag." />
        <Rule text="Loading is between adjacent squares (including land-sea boundary), no diagonal." />
        <Rule text="Only one unit may be loaded per turn. A soldier carrying the enemy flag counts as one unit." />
        <Rule text="Planes cannot transport the flag." />
        <Rule text="Ships carry the flag only if a soldier carrying it is loaded onto the ship." />

        <Text className="text-amber-400/80 font-bold text-sm mt-3 mb-2">Transport Capacities</Text>
        <Rule text="M7 Ship: 4 soldiers + 1 mine + 1 ship (Patrol/Life Raft) + 1 Reconnaissance Plane" />
        <Rule text="M4 Ship: 4 soldiers + 1 mine + 1 ship (Patrol/Life Raft)" />
        <Rule text="Patrol Ship: 4 soldiers + 1 mine" />
        <Rule text="Life Raft: 2 soldiers" />
        <Rule text="Fighter Plane: 5 soldiers + 1 mine (NO flag)" />
        <Rule text="Reconnaissance Plane: 2 soldiers + 1 mine (NO flag)" />

        <Text className="text-amber-400/80 font-bold text-sm mt-3 mb-2">Important</Text>
        <Rule text="An M7 ship at max soldiers (4) can only load an EMPTY Life Raft. If the raft has passengers, unload them first." />
        <Rule text="When a transport unit is attacked, its strength is what matters — not its cargo's strength. If it loses, all cargo is eliminated too." />
      </Section>

      <Section title="Flag & Winning">
        <Rule text="Any foot unit (except Navy Seal) can capture the enemy flag by defeating it in combat." />
        <Rule text="The soldier who captures the flag carries it." />
        <Rule text="If a flag carrier is defeated on land, the flag drops at that location." />
        <Rule text="If a ship carrying the flag (via a soldier) is sunk at sea without a life raft, the flag returns to its owner for re-placement on any land cell." />
        <Rule text="Planes may NOT carry the flag." />
        <Rule text="To win: carry the captured enemy flag to your own island home base." />
      </Section>

      <Section title="Life Raft Escape">
        <Rule text="If a ship carrying a Life Raft is defeated, up to 2 soldiers (or 1 soldier + enemy flag) can escape." />
        <Rule text="The life raft is moved to a sea space adjacent to the defeated ship." />
      </Section>
    </ScrollView>
  );
}
