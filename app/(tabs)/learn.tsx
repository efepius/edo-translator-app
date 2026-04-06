/**
 * app/(tabs)/learn.tsx
 * Structured Edo language lessons organized by level.
 * File path in Expo project: app/(tabs)/learn.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import dictionaryData from '../../assets/data/dictionary.json';

const NAVY = '#1a1a2e';
const CARD_BG = '#0f3460';
const GOLD = '#c9a227';
const WHITE = '#ffffff';
const GRAY = '#aaaaaa';
const NAVY2 = '#16213e';

type Level = 'all' | 'beginner' | 'intermediate' | 'advanced';

interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  vocabulary: string[];
  objectives: string[];
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
};

const LEVEL_GRADIENTS: Record<string, [string, string]> = {
  beginner: ['#14532d', '#166534'],
  intermediate: ['#713f12', '#854d0e'],
  advanced: ['#7f1d1d', '#991b1b'],
};

export default function LearnScreen() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('all');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const lessons: Lesson[] = useMemo(() => {
    const data = dictionaryData as { lessons?: Lesson[] };
    return data.lessons || [];
  }, []);

  const filteredLessons = useMemo(() => {
    if (selectedLevel === 'all') return lessons;
    return lessons.filter((l) => l.level.toLowerCase() === selectedLevel);
  }, [lessons, selectedLevel]);

  const levels: { label: string; value: Level }[] = [
    { label: 'All', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  if (selectedLesson) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Lesson header */}
          <LinearGradient
            colors={LEVEL_GRADIENTS[selectedLesson.level.toLowerCase()] || ['#1a1a2e', '#0f3460']}
            style={styles.lessonHeader}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setSelectedLesson(null)}
            >
              <Ionicons name="arrow-back" size={22} color={WHITE} />
            </TouchableOpacity>
            <View style={[styles.levelBadgeLarge, { borderColor: LEVEL_COLORS[selectedLesson.level.toLowerCase()] || GOLD }]}>
              <Text style={[styles.levelBadgeLargeText, { color: LEVEL_COLORS[selectedLesson.level.toLowerCase()] || GOLD }]}>
                {selectedLesson.level}
              </Text>
            </View>
            <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>
            <Text style={styles.lessonDesc}>{selectedLesson.description}</Text>
          </LinearGradient>

          <View style={styles.lessonContent}>
            {/* Objectives */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="flag-outline" size={16} color={GOLD} /> Learning Objectives
              </Text>
              {selectedLesson.objectives.map((obj, i) => (
                <View key={i} style={styles.objectiveRow}>
                  <View style={styles.objectiveDot} />
                  <Text style={styles.objectiveText}>{obj}</Text>
                </View>
              ))}
            </View>

            {/* Vocabulary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="list-outline" size={16} color={GOLD} /> Vocabulary ({selectedLesson.vocabulary.length} words)
              </Text>
              <View style={styles.vocabGrid}>
                {selectedLesson.vocabulary.map((word, i) => (
                  <View key={i} style={styles.vocabChip}>
                    <Text style={styles.vocabText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CTA to practice */}
            <TouchableOpacity style={styles.practiceBtnContainer} activeOpacity={0.85}>
              <LinearGradient
                colors={[GOLD, '#e8c547']}
                style={styles.practiceBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="language-outline" size={20} color={NAVY} />
                <Text style={styles.practiceBtnText}>Practice with Translator</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn Edo</Text>
        <Text style={styles.headerSub}>{filteredLessons.length} lessons available</Text>
      </View>

      {/* Level filter */}
      <View style={styles.levelFilter}>
        {levels.map((lvl) => (
          <TouchableOpacity
            key={lvl.value}
            style={[
              styles.levelBtn,
              selectedLevel === lvl.value && styles.levelBtnActive,
              lvl.value !== 'all' && selectedLevel === lvl.value && {
                backgroundColor: LEVEL_COLORS[lvl.value] + '33',
                borderColor: LEVEL_COLORS[lvl.value],
              },
            ]}
            onPress={() => setSelectedLevel(lvl.value)}
          >
            <Text
              style={[
                styles.levelBtnText,
                selectedLevel === lvl.value && {
                  color: lvl.value === 'all' ? NAVY : LEVEL_COLORS[lvl.value],
                  fontWeight: '700',
                },
              ]}
            >
              {lvl.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lessons list */}
      <FlatList
        data={filteredLessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const levelColor = LEVEL_COLORS[item.level.toLowerCase()] || GOLD;
          return (
            <TouchableOpacity
              style={styles.lessonCard}
              onPress={() => setSelectedLesson(item)}
              activeOpacity={0.8}
            >
              <View style={styles.lessonCardHeader}>
                <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
                <Text style={[styles.levelLabel, { color: levelColor }]}>
                  {item.level}
                </Text>
                <Text style={styles.lessonId}>{item.id}</Text>
              </View>
              <Text style={styles.lessonCardTitle}>{item.title}</Text>
              <Text style={styles.lessonCardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.lessonCardFooter}>
                <Text style={styles.vocabCount}>
                  {item.vocabulary.length} vocabulary words
                </Text>
                <Ionicons name="chevron-forward" size={16} color={GRAY} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color={GRAY} />
            <Text style={styles.emptyText}>No lessons for this level</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: WHITE },
  headerSub: { fontSize: 14, color: GRAY, marginTop: 2 },
  levelFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a3a5e',
    alignItems: 'center',
  },
  levelBtnActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  levelBtnText: {
    color: GRAY,
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  lessonCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonId: {
    color: GRAY,
    fontSize: 12,
    marginLeft: 'auto',
  },
  lessonCardTitle: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  lessonCardDesc: {
    color: GRAY,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  lessonCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vocabCount: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: { color: GRAY, fontSize: 16 },

  // Lesson detail view
  lessonHeader: {
    padding: 24,
    paddingTop: 16,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  levelBadgeLarge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  levelBadgeLargeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonTitle: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  lessonDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  lessonContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  objectiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    marginTop: 7,
  },
  objectiveText: {
    flex: 1,
    color: '#d0d8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  vocabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vocabChip: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2a3a5e',
  },
  vocabText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '500',
  },
  practiceBtnContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  practiceBtnText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: '800',
  },
});
