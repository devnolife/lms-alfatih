import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { gradeServerSide, TEST_QUESTIONS } from "@/lib/test-questions";

export const runtime = "nodejs";

/**
 * POST /api/test/submit
 * Receives answers, grades them, persists a TestAttempt.
 * Body: { type: "PRE"|"POST", answers: Record<string, unknown>, startedAt: string }
 */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`test-submit:${session.userId}`, 10, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { type, answers, startedAt } = (body || {}) as Record<string, unknown>;

  if (type !== "PRE" && type !== "POST") {
    return NextResponse.json(
      { error: 'type harus "PRE" atau "POST".' },
      { status: 400 }
    );
  }

  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json(
      { error: "answers wajib berupa object." },
      { status: 400 }
    );
  }

  if (typeof startedAt !== "string") {
    return NextResponse.json(
      { error: "startedAt wajib." },
      { status: 400 }
    );
  }

  const userId = session.userId;

  // Check if already submitted
  const existing = await prisma.testAttempt.findUnique({
    where: { userId_type: { userId, type } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Kamu sudah mengerjakan tes ini." },
      { status: 409 }
    );
  }

  // Grade
  const { score, total } = gradeServerSide(answers as Record<string, unknown>);

  const attempt = await prisma.testAttempt.create({
    data: {
      userId,
      type,
      answers: answers as object,
      score,
      totalQuestions: total,
      startedAt: new Date(startedAt),
    },
  });

  return NextResponse.json({
    ok: true,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    attemptId: attempt.id,
  });
}
