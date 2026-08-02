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
- Multi-agent Gemma orchestration with memory, routing, and safety
- Streaming assistant responses (SSE) for real-time UX
- Telangana/AP district utility context and emergency helplines
- Onboarding profile for district/occupation/land-aware responses

## Architecture

### Frontend

- `app/` – App Router pages and API routes
- `components/` – reusable UI (dashboard, chat, voice, auth, sidebar, settings)
- `context/` – global accessibility/settings state
- `hooks/` – speech hook and UI behaviors

### Backend / Server

- `app/api/chat/route.ts` – unified assistant API actions
- `app/api/weather/route.ts` – weather and farming advisory API
- `app/api/local/route.ts` – district utility metadata and emergency contacts
- `services/assistantService.ts` – grounded domain logic + eligibility + plant diagnosis orchestration
- `services/gemmaOrchestrator.ts` – intent routing, memory-aware prompting, and structured response generation
- `services/memoryService.ts` – conversation memory context store
- `services/weatherService.ts` – Open-Meteo geocoding and forecast logic
- `lib/openrouter.ts` – LLM integration helpers
- `lib/rag/` – vector retrieval + domain knowledge base
- `lib/local/local-context.ts` – district-level local utility context (Telangana/AP)
- `types/assistant.ts` – shared assistant/domain types

## RAG Flow

1. User asks a domain question (agriculture/government/healthcare).
2. Query is embedded using local hash-vectorization (`lib/rag/retriever.ts`).
3. Top knowledge chunks are retrieved from `lib/rag/knowledge-base.ts`.
4. Prompt is grounded with retrieved context and strict anti-hallucination constraints.
5. Gemma response is returned with source list.

## Gemma Scoring Features (Judge-Focused)

### 40% Gemma Tech

- Multi-agent orchestration (`services/gemmaOrchestrator.ts`)
  - Intent router → retrieval agent → reasoning agent → safety agent.
- Dynamic prompt routing by detected intent (agriculture, healthcare, schemes, weather, eligibility).
- Context memory (`services/memoryService.ts`) merged into prompt context.
- Grounded RAG with strict non-hallucination constraints.
- Structured output prompting (JSON template + parser + formatted output).
- Streaming responses (SSE in `app/api/chat/route.ts` + client stream rendering).
- Telugu + English prompt optimization.
- Safety guardrails:
  - healthcare disclaimers,
  - emergency escalation,
  - grounded-source forcing.

### 30% Local Utility

- Telangana/AP district utility context (crops, market hints, MeeSeva, hospitals).
- Emergency and helpline integration (108/104/farmer call center).
- Weather advisory mapped into farming recommendations.
- Government eligibility checker + scheme shortlist.
- Voice-first onboarding captures rural profile context.

### 30% Completeness

- Onboarding flow for first-time users.
- Profile-aware settings (state, district, occupation, land).
- Dashboard modules: agriculture, healthcare, government, weather, bookmarks, settings.
- Plant disease image upload/capture analysis output.
- Theme controls + accessibility + speech controls.
- API modularization and typed architecture for future extensions.

## API Documentation

### `POST /api/chat`

Body:

```json
{
  "action": "chat | agriculture | government | health | translate | summarize | explain-image | plant-disease | government-eligibility",
  "language": "te | en"
}
```

Additional for `chat`:

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "stream": true,
  "conversationId": "chat-id",
  "profile": {
    "district": "Warangal",
    "state": "Telangana",
    "occupation": "Farmer",
    "landOwnedAcres": 2.5
  }
}
```

`stream: true` returns SSE chunks.

### `GET /api/weather?location=<district>&language=te|en`

Returns temperature, rain probability, humidity, wind, and farming advice.

### `GET /api/local?district=<district>`

Returns district utility context and emergency contacts.

## Architecture Diagram

```text
UI (Dashboard / Chat / Voice / Onboarding)
        |
        v
API Layer (app/api/chat, weather, local)
        |
        v
Gemma Orchestrator
  - Intent Router
  - Memory Context
  - Retrieval Agent (RAG)
  - Reasoning Agent
  - Safety Agent
        |
        v
OpenRouter Gemma + Local Services (Weather, District Context)
```

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
- Enable HTTPS in production for reliable microphone permissions.

## Future Modules (Ready to Extend)

Current structure is prepared to add:

- Education Assistant
- Financial Assistant
- Women’s Welfare Assistant
- Livestock Assistant
- Legal Assistant
- Marketplace Assistant
