/**
 * store/translationStore.ts
 * Zustand store for translation state — current input/output, history, favorites, usage
 */

import { create } from 'zustand';
import {
  translateText,
  getUsage,
  getTranslationHistory,
  getFavorites,
  saveFavorite,
  deleteFavorite,
  getFriendlyError,
  Translation,
  Favorite,
  TranslationDirection,
  UsageResponse,
} from '../lib/api';

interface TranslationState {
  // Current translation session
  inputText: string;
  outputText: string;
  direction: TranslationDirection;
  pronunciation: string;
  culturalNote: string;
  alternatives: string[];
  isTranslating: boolean;
  error: string | null;

  // Usage
  usage: UsageResponse | null;
  usageLoading: boolean;

  // History
  history: Translation[];
  historyLoading: boolean;

  // Favorites
  favorites: Favorite[];
  favoritesLoading: boolean;

  // Actions
  setInputText: (text: string) => void;
  setDirection: (direction: TranslationDirection) => void;
  swapDirection: () => void;
  translate: () => Promise<void>;
  clearTranslation: () => void;
  clearError: () => void;

  // Usage
  fetchUsage: () => Promise<void>;

  // History
  fetchHistory: () => Promise<void>;

  // Favorites
  fetchFavorites: () => Promise<void>;
  addFavorite: (label?: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorited: () => boolean;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  inputText: '',
  outputText: '',
  direction: 'english_to_edo',
  pronunciation: '',
  culturalNote: '',
  alternatives: [],
  isTranslating: false,
  error: null,

  usage: null,
  usageLoading: false,

  history: [],
  historyLoading: false,

  favorites: [],
  favoritesLoading: false,

  setInputText: (text) => set({ inputText: text }),

  setDirection: (direction) => set({ direction }),

  swapDirection: () => {
    const { direction, inputText, outputText } = get();
    set({
      direction: direction === 'english_to_edo' ? 'edo_to_english' : 'english_to_edo',
      inputText: outputText,
      outputText: inputText,
      pronunciation: '',
      culturalNote: '',
      alternatives: [],
    });
  },

  translate: async () => {
    const { inputText, direction } = get();
    if (!inputText.trim()) return;

    set({ isTranslating: true, error: null, outputText: '', pronunciation: '', culturalNote: '', alternatives: [] });

    try {
      const result = await translateText({ text: inputText.trim(), direction });
      set({
        outputText: result.translation,
        pronunciation: result.pronunciation || '',
        culturalNote: result.cultural_note || '',
        alternatives: result.alternatives || [],
        isTranslating: false,
      });
      // Update usage display
      set((state) => ({
        usage: state.usage
          ? {
              ...state.usage,
              dailyCharsUsed: state.usage.dailyCharLimit - result.remainingChars,
            }
          : null,
      }));
    } catch (err) {
      set({ error: getFriendlyError(err), isTranslating: false });
    }
  },

  clearTranslation: () =>
    set({
      inputText: '',
      outputText: '',
      pronunciation: '',
      culturalNote: '',
      alternatives: [],
      error: null,
    }),

  clearError: () => set({ error: null }),

  fetchUsage: async () => {
    set({ usageLoading: true });
    try {
      const usage = await getUsage();
      set({ usage, usageLoading: false });
    } catch {
      set({ usageLoading: false });
    }
  },

  fetchHistory: async () => {
    set({ historyLoading: true });
    try {
      const history = await getTranslationHistory(30);
      set({ history, historyLoading: false });
    } catch {
      set({ historyLoading: false });
    }
  },

  fetchFavorites: async () => {
    set({ favoritesLoading: true });
    try {
      const favorites = await getFavorites();
      set({ favorites, favoritesLoading: false });
    } catch {
      set({ favoritesLoading: false });
    }
  },

  addFavorite: async (label) => {
    const { inputText, outputText, direction } = get();
    if (!inputText || !outputText) return;
    try {
      await saveFavorite({ inputText, outputText, direction, label });
      await get().fetchFavorites();
    } catch (err) {
      set({ error: getFriendlyError(err) });
    }
  },

  removeFavorite: async (id) => {
    try {
      await deleteFavorite(id);
      set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== id),
      }));
    } catch (err) {
      set({ error: getFriendlyError(err) });
    }
  },

  isFavorited: () => {
    const { inputText, outputText, favorites } = get();
    return favorites.some(
      (f) => f.inputText === inputText && f.outputText === outputText
    );
  },
}));
