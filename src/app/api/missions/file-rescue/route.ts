import { NextResponse } from "next/server";
import { unzipSync } from "fflate";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { getMission, gradeMission } from "@/lib/missions";
import { syncUserBadges } from "@/lib/badges";
import { recomputeLessonProgress } from "@/lib/progress";

export const runtime = "nodejs";

const MAX_ZIP_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_ENTRIES = 200;

/**
 * Grades a "file rescue" mission. The student uploads a ZIP they have organised
 * into folders. We read entry names IN MEMORY only (never extract to disk) so
 * there is no zip-slip / path-traversal surface. The expected layout comes from
 * the server-side mission registry, never the client. XP is awarded once per
 * (user, mission) — guarded by checking for a prior passing submission.
 */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`filemission:${session.userId}`, 20, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat. Coba lagi sebentar." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Unggahan tidak valid." }, { status: 400 });
  }

  const missionKey = form.get("missionKey");
  const file = form.get("file");

  if (typeof missionKey !== "string") {
    return NextResponse.json({ error: "missionKey wajib." }, { status: 400 });
  }
  const mission = getMission(missionKey);
  if (!mission) {
    return NextResponse.json({ error: "Misi tidak ditemukan." }, { status: 404 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File ZIP wajib diunggah." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }
  if (file.size > MAX_ZIP_BYTES) {
    return NextResponse.json(
      { error: "File terlalu besar (maks 2 MB)." },
      { status: 413 }
    );
  }
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".zip")) {
    return NextResponse.json(
      { error: "Harus berupa file .zip." },
      { status: 415 }
    );
  }

  let entryPaths: string[];
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    const files = unzipSync(buf);
    entryPaths = Object.keys(files);
    if (entryPaths.length > MAX_ENTRIES) {
      return NextResponse.json(
        { error: "Terlalu banyak berkas di dalam ZIP." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa membaca ZIP. Pastikan filenya benar." },
      { status: 400 }
    );
  }

  const result = gradeMission(mission, entryPaths);
  const userId = session.userId;

  const persisted = await prisma.$transaction(async (tx) => {
    const priorPass = await tx.fileMissionSubmission.findFirst({
      where: { userId, missionKey: mission.key, passed: true },
      select: { id: true },
    });
    const alreadyAwarded = Boolean(priorPass);

    let xpAwarded = 0;
    if (result.passed && !alreadyAwarded) {
      xpAwarded = mission.xp;
      await tx.user.update({
        where: { id: userId },
        data: { xp: { increment: mission.xp } },
      });
    }

    await tx.fileMissionSubmission.create({
      data: {
        userId,
        lessonSlug: mission.lessonSlug,
        missionKey: mission.key,
        passed: result.passed,
        feedback: result.details as unknown as Prisma.InputJsonValue,
        xpAwarded,
      },
    });

    if (result.passed) {
      await recomputeLessonProgress(tx, userId, mission.lessonSlug);
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    return { xpAwarded, alreadyAwarded, totalXp: user?.xp ?? 0 };
  });

  if (result.passed) {
    await syncUserBadges(userId).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    passed: result.passed,
    correct: result.correct,
    total: result.total,
    details: result.details,
    ...persisted,
  });
}
