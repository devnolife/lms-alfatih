import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { getLessonBySlug } from "@/lib/content";

export const runtime = "nodejs";

/**
 * Persists the actual WORK a student produced inside an interactive game
 * (labels, answers, chosen paths, training data, computed values, etc.). Each
 * attempt is kept as a row in GameSubmission so teachers can later inspect HOW
 * a student solved the activity and how well they did. This is separate from
 * /api/activities/complete, which only records the one-time XP award.
 *
 * The `data` payload is game-specific and stored as-is (bounded for safety).
 */
const schema = z.object({
  lessonSlug: z.string().min(1).max(128),
  activityId: z.string().min(1).max(128),
  game: z.string().min(1).max(32),
  score: z.number().int().min(0).max(100).optional().default(0),
  // Arbitrary, game-specific work payload. Bounded so a malicious client can't
  // store unbounded blobs; the JSON is serialised and size-checked.
  data: z
    .record(z.string(), z.unknown())
    .refine((d) => Object.keys(d).length <= 100, "Terlalu banyak field.")
    .refine((d) => JSON.stringify(d).length <= 8_000, "Data terlalu besar."),
});

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`work:${session.userId}`, 60, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  const { lessonSlug, activityId, game, score, data } = parsed.data;

  // Validate the activity exists & is active in the server-side manifest.
  const lesson = await getLessonBySlug(lessonSlug);
  const activity = lesson?.activities.find((a) => a.id === activityId && a.active);
  if (!activity) {
    return NextResponse.json(
      { error: "Aktivitas tidak ditemukan." },
      { status: 404 }
    );
  }

  const submission = await prisma.gameSubmission.create({
    data: {
      userId: session.userId,
      lessonSlug,
      activityId,
      game,
      score,
      data: data as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: submission.id });
}
