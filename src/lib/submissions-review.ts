import { prisma } from "@/lib/db";
import { getAllLessons } from "@/lib/content";

export interface GameSubmissionRow {
  id: string;
  studentId: string;
  studentName: string;
  /** Whether the submitter is a real student or a teacher trying the game out. */
  isTeacher: boolean;
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
 * Fetches the actual WORK produced inside interactive games (GameSubmission
 * rows) across the WHOLE school. Each row carries the game-specific `data`
 * payload plus a 0-100 `score`, so any teacher can see not just THAT someone
 * finished but HOW they answered/trained. Newest first.
 *
 * Results are intentionally NOT scoped to the classes a teacher owns: there is a
 * single shared roster, so every teacher account sees everyone's work. Teacher
 * test-runs are included too (flagged via `isTeacher`) so an instructor can
 * verify their own attempts.
 *
 * Optional filters narrow by lesson, activity, or a single class.
 */
export async function getTeacherGameSubmissions(
  _teacherId: string,
  filters: { lessonSlug?: string; activityId?: string; classId?: string } = {},
  limit = 200
): Promise<GameSubmissionRow[]> {
  const subs = await prisma.gameSubmission.findMany({
    where: {
      ...(filters.lessonSlug ? { lessonSlug: filters.lessonSlug } : {}),
      ...(filters.activityId ? { activityId: filters.activityId } : {}),
      ...(filters.classId
        ? { user: { enrollments: { some: { classId: filters.classId } } } }
        : {}),
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
          role: true,
          enrollments: {
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
    isTeacher: s.user.role === "TEACHER" || s.user.role === "ADMIN",
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
