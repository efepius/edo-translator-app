/**
 * app/(tabs)/profile.tsx
 * User profile, usage stats, translation history, favorites, and account settings.
 * File path in Expo project: app/(tabs)/profile.tsx
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useTranslationStore } from '../../store/translationStore';

const NAVY = '#1a1a2e';
const NAVY2 = '#16213e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const ERROR_RED = '#e74c3c';

type Tab = 'stats' | 'history' | 'favorites';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const {
    usage,
    fetchUsage,
    history,
    fetchHistory,
    historyLoading,
    favorites,
    fetchFavorites,
    favoritesLoading,
    removeFavorite,
    setInputText,
    setDirection,
  } = useTranslationStore();

  const [activeTab, setActiveTab] = useState<Tab>('stats');

  useEffect(() => {
    if (user) {
      fetchUsage();
      fetchHistory();
      fetchFavorites();
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-circle-outline" size={80} color={GRAY} />
          <Text style={styles.notLoggedInTitle}>Sign in to your account</Text>
          <Text style={styles.notLoggedInSub}>
            Save favorites, view history, and track your progress
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpBtn}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.signUpBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleUseFavorite = (fav: { inputText: string; direction: any }) => {
    setInputText(fav.inputText);
    setDirection(fav.direction);
    router.push('/(tabs)/translate');
  };

  const isPremium = profile?.isPremium ?? false;
  const charLimit = usage?.dailyCharLimit ?? 500;
  const charsUsed = usage?.dailyCharsUsed ?? 0;
  const usagePct = Math.min(charsUsed / charLimit, 1);

  const initials = (profile?.displayName || user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient colors={[NAVY, NAVY2]} style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{profile?.displayName || 'BiZY User'}</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={14} color={NAVY} />
              <Text style={styles.premiumBadgeText}>Premium Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeBanner}
              onPress={() => router.push('/modal/premium')}
            >
              <Ionicons name="star-outline" size={14} color={GOLD} />
              <Text style={styles.upgradeBannerText}>Upgrade to Premium — Unlimited translations</Text>
              <Ionicons name="chevron-forward" size={14} color={GOLD} />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['stats', 'history', 'favorites'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={
                  tab === 'stats'
                    ? 'stats-chart-outline'
                    : tab === 'history'
                    ? 'time-outline'
                    : 'heart-outline'
                }
                size={16}
                color={activeTab === tab ? GOLD : GRAY}
              />
              <Text
                style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats tab */}
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            {/* Usage card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Usage</Text>
              <View style={styles.usageRow}>
                <Text style={styles.usageNumber}>{charsUsed}</Text>
                <Text style={styles.usageDivider}>/</Text>
                <Text style={styles.usageLimit}>{isPremium ? '∞' : charLimit}</Text>
                <Text style={styles.usageUnit}> chars</Text>
              </View>
              {!isPremium && (
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageFill,
                      {
                        width: `${usagePct * 100}%`,
                        backgroundColor: usagePct > 0.8 ? ERROR_RED : GOLD,
                      },
                    ]}
                  />
                </View>
              )}
              {!isPremium && (
                <Text style={styles.resetText}>
                  Resets daily at midnight
                </Text>
              )}
            </View>

            {/* Quick stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{history.length}</Text>
                <Text style={styles.statLabel}>Translations</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{favorites.length}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
            </View>

            {/* Account settings */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account</Text>
              {[
                { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
                { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => {} },
                { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
                { icon: 'information-circle-outline', label: 'About BiZY', onPress: () => {} },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.settingsRow}
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon as any} size={20} color={GRAY} />
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={GRAY} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Sign out */}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={ERROR_RED} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            {historyLoading ? (
              <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />
            ) : history.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={GRAY} />
                <Text style={styles.emptyTitle}>No history yet</Text>
                <Text style={styles.emptySub}>Your translation history will appear here</Text>
              </View>
            ) : (
              history.map((item, i) => (
                <TouchableOpacity
                  key={item.id || i}
                  style={styles.historyCard}
                  onPress={() => {
                    setInputText(item.inputText);
                    setDirection(item.direction);
                    router.push('/(tabs)/translate');
                  }}
                >
                  <Text style={styles.historyInput} numberOfLines={1}>{item.inputText}</Text>
                  <Ionicons name="arrow-forward" size={14} color={GRAY} />
                  <Text style={styles.historyOutput} numberOfLines={1}>{item.outputText}</Text>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyDir}>
                      {item.direction === 'english_to_edo' ? 'EN→Edo' : 'Edo→EN'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={{ height: 40 }} />
          </View>
        )}

        {/* Favorites tab */}
        {activeTab === 'favorites' && (
          <View style={styles.tabContent}>
            {favoritesLoading ? (
              <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} />
            ) : favorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={48} color={GRAY} />
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptySub}>
                  Tap the heart icon after translating to save a phrase
                </Text>
              </View>
            ) : (
              favorites.map((fav, i) => (
                <View key={fav.id || i} style={styles.favCard}>
                  <TouchableOpacity
                    style={styles.favContent}
                    onPress={() => handleUseFavorite(fav)}
                  >
                    <Text style={styles.favInput}>{fav.inputText}</Text>
                    <Text style={styles.favOutput}>{fav.outputText}</Text>
                    {fav.label && <Text style={styles.favLabel}>{fav.label}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.favDelete}
                    onPress={() => {
                      Alert.alert('Remove Favorite', 'Remove this from favorites?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => removeFavorite(fav.id),
                        },
                      ]);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={ERROR_RED} />
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  notLoggedInTitle: { color: WHITE, fontSize: 22, fontWeight: '700' },
  notLoggedInSub: {
    color: GRAY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  signInBtnText: { color: NAVY, fontSize: 16, fontWeight: '800' },
  signUpBtn: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  signUpBtnText: { color: GOLD, fontSize: 15, fontWeight: '600' },

  profileHeader: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: { color: NAVY, fontSize: 28, fontWeight: '900' },
  displayName: { color: WHITE, fontSize: 22, fontWeight: '800' },
  emailText: { color: GRAY, fontSize: 14 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  premiumBadgeText: { color: NAVY, fontSize: 13, fontWeight: '700' },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: GOLD + '66',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  upgradeBannerText: { flex: 1, color: GOLD, fontSize: 13 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: NAVY },
  tabLabel: { color: GRAY, fontSize: 13, fontWeight: '500' },
  tabLabelActive: { color: GOLD, fontWeight: '700' },

  tabContent: { paddingHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardTitle: { color: GRAY, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  usageRow: { flexDirection: 'row', alignItems: 'baseline' },
  usageNumber: { color: GOLD, fontSize: 36, fontWeight: '900' },
  usageDivider: { color: GRAY, fontSize: 24, marginHorizontal: 4 },
  usageLimit: { color: WHITE, fontSize: 24, fontWeight: '600' },
  usageUnit: { color: GRAY, fontSize: 16 },
  usageBar: {
    height: 6,
    backgroundColor: '#1a2a3e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageFill: { height: '100%', borderRadius: 3 },
  resetText: { color: GRAY, fontSize: 12 },

  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: { color: WHITE, fontSize: 28, fontWeight: '800' },
  statLabel: { color: GRAY, fontSize: 13 },

  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#1a2a3e',
  },
  settingsLabel: { flex: 1, color: WHITE, fontSize: 15 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2d1b1b',
    borderRadius: 14,
    padding: 16,
  },
  signOutText: { color: ERROR_RED, fontSize: 16, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { color: WHITE, fontSize: 18, fontWeight: '600' },
  emptySub: { color: GRAY, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  historyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  historyInput: { color: GRAY, fontSize: 14 },
  historyOutput: { color: WHITE, fontSize: 15, fontWeight: '600', flex: 1 },
  historyMeta: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  historyDir: { color: GOLD, fontSize: 11, fontWeight: '600' },

  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    overflow: 'hidden',
  },
  favContent: { flex: 1, padding: 14, gap: 4 },
  favInput: { color: GRAY, fontSize: 13 },
  favOutput: { color: GOLD, fontSize: 16, fontWeight: '700' },
  favLabel: { color: GRAY, fontSize: 11 },
  favDelete: {
    padding: 16,
    borderLeftWidth: 0.5,
    borderLeftColor: '#1a2a3e',
  },
});
