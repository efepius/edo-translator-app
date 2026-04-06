/**
 * BiZY Edo Translator - Firebase Cloud Functions
 * Production-ready backend for Edo <-> English translation
 * Uses Claude claude-sonnet-4-20250514 via Anthropic API
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";
import Stripe from "stripe";

admin.initializeApp();

const db = admin.firestore();

// ============================================================
// ENVIRONMENT CONFIGURATION
// ============================================================
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "price_premium_monthly";

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// ============================================================
// CONSTANTS
// ============================================================
const FREE_DAILY_CHAR_LIMIT = 500;
const PREMIUM_DAILY_CHAR_LIMIT = 10000;
const PREMIUM_PRICE_USD = 2.99;

// Expert Edo translation system prompt
const EDO_SYSTEM_PROMPT = `You are an expert translator specialising in the Edo (Bini) language spoken in Edo State, Nigeria, particularly in and around Benin City.

Your expertise includes:
- Classical and modern Edo vocabulary
- Tonal distinctions that change word meanings
- Edo cultural context and idiomatic expressions
- The Bini (Benin) royal court language and titles
- Common proverbs and their meanings
- Differences between formal and informal registers

Translation rules:
1. Always use proper Edo diacritical marks (ẹ, ọ, ẹ̀, ọ̀, etc.)
2. When translating Edo to English: provide the translation followed by brief cultural context if relevant
3. When translating English to Edo: provide the most natural Edo expression, not word-for-word
4. If a word has no direct equivalent, provide the closest translation and explain in brackets
5. For proverbs or idioms, explain the deeper meaning
6. Keep translations concise and practical for everyday use
7. Note any dialectal variations where significant

Respond with ONLY the translation. No preamble like "Here is the translation:" — just the translated text.
If the input is unclear or not a valid translation request, respond with: "Translation unavailable. Please provide valid Edo or English text."`;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get today's date string in YYYY-MM-DD format for rate limiting
 */
function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if user is premium subscriber
 */
async function isUserPremium(uid: string): Promise<boolean> {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return false;
    const data = userDoc.data();
    if (!data) return false;

    // Check subscription status
    if (data.subscriptionStatus === "active") {
      // Verify subscription hasn't expired
      const expiresAt = data.subscriptionExpiresAt?.toDate?.();
      if (expiresAt && expiresAt > new Date()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

/**
 * Get and update user's daily character usage
 * Returns current usage BEFORE this request
 */
async function checkAndUpdateUsage(
  uid: string,
  charCount: number,
  isPremium: boolean
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = isPremium ? PREMIUM_DAILY_CHAR_LIMIT : FREE_DAILY_CHAR_LIMIT;
  const todayKey = getTodayKey();
  const usageRef = db.collection("usage").doc(`${uid}_${todayKey}`);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const usageDoc = await transaction.get(usageRef);
      const currentUsed = usageDoc.exists ? (usageDoc.data()?.chars || 0) : 0;

      if (currentUsed + charCount > limit) {
        return { allowed: false, used: currentUsed, limit };
      }

      // Update usage
      if (usageDoc.exists) {
        transaction.update(usageRef, {
          chars: admin.firestore.FieldValue.increment(charCount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        transaction.set(usageRef, {
          uid,
          date: todayKey,
          chars: charCount,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { allowed: true, used: currentUsed, limit };
    });

    return result;
  } catch (error) {
    console.error("Error checking usage:", error);
    // Fail open — allow translation if usage check fails
    return { allowed: true, used: 0, limit };
  }
}

// ============================================================
// CLOUD FUNCTIONS
// ============================================================

/**
 * TRANSLATE - Main translation function
 * Translates between Edo and English using Claude AI
 */
export const translate = functions
  .runWith({ timeoutSeconds: 30, memory: "256MB" })
  .https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to translate."
      );
    }

    const { text, direction = "edo-to-english" } = data;
    const uid = context.auth.uid;

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Please provide text to translate."
      );
    }

    const trimmedText = text.trim();
    const charCount = trimmedText.length;

    // Check character limit (max 2000 per single request even for premium)
    if (charCount > 2000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Text too long. Maximum 2000 characters per translation."
      );
    }

    // Check premium status and daily limits
    const isPremium = await isUserPremium(uid);
    const usage = await checkAndUpdateUsage(uid, charCount, isPremium);

    if (!usage.allowed) {
      const remaining = usage.limit - usage.used;
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `Daily translation limit reached (${usage.limit} characters). ` +
        `You have used ${usage.used} of ${usage.limit} characters today. ` +
        (isPremium
          ? "Please try again tomorrow."
          : `Upgrade to Premium for ${PREMIUM_DAILY_CHAR_LIMIT} characters/day.`)
      );
    }

    // Build translation prompt
    const isEdoToEnglish = direction === "edo-to-english";
    const prompt = isEdoToEnglish
      ? `Translate the following Edo (Bini) text to English:\n\n"${trimmedText}"`
      : `Translate the following English text to Edo (Bini):\n\n"${trimmedText}"`;

    try {
      // Call Claude API
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: EDO_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      const translatedText = response.content[0].type === "text"
        ? response.content[0].text
        : "";

      // Save to translation history
      const historyRef = db.collection("translations").doc();
      await historyRef.set({
        uid,
        originalText: trimmedText,
        translatedText,
        direction,
        charCount,
        isPremium,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        translation: translatedText,
        direction,
        charCount,
        usage: {
          used: usage.used + charCount,
          limit: usage.limit,
          isPremium,
        },
      };

    } catch (error: any) {
      console.error("Translation error:", error);

      if (error?.status === 401) {
        throw new functions.https.HttpsError(
          "internal",
          "Translation service configuration error. Please contact support."
        );
      }

      if (error?.status === 429) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "Translation service is temporarily busy. Please try again in a moment."
        );
      }

      throw new functions.https.HttpsError(
        "internal",
        "Translation failed. Please try again."
      );
    }
  });

