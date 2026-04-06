/**
 * app/modal/cultural-note.tsx
 * Full-screen view of a cultural note attached to a translation.
 * File path in Expo project: app/modal/cultural-note.tsx
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslationStore } from '../../store/translationStore';

const NAVY = '#1a1a2e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';

export default function CulturalNoteScreen() {
  const { inputText, outputText, direction, culturalNote, pronunciation } =
    useTranslationStore();

  const sourceLabel = direction === 'english_to_edo' ? 'English' : 'Edo';
  const targetLabel = direction === 'english_to_edo' ? 'Edo (Bini)' : 'English';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Translation recap */}
        <View style={styles.translationCard}>
          <View style={styles.row}>
            <Text style={styles.langLabel}>{sourceLabel}</Text>
            <Text style={styles.inputText}>{inputText}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.langLabel, { color: GOLD }]}>{targetLabel}</Text>
            <Text style={styles.outputText}>{outputText}</Text>
          </View>
          {pronunciation && (
            <View style={styles.pronRow}>
              <Ionicons name="volume-medium-outline" size={16} color={GOLD} />
              <Text style={styles.pronText}>/{pronunciation}/</Text>
            </View>
          )}
        </View>

        {/* Cultural note */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="information-circle" size={22} color={GOLD} />
            <Text style={styles.noteTitle}>Cultural Context</Text>
          </View>
          <Text style={styles.noteText}>{culturalNote || 'No cultural note available for this translation.'}</Text>
        </View>

        {/* About Edo language */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About the Edo Language</Text>
          <Text style={styles.aboutText}>
            Edo (also known as Bini) is a Volta-Niger language spoken primarily in
            Edo State, Nigeria, by the Edo people — particularly in Benin City, the
            former capital of the Benin Kingdom. It has over 1 million speakers and
            is known for its rich tonal system and complex verb morphology.
          </Text>
          <Text style={styles.aboutText}>
            The Benin Kingdom, which flourished between the 13th and 19th centuries,
            produced world-famous bronzes and artwork. The Edo language carries
            this cultural heritage through its proverbs, greetings, and ceremonial
            expressions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  content: {
    padding: 20,
    gap: 16,
  },
  translationCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  row: { gap: 4 },
  langLabel: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputText: { color: WHITE, fontSize: 17 },
  outputText: { color: GOLD, fontSize: 20, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1a2a3e' },
  pronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pronText: { color: GRAY, fontSize: 14, fontStyle: 'italic' },

  noteCard: {
    backgroundColor: '#1a2a3e',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    gap: 10,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteTitle: { color: WHITE, fontSize: 17, fontWeight: '700' },
  noteText: { color: '#d0d8f0', fontSize: 15, lineHeight: 24 },

  aboutCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  aboutTitle: { color: WHITE, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  aboutText: { color: GRAY, fontSize: 14, lineHeight: 22 },
});
