import { getAllLessons, type Lesson, type ElementCode } from "@/lib/content";
import { prisma } from "@/lib/db";

export interface LevelMeta {
  level: number;
  title: string;
  element: ElementCode;
  /** Human label for the element. */
  elementLabel: string;
  emoji: string;
  /** CSS color var used for accents. */
  color: string;
  blurb: string;
  /** Badge code awarded on completion (matches prisma seed). */
  badgeCode: string;
}

export const LEVELS: LevelMeta[] = [
  {
    level: 1,
    title: "Ksatria Logika",
    element: "BK",
    elementLabel: "Berpikir Komputasional",
    emoji: "🧠",
    color: "var(--color-grape)",
    blurb: "Latih logika, pecahkan teka-teki, dan lengkapi diagram alir.",
    badgeCode: "level-1-bk",
  },
  {
    level: 2,
    title: "Navigator Digital",
    element: "TIK",
    elementLabel: "Teknologi Informasi & Komunikasi",
    emoji: "🧭",
    color: "var(--color-sky-blue)",
    blurb: "Kuasai file & folder, lalu selesaikan Misi Penyelamatan Berkas.",
    badgeCode: "level-2-tik",
  },
  {
    level: 3,
    title: "Teknisi Siber",
    element: "SK_JKI",
    elementLabel: "Sistem Komputer & Jaringan",
    emoji: "🛠️",
    color: "var(--color-sunshine-dark)",
    blurb: "Kenali perangkat keras, lunak, dan cara internet bekerja.",
    badgeCode: "level-3-skjki",
  },
  {
    level: 4,
    title: "Detektif Data",
    element: "AD",
    elementLabel: "Analisis Data",
    emoji: "🔎",
    color: "var(--color-bubblegum)",
    blurb: "Olah data kantin sekolah dengan spreadsheet dan grafik.",
    badgeCode: "level-4-ad",
  },
  {
    level: 5,
    title: "Pembuat Game Pemula",
    element: "AP",
    elementLabel: "Algoritma & Pemrograman",
    emoji: "🎮",
    color: "var(--color-duo-green)",
    blurb: "Bikin program sendiri dengan Python dan blok visual Scratch.",
    badgeCode: "level-5-ap",
  },
  {
    level: 6,
    title: "Warga Digital Bijak",
    element: "DSI",
    elementLabel: "Dampak Sosial Informatika",
    emoji: "🛡️",
    color: "var(--color-sky-blue-dark)",
    blurb: "Pilih keputusan bijak lewat skenario dunia digital bercabang.",
    badgeCode: "level-6-dsi",
  },
];

export function getLevelMeta(level: number): LevelMeta | undefined {
  return LEVELS.find((l) => l.level === level);
}

export type LessonStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type LevelState = "open" | "locked" | "done" | "empty";

export interface LessonCard {
  slug: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes?: number;
  xp: number;
  status: LessonStatus;
}

export interface LevelGroup {
  meta: LevelMeta;
  lessons: LessonCard[];
  total: number;
  completed: number;
  /** Total XP available across this level's challenges. */
  xp: number;
  state: LevelState;
}

function lessonXp(lesson: Lesson): number {
  const challengeXp = lesson.challenges.reduce((s, c) => s + (c.xpReward ?? 0), 0);
  const activityXp = lesson.activities.reduce((s, a) => s + (a.xp ?? 0), 0);
  return challengeXp + activityXp;
}

/**
 * Builds the full curriculum grouped by Level, annotated with per-user progress
 * and sequential lock state.
 *
 * Lock rule: a level is `open` only if every PRIOR level that has lessons is
 * fully completed. Levels with no lessons yet are `empty` ("segera hadir") and
 * do NOT block later levels, so authored content stays reachable.
 */
export async function getCurriculum(userId?: string): Promise<LevelGroup[]> {
  const lessons = await getAllLessons();

  const progressMap = new Map<string, LessonStatus>();
  if (userId) {
    const rows = await prisma.lessonProgress.findMany({
      where: { userId },
      select: { lessonSlug: true, status: true },
    });
    for (const r of rows) progressMap.set(r.lessonSlug, r.status as LessonStatus);
  }

  const byLevel = new Map<number, Lesson[]>();
  for (const l of lessons) {
    const arr = byLevel.get(l.level) ?? [];
    arr.push(l);
    byLevel.set(l.level, arr);
  }

  const groups: LevelGroup[] = [];
  let priorIncomplete = false; // any earlier level with lessons not fully done

  for (const meta of LEVELS) {
    const levelLessons = (byLevel.get(meta.level) ?? []).sort(
      (a, b) => a.order - b.order
    );
    const cards: LessonCard[] = levelLessons.map((l) => ({
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      order: l.order,
      estimatedMinutes: l.estimatedMinutes,
      xp: lessonXp(l),
      status: progressMap.get(l.slug) ?? "NOT_STARTED",
    }));

    const total = cards.length;
    const completed = cards.filter((c) => c.status === "COMPLETED").length;
    const xp = cards.reduce((s, c) => s + c.xp, 0);

    let state: LevelState;
    if (total === 0) {
      state = "empty";
    } else if (completed === total) {
      state = "done";
    } else if (priorIncomplete) {
      state = "locked";
    } else {
      state = "open";
    }

    // Only levels that actually have lessons gate the next ones.
    if (total > 0 && completed < total) priorIncomplete = true;

    groups.push({ meta, lessons: cards, total, completed, xp, state });
  }

  return groups;
}

/**
 * Server-side guard: returns true if the given lesson is currently locked for
 * the user (its level is `locked`). Unknown lessons are treated as not locked.
 */
export async function isLessonLocked(
  slug: string,
  userId?: string
): Promise<boolean> {
  const groups = await getCurriculum(userId);
  for (const g of groups) {
    if (g.lessons.some((l) => l.slug === slug)) {
      return g.state === "locked";
    }
  }
  return false;
}
