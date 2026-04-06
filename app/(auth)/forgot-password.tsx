/**
 * app/(auth)/forgot-password.tsx
 * Password reset screen — sends a Firebase reset email.
 * File path in Expo project: app/(auth)/forgot-password.tsx
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send reset email. Please check your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[NAVY, NAVY2]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.content}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={WHITE} />
            </TouchableOpacity>

            {sent ? (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <Ionicons name="mail-open-outline" size={40} color={GOLD} />
                </View>
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successSub}>
                  We've sent a password reset link to{'\n'}
                  <Text style={{ color: GOLD }}>{email}</Text>
                </Text>
                <Text style={styles.successNote}>
                  Didn't receive it? Check your spam folder, or try again with a different address.
                </Text>
                <TouchableOpacity style={styles.backToLoginBtn} onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.backToLoginText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Reset Password</Text>
                  <Text style={styles.headerSub}>
                    Enter your email and we'll send you a link to reset your password.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
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
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.resetBtn, loading && styles.btnDisabled]}
                  onPress={handleReset}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={loading ? ['#555', '#555'] : [GOLD, GOLD_LIGHT]}
                    style={styles.resetBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color={NAVY} />
                    ) : (
                      <Text style={styles.resetBtnText}>Send Reset Link</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    marginTop: 24,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: WHITE,
  },
  headerSub: {
    fontSize: 15,
    color: GRAY,
    marginTop: 8,
    lineHeight: 22,
  },
  inputGroup: { gap: 8, marginBottom: 24 },
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
  input: { flex: 1, color: WHITE, fontSize: 16 },
  resetBtn: { borderRadius: 14, overflow: 'hidden' },
  btnDisabled: { opacity: 0.6 },
  resetBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  resetBtnText: { color: NAVY, fontSize: 17, fontWeight: '800' },

  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GOLD + '44',
  },
  successTitle: { color: WHITE, fontSize: 26, fontWeight: '800' },
  successSub: { color: GRAY, fontSize: 15, textAlign: 'center', lineHeight: 24 },
  successNote: { color: GRAY, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  backToLoginBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  backToLoginText: { color: NAVY, fontSize: 15, fontWeight: '800' },
});
