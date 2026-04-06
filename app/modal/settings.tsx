/**
 * app/modal/settings.tsx
 * Settings modal — account, notifications, language preferences, and app info.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const NAVY = '#1a1a2e';
const NAVY2 = '#16213e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const ERROR_RED = '#e74c3c';

interface SettingRowProps {
  icon: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, label, onPress, rightElement, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
          <Ionicons name={icon as any} size={18} color={danger ? ERROR_RED : GOLD} />
        </View>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
      </View>
      {rightElement ? (
        rightElement
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color={GRAY} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsModal() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Contact Support', 'Please email support@bizyapp.com to delete your account.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Account */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.accountRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {(profile?.displayName || user.email || 'U')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{profile?.displayName || 'BiZY User'}</Text>
                  <Text style={styles.accountEmail}>{user.email}</Text>
                  <View style={[styles.planBadge, profile?.isPremium && styles.planBadgePremium]}>
                    <Text style={styles.planBadgeText}>
                      {profile?.isPremium ? '⭐ Premium' : 'Free Plan'}
                    </Text>
                  </View>
                </View>
              </View>
              {!profile?.isPremium && (
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  onPress={() => { router.back(); router.push('/modal/premium'); }}
                >
                  <Ionicons name="star" size={16} color={NAVY} />
                  <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow
              icon="notifications-outline"
              label="Push Notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#333', true: GOLD }}
                  thumbColor={WHITE}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon="alarm-outline"
              label="Daily Learning Reminder"
              rightElement={
                <Switch
                  value={dailyReminderEnabled}
                  onValueChange={setDailyReminderEnabled}
                  trackColor={{ false: '#333', true: GOLD }}
                  thumbColor={WHITE}
                />
              }
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow
              icon="phone-portrait-outline"
              label="Haptic Feedback"
              rightElement={
                <Switch
                  value={hapticEnabled}
                  onValueChange={setHapticEnabled}
                  trackColor={{ false: '#333', true: GOLD }}
                  thumbColor={WHITE}
                />
              }
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingRow
              icon="help-circle-outline"
              label="Help & FAQ"
              onPress={() => Linking.openURL('https://bizyapp.com/help')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="mail-outline"
              label="Contact Support"
              onPress={() => Linking.openURL('mailto:support@bizyapp.com')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="star-outline"
              label="Rate BiZY"
              onPress={() => Linking.openURL('https://bizyapp.com/rate')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="share-social-outline"
              label="Share BiZY"
              onPress={() => {
                Alert.alert('Share BiZY', 'Coming soon!');
              }}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <SettingRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => Linking.openURL('https://bizyapp.com/terms')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://bizyapp.com/privacy')}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App</Text>
              <Text style={styles.aboutValue}>BiZY Edo Translator</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Language</Text>
              <Text style={styles.aboutValue}>Edo (Bini)</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        {user && (
          <View style={styles.section}>
            <View style={styles.card}>
              <SettingRow
                icon="log-out-outline"
                label="Sign Out"
                onPress={handleSignOut}
                danger
              />
              <View style={styles.divider} />
              <SettingRow
                icon="trash-outline"
                label="Delete Account"
                onPress={handleDeleteAccount}
                danger
              />
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BG,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: WHITE },
  scroll: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: GRAY, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  card: { backgroundColor: CARD_BG, borderRadius: 14, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(201,162,39,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconBoxDanger: { backgroundColor: 'rgba(231,76,60,0.12)' },
  settingLabel: { fontSize: 15, color: WHITE, fontWeight: '500' },
  settingLabelDanger: { color: ERROR_RED },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  accountRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { fontSize: 22, fontWeight: '700', color: NAVY },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: '700', color: WHITE, marginBottom: 2 },
  accountEmail: { fontSize: 13, color: GRAY, marginBottom: 6 },
  planBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(170,170,170,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  planBadgePremium: { backgroundColor: 'rgba(201,162,39,0.15)' },
  planBadgeText: { fontSize: 11, color: GOLD, fontWeight: '600' },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: 12,
    marginTop: 0,
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 10,
  },
  upgradeBtnText: { fontSize: 14, fontWeight: '700', color: NAVY },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  aboutLabel: { fontSize: 15, color: WHITE },
  aboutValue: { fontSize: 14, color: GRAY },
});
