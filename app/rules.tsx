import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { getUnitImage } from "../src/game/unitImages";

const sectionStyle = {
  marginBottom: 24,
};

const headingStyle = {
  color: "#FFD700",
  fontSize: 20,
  fontWeight: "bold" as const,
  marginBottom: 12,
};

const subheadingStyle = {
  color: "#e5e7eb",
  fontSize: 16,
  fontWeight: "600" as const,
  marginBottom: 8,
  marginTop: 12,
};

const textStyle = {
  color: "#d1d5db",
  fontSize: 14,
  lineHeight: 22,
  marginBottom: 6,
};

const ruleStyle = {
  color: "#d1d5db",
  fontSize: 14,
  lineHeight: 22,
  marginBottom: 8,
  paddingLeft: 8,
};

function UnitRow({
  name,
  count,
  player = "blue",
}: {
  name: string;
  count: number;
  player?: "blue" | "yellow";
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 8,
      }}
    >
      <Image
        source={getUnitImage(player, name as any)}
        style={{ width: 32, height: 32, borderRadius: 4 }}
        resizeMode="contain"
      />
      <Text style={{ color: "#e5e7eb", fontSize: 13, flex: 1 }}>{name}</Text>
      <Text style={{ color: "#9ca3af", fontSize: 13 }}>x{count}</Text>
    </View>
  );
}

function BattleRow({
  attacker,
  defender,
  result,
}: {
  attacker: string;
  defender: string;
  result: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#1f2937",
      }}
    >
      <Text style={{ color: "#e5e7eb", fontSize: 12, flex: 1 }}>{attacker}</Text>
      <Text style={{ color: "#6b7280", fontSize: 12, width: 30, textAlign: "center" }}>vs</Text>
      <Text style={{ color: "#e5e7eb", fontSize: 12, flex: 1 }}>{defender}</Text>
      <Text style={{ color: "#22c55e", fontSize: 12, flex: 1, textAlign: "right" }}>{result}</Text>
    </View>
  );
}

