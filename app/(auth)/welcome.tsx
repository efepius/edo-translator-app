/**
 * app/(auth)/welcome.tsx
 * Onboarding/welcome screen for new users.
 * File path in Expo project: app/(auth)/welcome.tsx
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const NAVY = '#1a1a2e';
const NAVY2 = '#16213e';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c547';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';

const FEATURES = [
  { icon: 'language-outline', text: 'Translate between Edo and English with AI' },
  { icon: 'book-outline', text: '150+ word dictionary with pronunciation' },
  { icon: 'chatbubbles-outline', text: 'Essential phrases for everyday use' },
  { icon: 'school-outline', text: 'Structured lessons for all levels' },
];

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={[NAVY, NAVY2, '#0a1628']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>BiZY</Text>
          </View>
          <Text style={styles.tagline}>Bini Language Translator</Text>
          <Text style={styles.subtitle}>
            Preserve and celebrate the beautiful Edo language
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURES.map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Ionicons name={feat.icon as any} size={20} color={GOLD} />
              </View>
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[GOLD, GOLD_LIGHT]}
              style={styles.primaryBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Get Started — It's Free</Text>
              <Ionicons name="arrow-forward" size={18} color={NAVY} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/translate')}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Continue without signing in</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Free: 500 characters/day · Premium: Unlimited
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GOLD,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  featuresSection: {
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GOLD + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    color: '#d0d8f0',
    fontSize: 15,
    lineHeight: 20,
  },
  ctaSection: {
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  primaryBtnText: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '600',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: GRAY,
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: GRAY,
    fontSize: 12,
    paddingBottom: 8,
  },
});
