import React from 'react';
import { View, Text, Pressable, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isWide = width > 600;

  return (
    <View className="flex-1 bg-navy-900 items-center justify-center">
      {/* Background grid pattern */}
      <View className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }, (_, i) => (
          <View key={`h${i}`}>
            <View
              style={{
                position: 'absolute',
                top: (height / 20) * i,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: '#f4d03f',
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: (width / 20) * i,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: '#f4d03f',
              }}
            />
          </View>
        ))}
      </View>

      {/* Decorative top gradient */}
      <View
        className="absolute top-0 left-0 right-0"
        style={{
          height: height * 0.3,
          backgroundColor: 'rgba(26,82,118,0.15)',
        }}
      />

      {/* Content */}
      <View className="items-center px-8 z-10">
        {/* Title area */}
        <View className="items-center mb-2">
          <Text
            className="text-gold-400 font-bold text-center"
            style={{
              fontSize: isWide ? 64 : 42,
              letterSpacing: 3,
              textShadowColor: 'rgba(244,208,63,0.3)',
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 20,
            }}
          >
            SUPER
          </Text>
          <Text
            className="text-gold-400 font-bold text-center"
            style={{
              fontSize: isWide ? 72 : 50,
              letterSpacing: 6,
              marginTop: -8,
              textShadowColor: 'rgba(244,208,63,0.3)',
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 20,
            }}
          >
            TACTICO
          </Text>
        </View>

        {/* Decorative line */}
        <View className="flex-row items-center mb-3 mt-1">
          <View className="h-px bg-gold-400/30 flex-1" style={{ maxWidth: 80 }} />
          <View className="w-2 h-2 bg-gold-400/50 rounded-full mx-3" />
          <View className="h-px bg-gold-400/30 flex-1" style={{ maxWidth: 80 }} />
        </View>

        <Text
          className="text-center mb-10"
          style={{
            fontSize: isWide ? 18 : 14,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 4,
          }}
        >
          STRATEGIC WARFARE
        </Text>

        {/* Buttons */}
        <Pressable
          onPress={() => router.push('/game')}
          className="active:opacity-80 mb-4"
          style={{
            backgroundColor: '#f4d03f',
            paddingHorizontal: isWide ? 60 : 48,
            paddingVertical: isWide ? 18 : 14,
            borderRadius: 16,
            shadowColor: '#f4d03f',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text
            className="text-navy-900 font-bold text-center"
            style={{ fontSize: isWide ? 22 : 18, letterSpacing: 1 }}
          >
            Play Game
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/rules')}
          className="active:opacity-70"
          style={{
            borderWidth: 2,
            borderColor: 'rgba(244,208,63,0.5)',
            paddingHorizontal: isWide ? 52 : 40,
            paddingVertical: isWide ? 14 : 10,
            borderRadius: 16,
          }}
        >
          <Text
            className="text-gold-400 font-bold text-center"
            style={{ fontSize: isWide ? 18 : 15, letterSpacing: 1 }}
          >
            Game Rules
          </Text>
        </Pressable>

        {/* Footer */}
        <Text className="text-white/20 text-xs mt-12">
          2 Players · 1 Screen · Endless Strategy
        </Text>
      </View>
    </View>
  );
}