export default function RulesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0f1e" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1f2937",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#FFD700", fontSize: 16 }}>← Back</Text>
        </Pressable>
        <Text
          style={{
            color: "#FFD700",
            fontSize: 18,
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
            marginRight: 50,
          }}
        >
          Game Rules
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, maxWidth: 720, alignSelf: "center", width: "100%" }}
      >
        {/* Objective */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Objective</Text>
          <Text style={textStyle}>
            Capture the enemy's flag and return it to your own island home base.
            Play tactically and strategically, exercising discretion, planning, and thinking.
          </Text>
        </View>

        {/* Game Pieces */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Game Pieces (52 per player)</Text>

          <Text style={subheadingStyle}>Foot Units (mobile)</Text>
          <Text style={{ ...textStyle, fontSize: 12, color: "#9ca3af" }}>
            Listed in descending order by rank (higher rank wins in battle)
          </Text>
          {[
            { name: "Rav Aluf", count: 1 },
            { name: "Aluf", count: 1 },
            { name: "Sgan Aluf", count: 2 },
            { name: "Rav Seren", count: 3 },
            { name: "Seren", count: 3 },
            { name: "Segen", count: 4 },
            { name: "Rav Samal", count: 4 },
            { name: "Samal", count: 5 },
            { name: "Rav Turai", count: 5 },
            { name: "Commando", count: 1 },
            { name: "Navy Seal", count: 1 },
          ].map((u) => (
            <UnitRow key={u.name} {...u} />
          ))}

          <Text style={subheadingStyle}>Naval Ships (mobile)</Text>
          {[
            { name: "M7 Ship", count: 2 },
            { name: "M4 Ship", count: 2 },
            { name: "Patrol Ship", count: 4 },
            { name: "Life Raft", count: 3 },
          ].map((u) => (
            <UnitRow key={u.name} {...u} />
          ))}

          <Text style={subheadingStyle}>Aircraft (mobile, unlimited range)</Text>
          {[
            { name: "Fighter Plane", count: 2 },
            { name: "Reconnaissance Plane", count: 2 },
          ].map((u) => (
            <UnitRow key={u.name} {...u} />
          ))}

          <Text style={subheadingStyle}>Immobile Units</Text>
          {[
            { name: "Land mine", count: 3 },
            { name: "Naval mine", count: 3 },
            { name: "Flag", count: 1 },
          ].map((u) => (
            <UnitRow key={u.name} {...u} />
          ))}
        </View>

        {/* Setup */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Initial Setup</Text>
          <Text style={ruleStyle}>
            1. Each player places all their units in their first 9 rows. Units are hidden from the opponent.
          </Text>
          <Text style={ruleStyle}>
            2. The middle 2 rows remain empty after setup.
          </Text>
          <Text style={ruleStyle}>
            3. You must leave 3 empty spaces on your island for the enemy to invade.
          </Text>
          <Text style={ruleStyle}>
            4. Your flag cannot be completely surrounded by mines — leave a viable attack path.
          </Text>
          <Text style={ruleStyle}>
            5. Yellow places first, then Blue, then Yellow takes the first turn.
          </Text>
        </View>

        {/* Movement */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Movement</Text>
          <Text style={ruleStyle}>
            1. One move per turn. Choose one action: Move, Attack, Load, or Unload.
          </Text>
          <Text style={ruleStyle}>
            2. No diagonal movement.
          </Text>
          <Text style={ruleStyle}>
            3. All mobile units move one square (forward, backward, left, or right) except planes.
          </Text>
          <Text style={ruleStyle}>
            4. Planes move unlimited distance in any cardinal direction, but cannot fly over any piece (friendly or enemy).
          </Text>
          <Text style={ruleStyle}>
            5. A unit may move back-and-forth between the same two spaces at most twice.
          </Text>
        </View>

        {/* Terrain */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Terrain Rules</Text>
          <View style={{ backgroundColor: "#111827", borderRadius: 8, padding: 12 }}>
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#374151", paddingBottom: 6, marginBottom: 6 }}>
              <Text style={{ color: "#9ca3af", fontSize: 12, flex: 1 }}>Unit</Text>
              <Text style={{ color: "#9ca3af", fontSize: 12, flex: 1 }}>Can Start On</Text>
              <Text style={{ color: "#9ca3af", fontSize: 12, flex: 1 }}>Can Move On</Text>
            </View>
            {[
              { unit: "Foot soldiers", start: "Land, Island", move: "Land, Island" },
              { unit: "Navy Seal", start: "Land, Island, Sea", move: "Land, Island, Sea" },
              { unit: "Naval ships", start: "Sea", move: "Sea" },
              { unit: "Aircraft", start: "Over Sea", move: "Sea, Land, Island" },
              { unit: "Land mines", start: "Land, Island", move: "Immobile" },
              { unit: "Naval mines", start: "Anywhere", move: "Immobile" },
              { unit: "Flag", start: "Land", move: "Immobile" },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: "row", paddingVertical: 4 }}>
                <Text style={{ color: "#e5e7eb", fontSize: 12, flex: 1 }}>{row.unit}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 12, flex: 1 }}>{row.start}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 12, flex: 1 }}>{row.move}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Battle */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Battle Rules</Text>
          <Text style={ruleStyle}>
            1. Any mobile unit may attack an adjacent enemy unit (not required to attack).
          </Text>
          <Text style={ruleStyle}>
            2. No marine attacks: cannot attack from sea to land or land to sea.
          </Text>
          <Text style={ruleStyle}>
            3. Higher-ranking foot unit wins. Equal rank: both are removed.
          </Text>
          <Text style={ruleStyle}>
            4. Land mines destroy all attackers except the Commando.
          </Text>
          <Text style={ruleStyle}>
            5. Naval mines destroy all attackers except Navy Seal, Commando, and M7 Ship.
          </Text>
          <Text style={ruleStyle}>
            6. Mines that win a battle stay in place (do not move).
          </Text>

          <Text style={subheadingStyle}>Special Combat Rules</Text>
          <View style={{ backgroundColor: "#111827", borderRadius: 8, padding: 8 }}>
            <BattleRow attacker="Commando" defender="Rav Aluf" result="Commando wins" />
            <BattleRow attacker="Navy Seal" defender="M7 Ship" result="Navy Seal wins" />
            <BattleRow attacker="Navy Seal" defender="Rav Aluf" result="Navy Seal wins" />
            <BattleRow attacker="Commando" defender="Any mine" result="Commando wins" />
            <BattleRow attacker="Commando" defender="Any plane" result="Commando wins" />
            <BattleRow attacker="Any ship" defender="Any plane" result="Ship wins" />
            <BattleRow attacker="Fighter Plane" defender="Recon Plane" result="Fighter wins" />
          </View>
        </View>

        {/* Transport */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Loading & Transport</Text>
          <Text style={ruleStyle}>
            1. Load between adjacent squares (including land-to-sea). No diagonal loading.
          </Text>
          <Text style={ruleStyle}>
            2. Only one unit may be loaded per turn.
          </Text>
          <Text style={ruleStyle}>
            3. A soldier carrying the enemy flag counts as one unit for loading.
          </Text>
          <Text style={ruleStyle}>
            4. Ships/rafts must be empty to be loaded onto another ship.
          </Text>
          <Text style={ruleStyle}>
            5. When a transport is attacked, its strength is used. If defeated, all cargo is destroyed.
          </Text>

          <Text style={subheadingStyle}>Transport Capacities</Text>
          <View style={{ backgroundColor: "#111827", borderRadius: 8, padding: 12 }}>
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#374151", paddingBottom: 6, marginBottom: 6 }}>
              <Text style={{ color: "#9ca3af", fontSize: 11, flex: 2 }}>Transport</Text>
              <Text style={{ color: "#9ca3af", fontSize: 11, flex: 1, textAlign: "center" }}>Soldiers</Text>
              <Text style={{ color: "#9ca3af", fontSize: 11, flex: 1, textAlign: "center" }}>Mines</Text>
              <Text style={{ color: "#9ca3af", fontSize: 11, flex: 1.5, textAlign: "center" }}>Other</Text>
            </View>
            {[
              { name: "M7 Ship", soldiers: "4*", mines: "1", other: "+1 ship, +1 Recon" },
              { name: "M4 Ship", soldiers: "4*", mines: "1", other: "+1 ship" },
              { name: "Patrol Ship", soldiers: "4*", mines: "1", other: "—" },
              { name: "Life Raft", soldiers: "2*", mines: "—", other: "—" },
              { name: "Fighter Plane", soldiers: "5", mines: "1", other: "No flag" },
              { name: "Recon Plane", soldiers: "2", mines: "1", other: "No flag" },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: "row", paddingVertical: 3 }}>
                <Text style={{ color: "#e5e7eb", fontSize: 11, flex: 2 }}>{row.name}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 11, flex: 1, textAlign: "center" }}>{row.soldiers}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 11, flex: 1, textAlign: "center" }}>{row.mines}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 11, flex: 1.5, textAlign: "center" }}>{row.other}</Text>
              </View>
            ))}
            <Text style={{ color: "#6b7280", fontSize: 10, marginTop: 6 }}>
              * Flag carried by a soldier occupies one soldier slot
            </Text>
          </View>
        </View>

        {/* Flag */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Flag Capture</Text>
          <Text style={ruleStyle}>
            1. Any foot unit (except Navy Seals) can capture the enemy flag.
          </Text>
          <Text style={ruleStyle}>
            2. Planes cannot transport the flag.
          </Text>
          <Text style={ruleStyle}>
            3. Ships transport the flag only via a soldier carrying it.
          </Text>
          <Text style={ruleStyle}>
            4. When a flag carrier is defeated on land, the flag drops at that position. The winner stays in its own cell.
          </Text>
          <Text style={ruleStyle}>
            5. When a ship without a life raft carrying the flag is sunk at sea, the flag returns to its owner for re-placement on land.
          </Text>
        </View>

        {/* Life Raft Escape */}
        <View style={sectionStyle}>
          <Text style={headingStyle}>Life Raft Escape</Text>
          <Text style={ruleStyle}>
            When a ship carrying a Life Raft is defeated at sea, up to 2 soldiers (or 1 soldier + enemy flag) can escape on the Life Raft to an adjacent sea cell.
          </Text>
        </View>

        {/* Winning */}
        <View style={{ ...sectionStyle, marginBottom: 60 }}>
          <Text style={headingStyle}>Winning</Text>
          <Text style={textStyle}>
            The first player to capture the enemy flag and bring it back to their own island home base wins the game!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
