import { prisma } from "@/lib/db";

export interface StudentRosterRow {
  id: string;
  username: string;
  displayName: string;
  xp: number;
  /** Number of lessons marked COMPLETED in LessonProgress. */
  lessonsCompleted: number;
  /** Number of Python challenges solved (ChallengeCompletion). */
  challengesDone: number;
  /** Number of interactive activities solved (ActivityCompletion). */
  activitiesDone: number;
  /** Name of the first class this student is enrolled in, if any. */
  className: string | null;
  /** Most recent activity timestamp across progress/work, if any. */
  lastActiveAt: Date | null;
  createdAt: Date;
}

/**
 * Returns EVERY student account in the school with aggregated progress. Not
 * scoped to a teacher's own classes — any teacher/admin can review the whole
 * roster, including students who have not joined a class yet (which is why the
 * per-class views can look empty). Sorted by XP descending.
 */
export async function getAllStudentsRoster(): Promise<StudentRosterRow[]> {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ xp: "desc" }, { displayName: "asc" }],
    select: {
      id: true,
      username: true,
      displayName: true,
      xp: true,
      createdAt: true,
      enrollments: {
        take: 1,
        select: { class: { select: { name: true } } },
      },
    },
  });

  const ids = students.map((s) => s.id);
  if (ids.length === 0) return [];

  const [lessonGroups, challengeGroups, activityGroups] = await Promise.all([
    prisma.lessonProgress.groupBy({
      by: ["userId"],
      where: { userId: { in: ids }, status: "COMPLETED" },
      _count: { _all: true },
    }),
    prisma.challengeCompletion.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.activityCompletion.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _count: { _all: true },
    }),
  ]);

  const lessonsBy = new Map(lessonGroups.map((g) => [g.userId, g._count._all]));
  const challengesBy = new Map(
    challengeGroups.map((g) => [g.userId, g._count._all])
  );
  const activitiesBy = new Map(
    activityGroups.map((g) => [g.userId, g._count._all])
  );

  // Latest activity timestamp: newest LessonProgress.updatedAt or GameSubmission.
  const [latestProgress, latestWork] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: { in: ids } },
      orderBy: { updatedAt: "desc" },
      distinct: ["userId"],
      select: { userId: true, updatedAt: true },
    }),
    prisma.gameSubmission.findMany({
      where: { userId: { in: ids } },
      orderBy: { createdAt: "desc" },
      distinct: ["userId"],
      select: { userId: true, createdAt: true },
    }),
  ]);

  const lastActiveBy = new Map<string, Date>();
  for (const r of latestProgress) lastActiveBy.set(r.userId, r.updatedAt);
  for (const r of latestWork) {
    const prev = lastActiveBy.get(r.userId);
    if (!prev || r.createdAt > prev) lastActiveBy.set(r.userId, r.createdAt);
  }

  return students.map((s) => ({
    id: s.id,
    username: s.username,
    displayName: s.displayName,
    xp: s.xp,
    lessonsCompleted: lessonsBy.get(s.id) ?? 0,
    challengesDone: challengesBy.get(s.id) ?? 0,
    activitiesDone: activitiesBy.get(s.id) ?? 0,
    className: s.enrollments[0]?.class.name ?? null,
    lastActiveAt: lastActiveBy.get(s.id) ?? null,
    createdAt: s.createdAt,
  }));
}
