# BiZY — Edo (Bini) Language Translator

**BiZY** is a cross-platform mobile and web app for translating between Edo (Bini) and English using Claude AI.

## Features

- 🗣️ **AI Translation** — Edo ↔ English via Claude claude-sonnet-4-20250514
- 📖 **Dictionary** — 150+ Edo words with pronunciation and cultural notes
- 💬 **Phrasebook** — Essential phrases by category (greetings, emergency, shopping, etc.)
- 📚 **Lessons** — Structured learning from beginner to advanced
- ⭐ **Favorites** — Save and revisit your translations
- 🔒 **Auth** — Email/password + Google sign-in via Firebase
- 💰 **Freemium** — 500 chars/day free, unlimited with Premium ($2.99/mo)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile/Web | Expo (React Native) with expo-router |
| State | Zustand |
| Backend | Firebase Cloud Functions (TypeScript) |
| AI | Anthropic Claude claude-sonnet-4-20250514 |
| Auth | Firebase Auth |
| Database | Firestore |
| Payments | Stripe |

## Project Structure

```
├── app/                    Expo Router screens
│   ├── (tabs)/            Main tab screens
│   ├── (auth)/            Authentication screens
│   └── modal/             Modal screens (premium, cultural notes)
├── lib/                   Firebase config + API client
├── store/                 Zustand state stores
├── assets/data/           Dictionary and phrasebook data
└── functions/             Firebase Cloud Functions
```

## Setup

See [SETUP.md](SETUP.md) for complete setup instructions, or open the handoff document.

**Quick start:**
1. Upgrade Firebase project `edo-translator-app` to Blaze plan
2. Add Anthropic API key: `firebase functions:secrets:set ANTHROPIC_API_KEY`
3. `npm install && firebase deploy`

## Brand Colors

| Name | Hex |
|------|-----|
| Navy | `#1a1a2e` |
| Gold | `#c9a227` |

---

*Built with ❤️ for the Edo/Bini language community.*
