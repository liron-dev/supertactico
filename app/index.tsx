import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: W, height: H } = Dimensions.get('window');

// Animated stars/particles for the background
function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: Math.random() * H,
    size: Math.random() * 2 + 1,
    opacity: new Animated.Value(Math.random()),
    duration: 2000 + Math.random() * 3000,
  }));

  useEffect(() => {
    stars.forEach(star => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, { toValue: Math.random() * 0.6 + 0.2, duration: star.duration, useNativeDriver: true }),
          Animated.timing(star.opacity, { toValue: Math.random() * 0.3, duration: star.duration, useNativeDriver: true }),
        ]).start(twinkle);
      };
      twinkle();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map(star => (
        <Animated.View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const titleAnim = useRef(new Animated.Value(0)).current;
  const btnsAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(btnsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Subtle glow pulse
    const pulse = () => {
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]).start(pulse);
    };
    pulse();
  }, []);

  const titleStyle = {
    opacity: titleAnim,
    transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
  };
  const btnsStyle = {
    opacity: btnsAnim,
    transform: [{ translateY: btnsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };
  const glowStyle = {
    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }),
  };

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <View style={[styles.gradientTop, StyleSheet.absoluteFill]} />

      {/* Star field */}
      <StarField />

      {/* Gold glow behind title */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Title area */}
      <Animated.View style={[styles.titleArea, titleStyle]}>
        <Text style={styles.hebrewTitle}>סופר טקטיקו</Text>
        <Text style={styles.engTitle}>SUPER TACTICO</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>משחק אסטרטגיה ימי-ביבשתי</Text>
      </Animated.View>

      {/* Decorative board preview */}
      <View style={styles.boardPreview}>
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 8 }).map((_, c) => {
            const colors = ['#1a3a5c', '#2d5a1b', '#1a3a5c', '#b8860b', '#2d5a1b'];
            const bg = colors[(r + c) % colors.length];
            return (
              <View
                key={`${r}-${c}`}
                style={[styles.previewCell, { backgroundColor: bg, opacity: 0.6 + (r * c % 4) * 0.1 }]}
              />
            );
          })
        )}
      </View>

      {/* Buttons */}
      <Animated.View style={[styles.buttons, btnsStyle]}>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => router.push('/game')}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnIcon}>⚔️</Text>
          <Text style={styles.playBtnText}>שחק עכשיו</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rulesBtn}
          onPress={() => router.push('/rules')}
          activeOpacity={0.85}
        >
          <Text style={styles.rulesBtnText}>📖 חוקי המשחק</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.footer}>2 שחקנים • גילאי 9+ • אסטרטגיה</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gradientTop: {
    backgroundColor: '#0a0f1e',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFD700',
    top: '20%',
    alignSelf: 'center',
  },
  titleArea: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  hebrewTitle: {
    fontSize: Platform.OS === 'web' ? 56 : 44,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255,215,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  engTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 17,
    fontWeight: '300',
    color: '#aac4e0',
    letterSpacing: 8,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 80,
    height: 1,
    backgroundColor: '#FFD70055',
    marginVertical: 16,
  },
  subtitle: {
    color: '#7a9cc0',
    fontSize: 14,
    letterSpacing: 1,
  },
  boardPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 8 * 28,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 40,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#FFD70033',
  },
  previewCell: {
    width: 28,
    height: 28,
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    gap: 14,
    zIndex: 1,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playBtnIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  playBtnText: {
    color: '#0a0f1e',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rulesBtn: {
    borderWidth: 1.5,
    borderColor: '#FFD70088',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  rulesBtnText: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    color: '#3a5a7a',
    fontSize: 12,
    letterSpacing: 1,
  },
});
