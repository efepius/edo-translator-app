/**
 * app/(tabs)/dictionary.tsx
 * Edo↔English dictionary with search, filters, and audio pronunciation.
 * File path in Expo project: app/(tabs)/dictionary.tsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import the dictionary data
// In your project, copy edo_dictionary_data.json to assets/data/dictionary.json
import dictionaryData from '../../assets/data/dictionary.json';

const NAVY = '#1a1a2e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const NAVY2 = '#16213e';

type PartOfSpeech = 'all' | 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'greeting' | 'pronoun';

interface DictionaryEntry {
  edo: string;
  english: string;
  part_of_speech: string;
  pronunciation?: string;
  example_sentence?: string;
  example_translation?: string;
  cultural_note?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const POS_FILTERS: { label: string; value: PartOfSpeech }[] = [
  { label: 'All', value: 'all' },
  { label: 'Nouns', value: 'noun' },
  { label: 'Verbs', value: 'verb' },
  { label: 'Adjectives', value: 'adjective' },
  { label: 'Phrases', value: 'phrase' },
  { label: 'Greetings', value: 'greeting' },
];

export default function DictionaryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPOS, setSelectedPOS] = useState<PartOfSpeech>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchDirection, setSearchDirection] = useState<'edo' | 'english'>('english');

  const entries: DictionaryEntry[] = useMemo(() => {
    return (dictionaryData as { entries: DictionaryEntry[] }).entries || [];
  }, []);

  const filteredEntries = useMemo(() => {
    let result = entries;

    // Filter by POS
    if (selectedPOS !== 'all') {
      result = result.filter(
        (e) => e.part_of_speech.toLowerCase().includes(selectedPOS)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        if (searchDirection === 'english') {
          return e.english.toLowerCase().includes(q) || e.edo.toLowerCase().includes(q);
        } else {
          return e.edo.toLowerCase().includes(q) || e.english.toLowerCase().includes(q);
        }
      });
    }

    return result;
  }, [entries, searchQuery, selectedPOS, searchDirection]);

  const entryKey = (e: DictionaryEntry) => `${e.edo}-${e.english}`;

  const toggleExpand = (key: string) => {
    setExpandedId(expandedId === key ? null : key);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#facc15';
      case 'advanced': return '#f87171';
      default: return GRAY;
    }
  };

  const renderItem = ({ item }: { item: DictionaryEntry }) => {
    const key = entryKey(item);
    const isExpanded = expandedId === key;

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => toggleExpand(key)}
        activeOpacity={0.8}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryMain}>
            <Text style={styles.edoWord}>{item.edo}</Text>
            <Text style={styles.englishWord}>{item.english}</Text>
          </View>
          <View style={styles.entryMeta}>
            <View style={[styles.diffBadge, { borderColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={[styles.diffText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={GRAY}
            />
          </View>
        </View>

        <Text style={styles.posLabel}>{item.part_of_speech}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.pronunciation && (
              <View style={styles.pronRow}>
                <Ionicons name="volume-medium-outline" size={14} color={GOLD} />
                <Text style={styles.pronText}>{item.pronunciation}</Text>
              </View>
            )}

            {item.example_sentence && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleEdo}>{item.example_sentence}</Text>
                {item.example_translation && (
                  <Text style={styles.exampleEn}>{item.example_translation}</Text>
                )}
              </View>
            )}

            {item.cultural_note && (
              <View style={styles.culturalBox}>
                <Ionicons name="information-circle-outline" size={14} color={GOLD} />
                <Text style={styles.culturalText}>{item.cultural_note}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dictionary</Text>
        <Text style={styles.headerSub}>{filteredEntries.length} entries</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={GRAY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search words…"
            placeholderTextColor={GRAY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={GRAY} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search direction toggle */}
        <View style={styles.directionToggle}>
          <TouchableOpacity
            style={[styles.dirBtn, searchDirection === 'english' && styles.dirBtnActive]}
            onPress={() => setSearchDirection('english')}
          >
            <Text style={[styles.dirBtnText, searchDirection === 'english' && styles.dirBtnTextActive]}>
              EN→Edo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dirBtn, searchDirection === 'edo' && styles.dirBtnActive]}
            onPress={() => setSearchDirection('edo')}
          >
            <Text style={[styles.dirBtnText, searchDirection === 'edo' && styles.dirBtnTextActive]}>
              Edo→EN
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* POS filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={POS_FILTERS}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedPOS === item.value && styles.filterChipActive]}
            onPress={() => setSelectedPOS(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedPOS === item.value && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Dictionary list */}
      <FlatList
        data={filteredEntries}
        keyExtractor={entryKey}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={GRAY} />
            <Text style={styles.emptyText}>No entries found</Text>
            <Text style={styles.emptySubText}>Try a different search term</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: WHITE,
  },
  headerSub: {
    fontSize: 14,
    color: GRAY,
  },
  searchContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
  },
  directionToggle: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dirBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirBtnActive: {
    backgroundColor: GOLD,
    borderRadius: 10,
  },
  dirBtnText: {
    color: GRAY,
    fontSize: 12,
    fontWeight: '600',
  },
  dirBtnTextActive: {
    color: NAVY,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a3a5e',
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  filterChipText: {
    color: GRAY,
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: NAVY,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  entryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryMain: {
    flex: 1,
  },
  edoWord: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '700',
  },
  englishWord: {
    color: WHITE,
    fontSize: 15,
    marginTop: 2,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diffBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffText: {
    fontSize: 11,
    fontWeight: '800',
  },
  posLabel: {
    color: GRAY,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 12,
    borderTopColor: '#1a2a3e',
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  pronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pronText: {
    color: GOLD,
    fontSize: 14,
    fontStyle: 'italic',
  },
  exampleBox: {
    backgroundColor: NAVY2,
    borderRadius: 8,
    padding: 10,
  },
  exampleEdo: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  exampleEn: {
    color: GRAY,
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  culturalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#1a2435',
    borderRadius: 8,
    padding: 8,
  },
  culturalText: {
    flex: 1,
    color: '#c8d4e8',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    color: GRAY,
    fontSize: 14,
  },
});
