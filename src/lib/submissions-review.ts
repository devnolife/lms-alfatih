import { prisma } from "@/lib/db";
import { getAllLessons } from "@/lib/content";

export interface GameSubmissionRow {
  id: string;
  studentId: string;
  studentName: string;
  className: string | null;
  lessonSlug: string;
  lessonTitle: string;
  activityId: string;
  game: string;
  score: number;
  data: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Fetches the actual WORK students produced inside interactive games
 * (GameSubmission rows) for every class taught by `teacherId`. Each row carries
 * the game-specific `data` payload plus a 0-100 `score`, so a teacher can see
 * not just THAT a student finished but HOW they answered/trained. Newest first.
 *
 * Optional filters narrow by lesson, activity, or a single class.
 */
export async function getTeacherGameSubmissions(
  teacherId: string,
  filters: { lessonSlug?: string; activityId?: string; classId?: string } = {},
  limit = 200
): Promise<GameSubmissionRow[]> {
  const subs = await prisma.gameSubmission.findMany({
    where: {
      ...(filters.lessonSlug ? { lessonSlug: filters.lessonSlug } : {}),
      ...(filters.activityId ? { activityId: filters.activityId } : {}),
      user: {
        enrollments: {
          some: {
            class: { teacherId },
            ...(filters.classId ? { classId: filters.classId } : {}),
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      lessonSlug: true,
      activityId: true,
      game: true,
      score: true,
      data: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          displayName: true,
          enrollments: {
            where: { class: { teacherId } },
            take: 1,
            select: { class: { select: { name: true } } },
          },
        },
      },
    },
  });

  const lessons = await getAllLessons();
  const titleBySlug = new Map(lessons.map((l) => [l.slug, l.title]));

  return subs.map((s) => ({
    id: s.id,
    studentId: s.user.id,
    studentName: s.user.displayName,
    className: s.user.enrollments[0]?.class.name ?? null,
    lessonSlug: s.lessonSlug,
    lessonTitle: titleBySlug.get(s.lessonSlug) ?? s.lessonSlug,
    activityId: s.activityId,
    game: s.game,
    score: s.score,
    data: (s.data ?? {}) as Record<string, unknown>,
    createdAt: s.createdAt,
  }));
}
