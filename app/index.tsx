import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0a1929',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background decorative elements */}
      <View
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(59,130,246,0.04)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: 'rgba(245,158,11,0.04)',
        }}
      />

      {/* Emblem */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 3,
          borderColor: '#f59e0b',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            borderWidth: 2,
            borderColor: '#3b82f6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#f59e0b', borderRadius: 2, margin: 2 }} />
            <View style={{ width: 14, height: 14, backgroundColor: '#3b82f6', borderRadius: 2, margin: 2 }} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#3b82f6', borderRadius: 2, margin: 2 }} />
            <View style={{ width: 14, height: 14, backgroundColor: '#f59e0b', borderRadius: 2, margin: 2 }} />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text
        style={{
          color: '#e2e8f0',
          fontSize: 14,
          fontWeight: '500',
          letterSpacing: 6,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Super
      </Text>
      <Text
        style={{
          color: '#f59e0b',
          fontSize: 48,
          fontWeight: '900',
          letterSpacing: 4,
          textTransform: 'uppercase',
          marginBottom: 4,
          textShadowColor: 'rgba(245,158,11,0.3)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 12,
        }}
      >
        TACTICO
      </Text>
      <Text
        style={{
          color: '#3b82f6',
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 8,
          textTransform: 'uppercase',
          marginBottom: 48,
        }}
      >
        Strategic Warfare
      </Text>

      {/* Buttons */}
      <Pressable
        onPress={() => router.push('/game')}
        style={({ pressed, hovered }: any) => ({
          backgroundColor: pressed
            ? '#d97706'
            : hovered
            ? '#f59e0b'
            : 'transparent',
          borderWidth: 2,
          borderColor: '#f59e0b',
          paddingVertical: 14,
          paddingHorizontal: 48,
          borderRadius: 8,
          marginBottom: 14,
          minWidth: 240,
          alignItems: 'center',
        })}
      >
        {({ pressed, hovered }: any) => (
          <Text
            style={{
              color: pressed || hovered ? '#0a1929' : '#f59e0b',
              fontSize: 16,
              fontWeight: '800',
              letterSpacing: 2,
            }}
          >
            PLAY GAME
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/rules')}
        style={({ pressed, hovered }: any) => ({
          backgroundColor: pressed
            ? '#1d4ed8'
            : hovered
            ? '#3b82f6'
            : 'transparent',
          borderWidth: 2,
          borderColor: '#3b82f6',
          paddingVertical: 14,
          paddingHorizontal: 48,
          borderRadius: 8,
          minWidth: 240,
          alignItems: 'center',
        })}
      >
        {({ pressed, hovered }: any) => (
          <Text
            style={{
              color: pressed || hovered ? '#fff' : '#3b82f6',
              fontSize: 16,
              fontWeight: '800',
              letterSpacing: 2,
            }}
          >
            GAME RULES
          </Text>
        )}
      </Pressable>

      {/* Footer */}
      <Text
        style={{
          position: 'absolute',
          bottom: 24,
          color: '#334e68',
          fontSize: 11,
        }}
      >
        2 Players - Same Device
      </Text>
    </View>
  );
}
