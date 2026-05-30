import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { broadcastUserActivity } from "@/lib/sessions";
import { syncUserBadges } from "@/lib/badges";
import { recomputeLessonProgress } from "@/lib/progress";
import { getLessonBySlug } from "@/lib/content";

export const runtime = "nodejs";

/**
 * Records the first solve of an interactive activity (flowchart, quiz,
 * spreadsheet, hardware-match, branching, etc.). The activity and its XP are
 * read from the lesson's server-side manifest — never trusted from the client.
 * XP is awarded exactly once per (user, lesson, activity) via the
 * ActivityCompletion primary-key guard. Lesson completion is then recomputed
 * through the single source of truth so a level unlocks only when every
 * required item is done.
 *
 * NOTE: completion is client-asserted (the games grade themselves in the
 * browser), so this endpoint is an honour-system signal, acceptable for this
 * low-stakes classroom tool. It still gates the UI for normal users.
 */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`activity:${session.userId}`, 120, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { lessonSlug, activityId } = (body || {}) as Record<string, unknown>;
  if (typeof lessonSlug !== "string" || typeof activityId !== "string") {
    return NextResponse.json(
      { error: "lessonSlug & activityId wajib." },
      { status: 400 }
    );
  }

  // Validate against the server-side manifest.
  const lesson = await getLessonBySlug(lessonSlug);
  const activity = lesson?.activities.find(
    (a) => a.id === activityId && a.active
  );
  if (!activity) {
    return NextResponse.json(
      { error: "Aktivitas tidak ditemukan." },
      { status: 404 }
    );
  }

  const userId = session.userId;

  const result = await prisma.$transaction(async (tx) => {
    const prior = await tx.activityCompletion.findUnique({
      where: { userId_lessonSlug_activityId: { userId, lessonSlug, activityId } },
      select: { userId: true },
    });
    const alreadyAwarded = Boolean(prior);

    let xpAwarded = 0;
    if (!alreadyAwarded) {
      xpAwarded = activity.xp;
      await tx.activityCompletion.create({
        data: { userId, lessonSlug, activityId, xpAwarded },
      });
      if (xpAwarded > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: xpAwarded } },
        });
      }
    }

    const progress = await recomputeLessonProgress(tx, userId, lessonSlug);

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    return {
      xpAwarded,
      alreadyAwarded,
      totalXp: user?.xp ?? 0,
      lessonStatus: progress.status,
      justCompleted: progress.justCompleted,
    };
  });

  if (result.justCompleted) {
    await syncUserBadges(userId).catch(() => {});
  }
  if (result.xpAwarded > 0) {
    void broadcastUserActivity(userId).catch(() => {});
  }

  return NextResponse.json({ ok: true, ...result });
}
