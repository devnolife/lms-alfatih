# Local-AI Learning Assistant — Design

> Date: 2026-05-31 · Status: implemented (Phase 1 of AI features)
> Adds AI-powered learning help to FunPython using the **local Ollama** instance
> already running on the server (`qwen2.5-coder:7b`). Zero external API, zero
> per-request cost, student data never leaves the box.

## Goal

Make self-study more effective for SMP students by giving them a friendly,
Socratic AI helper that gives **hints, not answers**:

1. **AI Tutor "Pyo"** — a floating chat on every lesson page. Grounded in the
   current lesson; nudges with questions and small steps.
2. **AI Hint on failure** — when a student's code crashes or fails the grader,
   a "Minta petunjuk AI" button streams one gentle, targeted hint.

## Why local-only

The server already runs Ollama (`/usr/local/bin/ollama`, model
`qwen2.5-coder:7b`) on `http://localhost:11434`. Using it keeps everything free
and private. Config is overridable via `OLLAMA_URL` / `OLLAMA_MODEL` env vars.

## Architecture

```
Browser (lesson page)
  ├─ AiTutorPanel ──fetch stream──► POST /api/ai/tutor ─┐
  └─ LessonEditor "Minta petunjuk" ─► POST /api/ai/hint ┤
                                                         ▼
                              src/lib/ai/stream.ts (ReadableStream)
                                                         ▼
                              src/lib/ai/ollama.ts (streamChat → Ollama /api/chat)
```

### Files

| File | Role |
|---|---|
| `src/lib/ai/ollama.ts` | Server client: `streamChat()` (parses Ollama NDJSON), `isOllamaAvailable()`, env config. |
| `src/lib/ai/prompts.ts` | Pedagogical system prompts (Indonesian, SMP, Socratic, no full solutions) for tutor + hint. |
| `src/lib/ai/stream.ts` | `streamChatResponse()` wraps a chat stream into a `text/plain` HTTP stream; `ensureOllamaOr503()` health guard. |
| `src/app/api/ai/tutor/route.ts` | Auth + rate-limited streaming chat. Lesson context loaded server-side from slug. |
| `src/app/api/ai/hint/route.ts` | Auth + rate-limited single-hint stream. Challenge prompt read from DB (not trusted from client). |
| `src/hooks/useAiChat.ts` | Client hook: streams an endpoint, accumulates the assistant message. |
| `src/components/lesson/AiTutorPanel.tsx` | Floating chat widget (bubble + slide-over). |
| `src/components/editor/LessonEditor.tsx` | "Minta petunjuk AI" button shown only after a failed attempt. |
| `src/components/lesson/LessonPlayer.tsx` | Mounts `AiTutorPanel` with lesson context. |

## Safety / guardrails

- **Auth required** on both routes via `readSession()`; 401 otherwise.
- **Rate limited** via existing `rateLimit()` (Redis, no-op fallback): tutor
  20/min, hint 30/min per user.
- **Input caps**: message count/length, code length, prompt length — bounded
  before hitting the model.
- **Server-side grounding**: lesson body + challenge prompt are read on the
  server (slug/challengeId), so the client can't inject arbitrary context.
- **Request timeout** + abort propagation (client disconnect aborts the model
  call) in `streamChat`.
- **Graceful degradation**: 503 with a friendly message when Ollama is down;
  mid-stream errors append a short ⚠️ notice instead of resetting the socket.
- **Pedagogy**: prompts forbid pasting the full working solution; replies stay
  in simple Indonesian and on-topic.

## Configuration

```
OLLAMA_URL=http://localhost:11434   # optional, default shown
OLLAMA_MODEL=qwen2.5-coder:7b       # optional, default shown
```

## Future (not in this phase)

- AI content generator for teachers (quizzes/challenges from a topic).
- Adaptive recommendations from per-student error patterns (ML).
- Auto-feedback on open-ended deliverables.
