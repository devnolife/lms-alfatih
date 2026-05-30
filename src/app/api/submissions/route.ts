import { NextResponse } from "next/server";
import { Prisma, LessonStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { broadcastUserActivity } from "@/lib/sessions";

export const runtime = "nodejs";

const MAX_CODE_LENGTH = 20_000;
const MAX_RESULTS = 100;

/**
 * Persists a challenge attempt. Grading happens client-side (Pyodide), so
 * `passed`/`results` are accepted for audit/UX but the authoritative XP reward
 * is read from the Challenge row. XP is awarded exactly once per (user,
 * challenge) via the ChallengeCompletion primary-key guard.
 */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`submit:${session.userId}`, 60, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { challengeId, code, passed, results } = (body || {}) as Record<
    string,
    unknown
  >;

  if (typeof challengeId !== "string" || typeof code !== "string") {
    return NextResponse.json(
      { error: "challengeId & code wajib." },
      { status: 400 }
    );
  }
  if (typeof passed !== "boolean") {
    return NextResponse.json({ error: "passed wajib boolean." }, { status: 400 });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ error: "Kode terlalu panjang." }, { status: 400 });
  }
  const safeResults = Array.isArray(results)
    ? (results as unknown[]).slice(0, MAX_RESULTS)
    : [];

  // challengeId is authoritative; lessonSlug is derived from the row (never
  // trusted from the client).
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, lessonSlug: true, xpReward: true, active: true },
  });
  if (!challenge) {
    return NextResponse.json(
      { error: "Tantangan tidak ditemukan." },
      { status: 404 }
    );
  }
  if (!challenge.active) {
    return NextResponse.json(
      { error: "Tantangan sudah tidak aktif." },
      { status: 409 }
    );
  }

  const userId = session.userId;
  const lessonSlug = challenge.lessonSlug;

  const result = await prisma.$transaction(async (tx) => {
    let xpAwarded = 0;
    let alreadyAwarded = false;

    if (passed) {
      // ON CONFLICT DO NOTHING: race-safe and (unlike a throwing create) does
      // not poison the surrounding transaction when the row already exists.
      const created = await tx.challengeCompletion.createMany({
        data: [{ userId, challengeId, xpAwarded: challenge.xpReward }],
        skipDuplicates: true,
      });
      if (created.count === 1) {
        xpAwarded = challenge.xpReward;
        await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: challenge.xpReward } },
        });
      } else {
        alreadyAwarded = true;
      }
    }

    await tx.submission.create({
      data: {
        userId,
        challengeId,
        code,
        passed,
        results: safeResults as Prisma.InputJsonValue,
        xpAwarded,
      },
    });

    // Recompute lesson progress over ACTIVE challenges only.
    const activeChallenges = await tx.challenge.findMany({
      where: { lessonSlug, active: true },
      select: { id: true },
    });
    const totalActive = activeChallenges.length;
    let lessonStatus: LessonStatus = LessonStatus.IN_PROGRESS;

    if (totalActive > 0) {
      const doneCount = await tx.challengeCompletion.count({
        where: { userId, challengeId: { in: activeChallenges.map((c) => c.id) } },
      });
      const completed = doneCount >= totalActive;
      lessonStatus = completed
        ? LessonStatus.COMPLETED
        : LessonStatus.IN_PROGRESS;

      await tx.lessonProgress.upsert({
        where: { userId_lessonSlug: { userId, lessonSlug } },
        update: {
          status: lessonStatus,
          completedAt: completed ? new Date() : null,
        },
        create: {
          userId,
          lessonSlug,
          status: lessonStatus,
          completedAt: completed ? new Date() : null,
        },
      });
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    return {
      xpAwarded,
      alreadyAwarded,
      totalXp: user?.xp ?? 0,
      lessonStatus,
    };
  });

  // Push the student's updated progress to any active class sessions (live
  // board). Best-effort: never let real-time fan-out fail the submission.
  if (result.xpAwarded > 0) {
    void broadcastUserActivity(userId).catch(() => {});
  }

  return NextResponse.json({ ok: true, ...result });
}
