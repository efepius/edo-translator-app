/**
 * lib/api.ts
 * Firebase Cloud Functions API client for BiZY Edo Translator
 *
 * Wraps all Cloud Function calls with proper typing and error handling.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type TranslationDirection = 'edo_to_english' | 'english_to_edo';

export interface TranslateRequest {
  text: string;
  direction: TranslationDirection;
  context?: string;
}

export interface TranslateResponse {
  translation: string;
  pronunciation?: string;
  cultural_note?: string;
  alternatives?: string[];
  direction: TranslationDirection;
  charCount: number;
  remainingChars: number;
}

export interface UsageResponse {
  dailyCharsUsed: number;
  dailyCharLimit: number;
  isPremium: boolean;
  resetTime: string;
}

export interface Translation {
  id: string;
  inputText: string;
  outputText: string;
  direction: TranslationDirection;
  pronunciation?: string;
  cultural_note?: string;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  inputText: string;
  outputText: string;
  direction: TranslationDirection;
  label?: string;
  createdAt: Date;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

// ============================================================
// TRANSLATION API
// ============================================================

/**
 * Translate text between Edo and English using Claude AI
 */
export async function translateText(
  request: TranslateRequest
): Promise<TranslateResponse> {
  const translateFn = httpsCallable<TranslateRequest, TranslateResponse>(
    functions,
    'translate'
  );
  const result = await translateFn(request);
  return result.data;
}

/**
 * Get current usage stats for the authenticated user
 */
export async function getUsage(): Promise<UsageResponse> {
  const getUsageFn = httpsCallable<Record<string, never>, UsageResponse>(
    functions,
    'getUsage'
  );
  const result = await getUsageFn({});
  return result.data;
}

// ============================================================
// TRANSLATION HISTORY
// ============================================================

/**
 * Get paginated translation history
 */
export async function getTranslationHistory(
  limit = 20,
  lastId?: string
): Promise<Translation[]> {
  const getHistoryFn = httpsCallable<
    { limit: number; lastId?: string },
    { translations: Translation[] }
  >(functions, 'getTranslationHistory');
  const result = await getHistoryFn({ limit, lastId });
  return result.data.translations;
}

// ============================================================
// FAVORITES
// ============================================================

/**
 * Save a translation as a favorite
 */
export async function saveFavorite(data: {
  inputText: string;
  outputText: string;
  direction: TranslationDirection;
  label?: string;
}): Promise<{ id: string }> {
  const saveFavFn = httpsCallable<typeof data, { id: string }>(
    functions,
    'saveFavorite'
  );
  const result = await saveFavFn(data);
  return result.data;
}

/**
 * Get all favorites for the current user
 */
export async function getFavorites(): Promise<Favorite[]> {
  const getFavFn = httpsCallable<Record<string, never>, { favorites: Favorite[] }>(
    functions,
    'getFavorites'
  );
  const result = await getFavFn({});
  return result.data.favorites;
}

/**
 * Delete a favorite by ID
 */
export async function deleteFavorite(id: string): Promise<void> {
  const delFavFn = httpsCallable<{ id: string }, void>(
    functions,
    'deleteFavorite'
  );
  await delFavFn({ id });
}

// ============================================================
// SUBSCRIPTION / STRIPE
// ============================================================

/**
 * Create a Stripe Checkout session for premium subscription.
 * The returned URL should be opened in a browser/WebView.
 */
export async function createCheckoutSession(data: {
  planId: 'monthly' | 'yearly';
  returnUrl: string;
}): Promise<CheckoutSessionResponse> {
  const checkoutFn = httpsCallable<typeof data, CheckoutSessionResponse>(
    functions,
    'createCheckoutSession'
  );
  const result = await checkoutFn(data);
  return result.data;
}

// ============================================================
// ERROR HELPERS
// ============================================================

export function getFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    // Firebase Functions errors have a 'code' property
    const fbError = error as Error & { code?: string };
    switch (fbError.code) {
      case 'functions/resource-exhausted':
        return "You've reached your daily translation limit. Upgrade to BiZY Premium for unlimited translations!";
      case 'functions/unauthenticated':
        return 'Please sign in to use translation.';
      case 'functions/unavailable':
        return 'Translation service is temporarily unavailable. Please try again shortly.';
      case 'functions/invalid-argument':
        return 'Invalid request. Please check your input and try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return 'An unexpected error occurred.';
}
