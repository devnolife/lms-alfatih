import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { getLessonBySlug } from "@/lib/content";
import { tutorSystemPrompt, type LessonContext } from "@/lib/ai/prompts";
import type { ChatMessage } from "@/lib/ai/ollama";
import { streamChatResponse, ensureOllamaOr503 } from "@/lib/ai/stream";

export const runtime = "nodejs";

const MAX_MESSAGES = 12;
const MAX_CONTENT = 2_000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * AI tutor chat. Streams a Socratic, hint-driven reply from the local model.
 * Auth + rate limited; lesson context is loaded server-side from the slug so
 * the client cannot inject arbitrary grounding text.
 */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return Response.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`ai:tutor:${session.userId}`, 20, 60);
  if (!limited.ok) {
    return Response.json(
      { error: "Sabar ya, beri jeda sebentar 😊" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { messages, lessonSlug } = (body || {}) as {
    messages?: unknown;
    lessonSlug?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages wajib." }, { status: 400 });
  }

  const clean: ChatMessage[] = [];
  for (const m of (messages as unknown[]).slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") continue;
    const { role, content } = m as Partial<IncomingMessage>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      continue;
    }
    const trimmed = content.trim().slice(0, MAX_CONTENT);
    if (trimmed) clean.push({ role, content: trimmed });
  }

  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return Response.json(
      { error: "Pesan terakhir harus dari siswa." },
      { status: 400 }
    );
  }

  const down = await ensureOllamaOr503();
  if (down) return down;

  let ctx: LessonContext | undefined;
  if (typeof lessonSlug === "string" && lessonSlug) {
    const lesson = await getLessonBySlug(lessonSlug);
    if (lesson) {
      ctx = { title: lesson.title, summary: lesson.summary, body: lesson.body };
    }
  }

  return streamChatResponse([tutorSystemPrompt(ctx), ...clean], {
    temperature: 0.45,
    maxTokens: 700,
    signal: req.signal,
  });
}
