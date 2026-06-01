import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { prisma } from "@/lib/db";
import { getLessonBySlug } from "@/lib/content";
import { hintMessages, type HintInput } from "@/lib/ai/prompts";
import { streamChatResponse, ensureOllamaOr503 } from "@/lib/ai/stream";

export const runtime = "nodejs";

const MAX_CODE = 6_000;
const MAX_PROMPT = 1_500;

/**
 * AI hint for a stuck student. Given the challenge, their code, and the
 * error/failed tests, streams a single gentle hint (never the full solution).
 * The challenge prompt is read from the DB when a challengeId is supplied so we
 * don't trust client-provided instructions.
 */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return Response.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`ai:hint:${session.userId}`, 30, 60);
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

  const { challengeId, lessonSlug, prompt, code, errorMessage, failedTests } =
    (body || {}) as Record<string, unknown>;

  if (typeof code !== "string" || !code.trim()) {
    return Response.json({ error: "code wajib." }, { status: 400 });
  }

  // Prefer the authoritative challenge prompt from the DB.
  let challengePrompt =
    typeof prompt === "string" ? prompt.slice(0, MAX_PROMPT) : "";
  if (typeof challengeId === "string" && challengeId) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { prompt: true },
    });
    if (challenge) challengePrompt = challenge.prompt.slice(0, MAX_PROMPT);
  }
  if (!challengePrompt) {
    return Response.json(
      { error: "Instruksi tantangan tidak ditemukan." },
      { status: 400 }
    );
  }

  const down = await ensureOllamaOr503();
  if (down) return down;

  const input: HintInput = {
    prompt: challengePrompt,
    code: code.slice(0, MAX_CODE),
    errorMessage:
      typeof errorMessage === "string" ? errorMessage.slice(0, 600) : undefined,
    failedTests: Array.isArray(failedTests)
      ? (failedTests as unknown[])
        .filter((t): t is string => typeof t === "string")
        .slice(0, 6)
      : undefined,
  };

  if (typeof lessonSlug === "string" && lessonSlug) {
    const lesson = await getLessonBySlug(lessonSlug);
    if (lesson) input.lesson = { title: lesson.title };
  }

  return streamChatResponse(hintMessages(input), {
    temperature: 0.3,
    maxTokens: 400,
    signal: req.signal,
  });
}
