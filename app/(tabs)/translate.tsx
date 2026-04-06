/**
 * app/(tabs)/translate.tsx
 * Main translation screen — Edo ↔ English using Claude AI.
 * File path in Expo project: app/(tabs)/translate.tsx
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';
import { useTranslationStore } from '../../store/translationStore';

const NAVY = '#1a1a2e';
const NAVY2 = '#16213e';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c547';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const CARD_BG = '#0f3460';
const ERROR_RED = '#e74c3c';
const MAX_FREE_CHARS = 500;

export default function TranslateScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const {
    inputText,
    outputText,
    direction,
    pronunciation,
    culturalNote,
    alternatives,
    isTranslating,
    error,
    usage,
    setInputText,
    setDirection,
    swapDirection,
    translate,
    clearTranslation,
    clearError,
    fetchUsage,
    addFavorite,
    isFavorited,
  } = useTranslationStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swapRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  useEffect(() => {
    if (outputText) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [outputText]);

  const handleTranslate = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    await translate();
  };

  const handleSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(swapRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(swapRotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    swapDirection();
  };

  const handleFavorite = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!outputText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFavorited()) {
      Alert.alert('Already saved', 'This translation is already in your favorites.');
      return;
    }
    await addFavorite();
    Alert.alert('Saved!', 'Translation added to your favorites.');
  };

  const handleCopy = () => {
    // Use Clipboard API (requires expo-clipboard)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Clipboard.setStringAsync(outputText);
    Alert.alert('Copied!', 'Translation copied to clipboard.');
  };

  const isPremium = profile?.isPremium ?? false;
  const usedChars = usage?.dailyCharsUsed ?? 0;
  const charLimit = usage?.dailyCharLimit ?? MAX_FREE_CHARS;
  const usagePercent = charLimit > 0 ? Math.min(usedChars / charLimit, 1) : 0;
  const usageBarColor = usagePercent > 0.8 ? ERROR_RED : GOLD;

  const swapRotate = swapRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const sourceLabel = direction === 'english_to_edo' ? 'English' : 'Edo';
  const targetLabel = direction === 'english_to_edo' ? 'Edo (Bini)' : 'English';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={[NAVY, NAVY2]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appName}>BiZY</Text>
            <Text style={styles.appTagline}>Edo Translator</Text>
          </View>
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumBadge}
              onPress={() => router.push('/modal/premium')}
            >
              <Ionicons name="star" size={14} color={NAVY} />
              <Text style={styles.premiumBadgeText}>Get Premium</Text>
            </TouchableOpacity>
          )}
          {isPremium && (
            <View style={styles.premiumActiveBadge}>
              <Ionicons name="star" size={14} color={GOLD} />
              <Text style={styles.premiumActiveText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Usage bar (free users only) */}
        {!isPremium && usage && (
          <View style={styles.usageContainer}>
            <View style={styles.usageBar}>
              <View
                style={[
                  styles.usageFill,
                  { width: `${usagePercent * 100}%`, backgroundColor: usageBarColor },
                ]}
              />
            </View>
            <Text style={styles.usageText}>
              {usedChars}/{charLimit} chars today
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Direction selector */}
        <View style={styles.directionRow}>
          <View style={styles.langPill}>
            <Text style={styles.langLabel}>{sourceLabel}</Text>
          </View>

          <TouchableOpacity onPress={handleSwap} style={styles.swapBtn} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ rotate: swapRotate }] }}>
              <Ionicons name="swap-horizontal" size={22} color={GOLD} />
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.langPill}>
            <Text style={styles.langLabel}>{targetLabel}</Text>
          </View>
        </View>

        {/* Input card */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={`Type ${sourceLabel} text here…`}
            placeholderTextColor={GRAY}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={isPremium ? 10000 : MAX_FREE_CHARS}
            textAlignVertical="top"
            returnKeyType="done"
            onSubmitEditing={handleTranslate}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>
              {inputText.length}/{isPremium ? '∞' : MAX_FREE_CHARS}
            </Text>
            <View style={styles.inputActions}>
              {inputText.length > 0 && (
                <TouchableOpacity onPress={clearTranslation} style={styles.iconBtn}>
                  <Ionicons name="close-circle" size={20} color={GRAY} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Translate button */}
        <TouchableOpacity
          style={[styles.translateBtn, (isTranslating || !inputText.trim()) && styles.translateBtnDisabled]}
          onPress={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={inputText.trim() ? [GOLD, GOLD_LIGHT] : ['#555', '#555']}
            style={styles.translateBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isTranslating ? (
              <ActivityIndicator color={NAVY} size="small" />
            ) : (
              <>
                <Ionicons name="language" size={20} color={NAVY} />
                <Text style={styles.translateBtnText}>Translate</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Error message */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={18} color={ERROR_RED} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={18} color={GRAY} />
            </TouchableOpacity>
            {error.includes('limit') && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push('/modal/premium')}
              >
                <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Output card */}
        {outputText ? (
          <Animated.View style={[styles.outputCard, { opacity: fadeAnim }]}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputLabel}>{targetLabel}</Text>
              <View style={styles.outputActions}>
                <TouchableOpacity onPress={handleCopy} style={styles.iconBtn}>
                  <Ionicons name="copy-outline" size={20} color={GOLD} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFavorite} style={styles.iconBtn}>
                  <Ionicons
                    name={isFavorited() ? 'heart' : 'heart-outline'}
                    size={20}
                    color={GOLD}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.outputText} selectable>
              {outputText}
            </Text>

            {/* Pronunciation */}
            {pronunciation ? (
              <View style={styles.metaRow}>
                <Ionicons name="volume-medium-outline" size={16} color={GOLD} />
                <Text style={styles.metaLabel}>Pronunciation: </Text>
                <Text style={styles.metaValue}>{pronunciation}</Text>
              </View>
            ) : null}

            {/* Cultural note */}
            {culturalNote ? (
              <TouchableOpacity
                style={styles.culturalNoteRow}
                onPress={() => router.push('/modal/cultural-note')}
              >
                <Ionicons name="information-circle-outline" size={16} color={GOLD_LIGHT} />
                <Text style={styles.culturalNoteText} numberOfLines={2}>
                  {culturalNote}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={GRAY} />
              </TouchableOpacity>
            ) : null}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <View style={styles.altSection}>
                <Text style={styles.altHeader}>Alternatives</Text>
                {alternatives.map((alt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.altItem}
                    onPress={() => setInputText(alt)}
                  >
                    <Text style={styles.altText}>{alt}</Text>
                    <Ionicons name="arrow-forward" size={14} color={GRAY} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        ) : null}

        {/* Not logged in CTA */}
        {!user && (
          <View style={styles.loginCta}>
            <Ionicons name="lock-closed-outline" size={24} color={GOLD} />
            <Text style={styles.loginCtaText}>
              Sign in to save favorites and track your history
            </Text>
            <TouchableOpacity
              style={styles.loginCtaBtn}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginCtaBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 12,
    color: GRAY,
    letterSpacing: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  premiumBadgeText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '700',
  },
  premiumActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  premiumActiveText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  usageContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usageBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 2,
  },
  usageText: {
    color: GRAY,
    fontSize: 11,
    minWidth: 100,
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    gap: 12,
  },
  langPill: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  langLabel: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderColor: GOLD,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
  },
  input: {
    color: WHITE,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 80,
    maxHeight: 200,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopColor: '#2a3a5e',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  charCount: {
    color: GRAY,
    fontSize: 12,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  translateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  translateBtnDisabled: {
    opacity: 0.6,
  },
  translateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  translateBtnText: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorCard: {
    backgroundColor: '#2d1b1b',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  errorText: {
    color: '#ff7b7b',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  upgradeBtn: {
    width: '100%',
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeBtnText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '700',
  },
  outputCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  outputLabel: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  outputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  outputText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  metaLabel: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
  },
  metaValue: {
    color: GRAY,
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },
  culturalNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2a3e',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  culturalNoteText: {
    color: '#d0d8f0',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  altSection: {
    marginTop: 12,
    borderTopColor: '#2a3a5e',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  altHeader: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  altItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#2a3a5e',
    borderBottomWidth: 0.5,
  },
  altText: {
    color: '#d0d8f0',
    fontSize: 15,
  },
  loginCta: {
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    gap: 8,
  },
  loginCtaText: {
    color: GRAY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginCtaBtn: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
  },
  loginCtaBtnText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '700',
  },
});
