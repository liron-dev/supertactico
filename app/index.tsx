import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/game/gameStore";

export default function HomeScreen() {
  const router = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0a0f1e",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      {/* Background pattern */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundColor: "#1a2744",
        }}
      />

      {/* Title */}
      <View style={{ alignItems: "center", marginBottom: 60 }}>
        <Text
          style={{
            color: "#FFD700",
            fontSize: 52,
            fontWeight: "900",
            letterSpacing: 4,
            textShadowColor: "rgba(255, 215, 0, 0.3)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }}
        >
          SUPER TACTICO
        </Text>
        <Text
          style={{
            color: "#B8960F",
            fontSize: 28,
            fontWeight: "600",
            marginTop: 8,
          }}
        >
          סופר טקטיקו
        </Text>
        <View
          style={{
            width: 120,
            height: 2,
            backgroundColor: "#FFD700",
            marginTop: 16,
            opacity: 0.4,
          }}
        />
        <Text
          style={{
            color: "#6b7280",
            fontSize: 14,
            marginTop: 12,
          }}
        >
          A Strategic Battle of Wits
        </Text>
      </View>

      {/* Buttons */}
      <View style={{ gap: 16, width: 280 }}>
        <Pressable
          onPress={() => {
            resetGame();
            router.push("/game");
          }}
          style={({ pressed }) => ({
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor: pressed ? "#B8960F" : "#FFD700",
            alignItems: "center",
            shadowColor: "#FFD700",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          })}
        >
          <Text
            style={{
              color: "#0a0f1e",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            Play Game
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rules")}
          style={({ pressed }) => ({
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor: pressed ? "rgba(255, 215, 0, 0.1)" : "transparent",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#FFD700",
          })}
        >
          <Text
            style={{
              color: "#FFD700",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            Game Rules
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text
        style={{
          position: "absolute",
          bottom: 24,
          color: "#374151",
          fontSize: 12,
        }}
      >
        2-Player Local Game
      </Text>
    </View>
  );
}
