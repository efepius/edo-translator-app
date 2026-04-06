/**
 * app/(auth)/signup.tsx
 * Account creation screen.
 * File path in Expo project: app/(auth)/signup.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const NAVY = '#1a1a2e';
const NAVY2 = '#16213e';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c547';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const CARD_BG = '#0f3460';
const ERROR_RED = '#e74c3c';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const signUp = useAuthStore((s) => s.signUp);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSignup = async () => {
    clearError();

    if (!displayName.trim()) {
      Alert.alert('Missing field', 'Please enter your name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing field', 'Please enter your email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service to continue.');
      return;
    }

    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace('/(tabs)/translate');
    } catch {
      // Error handled in store
    }
  };

  return (
    <LinearGradient colors={[NAVY, NAVY2]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={WHITE} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create account</Text>
              <Text style={styles.headerSub}>
                Start your journey with the Edo language
              </Text>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={ERROR_RED} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Ionicons name="close" size={18} color={GRAY} />
                </TouchableOpacity>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={GRAY} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={GRAY}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color={GRAY} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={GRAY}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={GRAY} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={GRAY}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={GRAY}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[
                  styles.inputRow,
                  confirmPassword && password !== confirmPassword && styles.inputRowError,
                ]}>
                  <Ionicons name="lock-closed-outline" size={18} color={GRAY} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor={GRAY}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  {confirmPassword && (
                    <Ionicons
                      name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={password === confirmPassword ? '#4ade80' : ERROR_RED}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={14} color={NAVY} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Free plan info */}
            <View style={styles.freeInfo}>
              <Ionicons name="gift-outline" size={18} color={GOLD} />
              <Text style={styles.freeInfoText}>
                Free plan: 500 characters/day. Upgrade to Premium anytime for unlimited access.
              </Text>
            </View>

            {/* Signup button */}
            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? ['#555', '#555'] : [GOLD, GOLD_LIGHT]}
                style={styles.signupBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={NAVY} />
                ) : (
                  <Text style={styles.signupBtnText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: WHITE,
  },
  headerSub: {
    fontSize: 15,
    color: GRAY,
    marginTop: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d1b1b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#ff7b7b',
    fontSize: 14,
  },
  form: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: { gap: 6 },
  label: {
    color: GRAY,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  inputRowError: {
    borderColor: ERROR_RED,
  },
  input: {
    flex: 1,
    color: WHITE,
    fontSize: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: GOLD,
  },
  termsText: {
    flex: 1,
    color: GRAY,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: GOLD,
    fontWeight: '600',
  },
  freeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: GOLD + '44',
  },
  freeInfoText: {
    flex: 1,
    color: '#d0d8f0',
    fontSize: 13,
    lineHeight: 18,
  },
  signupBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  signupBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  signupBtnText: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '800',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: { color: GRAY, fontSize: 15 },
  loginLink: { color: GOLD, fontSize: 15, fontWeight: '700' },
});