/**
 * GET_USAGE - Get current user's daily usage stats
 */
export const getUsage = functions
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
    }

    const uid = context.auth.uid;
    const todayKey = getTodayKey();
    const isPremium = await isUserPremium(uid);
    const limit = isPremium ? PREMIUM_DAILY_CHAR_LIMIT : FREE_DAILY_CHAR_LIMIT;

    try {
      const usageDoc = await db.collection("usage").doc(`${uid}_${todayKey}`).get();
      const used = usageDoc.exists ? (usageDoc.data()?.chars || 0) : 0;

      return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isPremium,
        resetDate: todayKey,
      };
    } catch (error) {
      console.error("Error getting usage:", error);
      throw new functions.https.HttpsError("internal", "Could not retrieve usage data.");
    }
  });

/**
 * CREATE_CHECKOUT_SESSION - Stripe checkout for premium subscription
 */
export const createCheckoutSession = functions
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
    }

    const uid = context.auth.uid;
    const { successUrl, cancelUrl } = data;

    try {
      // Get or create Stripe customer
      const userDoc = await db.collection("users").doc(uid).get();
      let customerId: string;

      if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
        customerId = userDoc.data()!.stripeCustomerId;
      } else {
        const userRecord = await admin.auth().getUser(uid);
        const customer = await stripe.customers.create({
          email: userRecord.email,
          metadata: { firebaseUid: uid },
        });
        customerId = customer.id;

        await db.collection("users").doc(uid).set(
          { stripeCustomerId: customerId },
          { merge: true }
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: successUrl || "https://edotranslator.app/success",
        cancel_url: cancelUrl || "https://edotranslator.app/premium",
        subscription_data: {
          metadata: { firebaseUid: uid },
        },
      });

      return { sessionId: session.id, url: session.url };

    } catch (error) {
      console.error("Stripe checkout error:", error);
      throw new functions.https.HttpsError("internal", "Could not create checkout session.");
    }
  });

/**
 * STRIPE_WEBHOOK - Handle Stripe subscription events
 */
