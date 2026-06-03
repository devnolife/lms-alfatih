import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/test/status
 * Returns which tests the user has completed and their scores.
 */
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const attempts = await prisma.testAttempt.findMany({
    where: { userId: session.userId },
    select: {
      type: true,
      score: true,
      totalQuestions: true,
      submittedAt: true,
    },
  });

  const pre = attempts.find((a) => a.type === "PRE") ?? null;
  const post = attempts.find((a) => a.type === "POST") ?? null;

  return NextResponse.json({
    pre: pre
      ? { score: pre.score, total: pre.totalQuestions, submittedAt: pre.submittedAt }
      : null,
    post: post
      ? { score: post.score, total: post.totalQuestions, submittedAt: post.submittedAt }
      : null,
  });
}
