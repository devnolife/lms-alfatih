import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { getMission, gradeMission } from "@/lib/missions";
import { syncUserBadges } from "@/lib/badges";
import { recomputeLessonProgress } from "@/lib/progress";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 10;

/**
 * Grades a "Navigator Digital" file mission. The student uploads one or more
 * real files (image, document, music). We only read the file NAMES to classify
 * each by extension — files are never written to disk, so there is no upload /
 * path-traversal surface. The expected categories come from the server-side
 * mission registry, never the client. XP is awarded once per (user, mission).
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
  const files = form.getAll("file").filter((f): f is File => f instanceof File);

  if (typeof missionKey !== "string") {
    return NextResponse.json({ error: "missionKey wajib." }, { status: 400 });
  }
  const mission = getMission(missionKey);
  if (!mission) {
    return NextResponse.json({ error: "Misi tidak ditemukan." }, { status: 404 });
  }
  if (files.length === 0) {
    return NextResponse.json({ error: "Pilih minimal satu berkas." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_FILES} berkas sekaligus.` },
      { status: 400 }
    );
  }
  for (const f of files) {
    if (f.size === 0) {
      return NextResponse.json({ error: `Berkas "${f.name}" kosong.` }, { status: 400 });
    }
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Berkas "${f.name}" terlalu besar (maks 5 MB).` },
        { status: 413 }
      );
    }
  }

  const fileNames = files.map((f) => f.name);
  const result = gradeMission(mission, fileNames);
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
    await syncUserBadges(userId).catch(() => { });
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
