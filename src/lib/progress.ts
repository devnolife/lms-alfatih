import { Prisma, LessonStatus } from "@prisma/client";
import { getLessonBySlug } from "@/lib/content";

export interface RecomputeResult {
  status: LessonStatus;
  /** True if this call transitioned the lesson into COMPLETED. */
  justCompleted: boolean;
}

/**
 * Single source of truth for lesson completion. A lesson is COMPLETED only when
 * EVERY required dimension it declares is satisfied:
 *   - all ACTIVE Python challenges solved (DB `ChallengeCompletion`),
 *   - all required+active interactive activities solved (`ActivityCompletion`),
 *   - all required file missions passed (`FileMissionSubmission`).
 *
 * Lessons that declare no requirements are never auto-completed here. The
 * computation is derived entirely from persisted rows, so it is idempotent and
 * safe to call from every grading route (challenges, activities, missions),
 * which also makes the "two requirement types finish concurrently" race benign:
 * whichever transaction commits last will see all rows and flip the status.
 *
 * Must run inside a transaction; pass the transaction client as `tx`.
 */
export async function recomputeLessonProgress(
  tx: Prisma.TransactionClient,
  userId: string,
  lessonSlug: string
): Promise<RecomputeResult> {
  const lesson = await getLessonBySlug(lessonSlug);

  let hasRequirement = false;
  let allSatisfied = true;

  // Dimension 1: Python challenges (seeded to DB; markdown may lag, so trust DB).
  const activeChallenges = await tx.challenge.findMany({
    where: { lessonSlug, active: true },
    select: { id: true },
  });
  if (activeChallenges.length > 0) {
    hasRequirement = true;
    const doneCount = await tx.challengeCompletion.count({
      where: { userId, challengeId: { in: activeChallenges.map((c) => c.id) } },
    });
    if (doneCount < activeChallenges.length) allSatisfied = false;
  }

  // Dimension 2: interactive activities declared in frontmatter.
  const requiredActivities = (lesson?.activities ?? []).filter(
    (a) => a.required && a.active
  );
  if (requiredActivities.length > 0) {
    hasRequirement = true;
    const ids = requiredActivities.map((a) => a.id);
    const doneActivities = await tx.activityCompletion.count({
      where: { userId, lessonSlug, activityId: { in: ids } },
    });
    if (doneActivities < ids.length) allSatisfied = false;
  }

  // Dimension 3: real file-upload missions declared in frontmatter.
  const requiredMissions = (lesson?.missions ?? []).filter((m) => m.required);
  if (requiredMissions.length > 0) {
    hasRequirement = true;
    for (const m of requiredMissions) {
      const pass = await tx.fileMissionSubmission.findFirst({
        where: { userId, missionKey: m.key, passed: true },
        select: { id: true },
      });
      if (!pass) {
        allSatisfied = false;
        break;
      }
    }
  }

  const completed = hasRequirement && allSatisfied;
  const status: LessonStatus = completed
    ? LessonStatus.COMPLETED
    : LessonStatus.IN_PROGRESS;

  if (!hasRequirement) {
    // Nothing to track; leave any existing row untouched.
    const existing = await tx.lessonProgress.findUnique({
      where: { userId_lessonSlug: { userId, lessonSlug } },
      select: { status: true },
    });
    return { status: existing?.status ?? LessonStatus.NOT_STARTED, justCompleted: false };
  }

  const prior = await tx.lessonProgress.findUnique({
    where: { userId_lessonSlug: { userId, lessonSlug } },
    select: { status: true },
  });
  const wasCompleted = prior?.status === LessonStatus.COMPLETED;

  await tx.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId, lessonSlug } },
    update: {
      status,
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId,
      lessonSlug,
      status,
      completedAt: completed ? new Date() : null,
    },
  });

  return { status, justCompleted: completed && !wasCompleted };
}
