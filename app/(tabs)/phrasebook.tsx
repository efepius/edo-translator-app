/**
 * app/(tabs)/phrasebook.tsx
 * Curated Edo phrases grouped by category — greetings, emergency, shopping, etc.
 * File path in Expo project: app/(tabs)/phrasebook.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslationStore } from '../../store/translationStore';

// Import phrasebook data
import dictionaryData from '../../assets/data/dictionary.json';

const NAVY = '#1a1a2e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const NAVY2 = '#16213e';

interface Phrase {
  english: string;
  edo: string;
  pronunciation?: string;
}

interface PhraseSection {
  title: string;
  icon: string;
  color: string;
  phrases: Phrase[];
}

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  'Greetings & Introductions': { icon: 'hand-left-outline', color: '#4ade80' },
  'Emergency Phrases': { icon: 'warning-outline', color: '#f87171' },
  'Shopping & Numbers': { icon: 'cart-outline', color: '#60a5fa' },
  'Directions': { icon: 'navigate-outline', color: '#c084fc' },
  'Social Phrases': { icon: 'people-outline', color: '#fb923c' },
  'At the Hospital': { icon: 'medical-outline', color: '#f472b6' },
  'Cultural Proverbs': { icon: 'book-outline', color: '#fde68a' },
};

export default function PhrasebookScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>('Greetings & Introductions');
  const setInputText = useTranslationStore((s) => s.setInputText);
  const setDirection = useTranslationStore((s) => s.setDirection);

  // Parse phrasebook from data file
  const sections: PhraseSection[] = useMemo(() => {
    const data = dictionaryData as {
      phrasebook?: { [key: string]: Phrase[] };
      proverbs?: { edo: string; english: string; theme: string }[];
    };

    const result: PhraseSection[] = [];

    if (data.phrasebook) {
      for (const [title, phrases] of Object.entries(data.phrasebook)) {
        const meta = CATEGORY_ICONS[title] || { icon: 'chatbubble-outline', color: GOLD };
        result.push({ title, phrases, ...meta });
      }
    }

    // Add proverbs section
    if (data.proverbs && data.proverbs.length > 0) {
      result.push({
        title: 'Cultural Proverbs',
        icon: 'book-outline',
        color: '#fde68a',
        phrases: data.proverbs.map((p) => ({
          english: p.english,
          edo: p.edo,
          pronunciation: p.theme,
        })),
      });
    }

    return result;
  }, []);

  const handleUsePhrase = (phrase: Phrase) => {
    setInputText(phrase.english);
    setDirection('english_to_edo');
    router.push('/(tabs)/translate');
  };

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phrasebook</Text>
        <Text style={styles.headerSub}>Essential Edo phrases</Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isExpanded = expandedSection === item.title;

          return (
            <View style={styles.sectionCard}>
              {/* Section header */}
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(item.title)}
                activeOpacity={0.8}
              >
                <View style={[styles.sectionIcon, { backgroundColor: item.color + '22' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.sectionTitleBox}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <Text style={styles.sectionCount}>{item.phrases.length} phrases</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={GRAY}
                />
              </TouchableOpacity>

              {/* Phrases list */}
              {isExpanded && (
                <View style={styles.phrasesList}>
                  {item.phrases.map((phrase, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.phraseRow,
                        i === item.phrases.length - 1 && styles.phraseRowLast,
                      ]}
                      onPress={() => handleUsePhrase(phrase)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.phraseContent}>
                        <Text style={styles.phraseEdo}>{phrase.edo}</Text>
                        <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                        {phrase.pronunciation && item.title !== 'Cultural Proverbs' && (
                          <Text style={styles.phrasePronunciation}>
                            /{phrase.pronunciation}/
                          </Text>
                        )}
                        {item.title === 'Cultural Proverbs' && phrase.pronunciation && (
                          <View style={styles.themeTag}>
                            <Text style={styles.themeTagText}>{phrase.pronunciation}</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.useBtn}
                        onPress={() => handleUsePhrase(phrase)}
                      >
                        <Ionicons name="language-outline" size={16} color={GOLD} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={GRAY} />
            <Text style={styles.emptyText}>No phrases available</Text>
          </View>
        }
      />
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: WHITE,
  },
  headerSub: {
    fontSize: 14,
    color: GRAY,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleBox: {
    flex: 1,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCount: {
    color: GRAY,
    fontSize: 12,
    marginTop: 2,
  },
  phrasesList: {
    borderTopWidth: 1,
    borderTopColor: '#1a2a3e',
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a2a3e',
  },
  phraseRowLast: {
    borderBottomWidth: 0,
  },
  phraseContent: {
    flex: 1,
  },
  phraseEdo: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '600',
  },
  phraseEnglish: {
    color: WHITE,
    fontSize: 14,
    marginTop: 2,
  },
  phrasePronunciation: {
    color: GRAY,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  themeTag: {
    marginTop: 4,
    backgroundColor: '#1a2a3e',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  themeTagText: {
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '500',
  },
  useBtn: {
    padding: 8,
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    color: GRAY,
    fontSize: 16,
  },
});
