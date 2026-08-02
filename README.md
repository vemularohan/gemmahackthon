# Saarathi AI

Saarathi AI is a voice-first bilingual (Telugu + English) assistant for rural users, built with Next.js App Router and Gemma via OpenRouter.

## Core Features

- Voice-first interaction (STT + TTS)
- Grounded RAG responses for agriculture, government, and healthcare
- Agriculture module with plant disease image analysis
- Government scheme eligibility checker
- Weather advisory API integration with farming guidance
- Accessible UI with large controls, dark/light theme, and speech settings
- Chat history and bookmarks with Firebase + local fallback

## Architecture

### Frontend

- `app/` – App Router pages and API routes
- `components/` – reusable UI (dashboard, chat, voice, auth, sidebar, settings)
- `context/` – global accessibility/settings state
- `hooks/` – speech hook and UI behaviors

### Backend / Server

- `app/api/chat/route.ts` – unified assistant API actions
- `app/api/weather/route.ts` – weather and farming advisory API
- `services/assistantService.ts` – grounded domain logic + eligibility + plant diagnosis orchestration
- `services/weatherService.ts` – Open-Meteo geocoding and forecast logic
- `lib/openrouter.ts` – LLM integration helpers
- `lib/rag/` – vector retrieval + domain knowledge base
- `types/assistant.ts` – shared assistant/domain types

## RAG Flow

1. User asks a domain question (agriculture/government/healthcare).
2. Query is embedded using local hash-vectorization (`lib/rag/retriever.ts`).
3. Top knowledge chunks are retrieved from `lib/rag/knowledge-base.ts`.
4. Prompt is grounded with retrieved context and strict anti-hallucination constraints.
5. Gemma response is returned with source list.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Install & Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Deployment

Deploy on Vercel (recommended) or any Node.js-compatible platform.

- Ensure all environment variables are configured.
- For Firebase auth + Firestore, configure allowed origins and security rules.
- Verify browser permissions for microphone and speech synthesis.

## Future Modules (Ready to Extend)

Current structure is prepared to add:

- Education Assistant
- Financial Assistant
- Women’s Welfare Assistant
- Livestock Assistant
- Legal Assistant
- Marketplace Assistant