export const stripeWebhook = functions
  .runWith({ timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const getUidFromCustomer = async (customerId: string): Promise<string | null> => {
      const snapshot = await db
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      return snapshot.docs[0].id;
    };

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const uid = await getUidFromCustomer(subscription.customer as string);

          if (uid) {
            const isActive = subscription.status === "active" ||
                            subscription.status === "trialing";

            await db.collection("users").doc(uid).set({
              subscriptionStatus: subscription.status,
              subscriptionId: subscription.id,
              subscriptionExpiresAt: admin.firestore.Timestamp.fromMillis(
                subscription.current_period_end * 1000
              ),
              isPremium: isActive,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const uid = await getUidFromCustomer(subscription.customer as string);

          if (uid) {
            await db.collection("users").doc(uid).set({
              subscriptionStatus: "cancelled",
              isPremium: false,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          const uid = await getUidFromCustomer(invoice.customer as string);

          if (uid) {
            // Log successful payment
            await db.collection("payments").add({
              uid,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "paid",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const uid = await getUidFromCustomer(invoice.customer as string);

          if (uid) {
            await db.collection("users").doc(uid).set({
              paymentFailed: true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
          }
          break;
        }
      }

      res.json({ received: true });

    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

/**
 * GET_TRANSLATION_HISTORY - Get user's translation history
 */
export const getTranslationHistory = functions
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
    }

    const uid = context.auth.uid;
    const { limit: pageLimit = 20, startAfter } = data;

    try {
      let query = db
        .collection("translations")
        .where("uid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(Math.min(pageLimit, 50));

      if (startAfter) {
        const cursor = await db.collection("translations").doc(startAfter).get();
        if (cursor.exists) {
          query = query.startAfter(cursor);
        }
      }

      const snapshot = await query.get();
      const translations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      }));

      return { translations, hasMore: translations.length === pageLimit };

    } catch (error) {
      console.error("Error getting history:", error);
      throw new functions.https.HttpsError("internal", "Could not retrieve history.");
    }
  });

/**
 * SAVE_FAVORITE - Save a translation to favorites
 */
export const saveFavorite = functions
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
    }

    const uid = context.auth.uid;
    const { originalText, translatedText, direction } = data;

    if (!originalText || !translatedText) {
      throw new functions.https.HttpsError("invalid-argument", "Missing text fields.");
    }

    try {
      const favoriteRef = await db.collection("favorites").add({
        uid,
        originalText,
        translatedText,
        direction,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { id: favoriteRef.id };

    } catch (error) {
      console.error("Error saving favorite:", error);
      throw new functions.https.HttpsError("internal", "Could not save favorite.");
    }
  });

/**
 * GET_FAVORITES - Get user's saved favorites
 */
export const getFavorites = functions
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
    }

    const uid = context.auth.uid;

    try {
      const snapshot = await db
        .collection("favorites")
        .where("uid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const favorites = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      }));

      return { favorites };

    } catch (error) {
      console.error("Error getting favorites:", error);
      throw new functions.https.HttpsError("internal", "Could not retrieve favorites.");
    }
  });

/**
 * DELETE_FAVORITE - Remove a favorite
 */
export const deleteFavorite = functions
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Not authenticated.");
    }

    const uid = context.auth.uid;
    const { favoriteId } = data;

    try {
      const doc = await db.collection("favorites").doc(favoriteId).get();

      if (!doc.exists || doc.data()?.uid !== uid) {
        throw new functions.https.HttpsError("not-found", "Favorite not found.");
      }

      await db.collection("favorites").doc(favoriteId).delete();
      return { success: true };

    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error("Error deleting favorite:", error);
      throw new functions.https.HttpsError("internal", "Could not delete favorite.");
    }
  });

/**
 * CREATE_USER_PROFILE - Called when a new user registers
 */
export const createUserProfile = functions
  .auth.user()
  .onCreate(async (user) => {
    try {
      await db.collection("users").doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        isPremium: false,
        subscriptionStatus: "free",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`User profile created for ${user.uid}`);
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  });

/**
 * DELETE_USER_DATA - GDPR: clean up when user deletes account
 */
export const deleteUserData = functions
  .auth.user()
  .onDelete(async (user) => {
    const uid = user.uid;
    const batch = db.batch();

    try {
      // Delete user document
      batch.delete(db.collection("users").doc(uid));

      // Delete translations
      const translations = await db.collection("translations")
        .where("uid", "==", uid).get();
      translations.docs.forEach((doc) => batch.delete(doc.ref));

      // Delete favorites
      const favorites = await db.collection("favorites")
        .where("uid", "==", uid).get();
      favorites.docs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      console.log(`Deleted data for user ${uid}`);
    } catch (error) {
      console.error(`Error deleting data for user ${uid}:`, error);
    }
  });
