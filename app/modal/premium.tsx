/**
 * app/modal/premium.tsx
 * BiZY Premium upgrade screen — displays plans and triggers Stripe checkout.
 * File path in Expo project: app/modal/premium.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { createCheckoutSession } from '../../lib/api';

const NAVY = '#1a1a2e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c547';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';

const FEATURES_FREE = [
  { text: '500 characters per day', included: true },
  { text: 'Edo ↔ English translation', included: true },
  { text: 'Basic dictionary (150+ words)', included: true },
  { text: 'Phrasebook access', included: true },
  { text: 'Save favorites', included: false },
  { text: 'Translation history', included: false },
  { text: 'Voice input (coming soon)', included: false },
  { text: 'Offline mode (coming soon)', included: false },
];

const FEATURES_PREMIUM = [
  { text: 'Unlimited characters per day', included: true },
  { text: 'Edo ↔ English translation', included: true },
  { text: 'Full dictionary access', included: true },
  { text: 'Phrasebook access', included: true },
  { text: 'Unlimited favorites', included: true },
  { text: 'Full translation history', included: true },
  { text: 'Voice input (coming soon)', included: true },
  { text: 'Offline mode (coming soon)', included: true },
];

type Plan = 'monthly' | 'yearly';

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  if (profile?.isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.alreadyPremium}>
          <View style={styles.premiumIcon}>
            <Ionicons name="star" size={40} color={NAVY} />
          </View>
          <Text style={styles.alreadyTitle}>You're already Premium!</Text>
          <Text style={styles.alreadySub}>
            Enjoy unlimited Edo translations and all premium features.
          </Text>
          {profile.subscriptionEnd && (
            <Text style={styles.renewDate}>
              Renews: {profile.subscriptionEnd.toLocaleDateString()}
            </Text>
          )}
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => Alert.alert('Manage Subscription', 'Visit your app store subscription settings to manage or cancel your BiZY Premium subscription.')}
          >
            <Text style={styles.manageBtnText}>Manage Subscription</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to subscribe to BiZY Premium.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => { router.dismiss(); router.push('/(auth)/login'); } },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const session = await createCheckoutSession({
        planId: selectedPlan,
        returnUrl: 'bizy://premium/success',
      });
      // Open Stripe checkout in browser
      await Linking.openURL(session.url);
    } catch (err) {
      Alert.alert(
        'Subscription Error',
        'Unable to start checkout. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#2d1f00', '#3d2a00', NAVY]}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="star" size={36} color={NAVY} />
          </View>
          <Text style={styles.heroTitle}>BiZY Premium</Text>
          <Text style={styles.heroSub}>
            Unlimited Edo translations, voice input, and more.{'\n'}
            Help preserve the Edo language.
          </Text>
        </LinearGradient>

        {/* Plan selector */}
        <View style={styles.planSelector}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planName, selectedPlan === 'monthly' && styles.planNameActive]}>
              Monthly
            </Text>
            <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>
              $2.99
            </Text>
            <Text style={styles.planPeriod}>per month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={[styles.planName, selectedPlan === 'yearly' && styles.planNameActive]}>
              Annual
            </Text>
            <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceActive]}>
              $19.99
            </Text>
            <Text style={styles.planPeriod}>per year</Text>
            <Text style={styles.planSaving}>Save 44%</Text>
          </TouchableOpacity>
        </View>

        {/* Feature comparison */}
        <View style={styles.featureSection}>
          <View style={styles.featureColumn}>
            <Text style={styles.featureColumnHeader}>Free</Text>
            {FEATURES_FREE.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons
                  name={f.included ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={f.included ? '#4ade80' : '#555'}
                />
                <Text style={[styles.featureText, !f.included && styles.featureTextDisabled]}>
                  {f.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.featureColumn, styles.featureColumnPremium]}>
            <Text style={[styles.featureColumnHeader, { color: GOLD }]}>
              Premium ⭐
            </Text>
            {FEATURES_PREMIUM.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={GOLD}
                />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subscribe CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.subscribeBtn, loading && styles.subscribeBtnDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={loading ? ['#555', '#555'] : [GOLD, GOLD_LIGHT]}
              style={styles.subscribeBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={NAVY} />
              ) : (
                <>
                  <Ionicons name="star" size={20} color={NAVY} />
                  <Text style={styles.subscribeBtnText}>
                    Subscribe {selectedPlan === 'monthly' ? '— $2.99/mo' : '— $19.99/yr'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Subscription auto-renews. Cancel anytime in your app store settings.
            By subscribing you agree to our Terms of Service.
          </Text>

          {/* Mission statement */}
          <View style={styles.missionCard}>
            <Ionicons name="heart-outline" size={18} color={GOLD} />
            <Text style={styles.missionText}>
              Your subscription directly supports the preservation and digital documentation
              of the Edo (Bini) language for future generations.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },

  alreadyPremium: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  premiumIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyTitle: { color: WHITE, fontSize: 24, fontWeight: '800' },
  alreadySub: { color: GRAY, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  renewDate: { color: GOLD, fontSize: 14 },
  manageBtn: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  manageBtnText: { color: GOLD, fontSize: 15, fontWeight: '600' },

  hero: {
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { color: WHITE, fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  heroSub: {
    color: GRAY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  planSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
  },
  planCardActive: {
    borderColor: GOLD,
    backgroundColor: '#1a2a3e',
  },
  planName: { color: GRAY, fontSize: 14, fontWeight: '600' },
  planNameActive: { color: WHITE },
  planPrice: { color: WHITE, fontSize: 28, fontWeight: '900' },
  planPriceActive: { color: GOLD },
  planPeriod: { color: GRAY, fontSize: 12 },
  planSaving: { color: '#4ade80', fontSize: 12, fontWeight: '600', marginTop: 2 },
  bestValueBadge: {
    backgroundColor: GOLD,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  bestValueText: { color: NAVY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  featureSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  featureColumn: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  featureColumnPremium: {
    borderWidth: 1,
    borderColor: GOLD + '44',
  },
  featureColumnHeader: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  featureText: {
    flex: 1,
    color: WHITE,
    fontSize: 12,
    lineHeight: 16,
  },
  featureTextDisabled: { color: '#555' },

  ctaSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  subscribeBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  subscribeBtnText: { color: NAVY, fontSize: 17, fontWeight: '800' },
  legalText: {
    color: GRAY,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  missionText: {
    flex: 1,
    color: '#c0c8d8',
    fontSize: 13,
    lineHeight: 18,
  },
});
