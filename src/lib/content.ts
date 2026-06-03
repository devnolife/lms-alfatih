import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface ChallengeSpec {
  id: string;
  prompt: string;
  starterCode: string;
  tests: Array<{
    name?: string;
    stdin?: string;
    expectedStdout?: string;
    assertions?: string[];
  }>;
  xpReward?: number;
}

/** A non-Python interactive activity that counts toward lesson completion. */
export interface ActivitySpec {
  id: string;
  xp: number;
  /** Whether this activity must be solved to complete the lesson. */
  required: boolean;
  active: boolean;
}

/** A real file-upload mission that counts toward lesson completion. */
export interface MissionSpec {
  key: string;
  required: boolean;
}

/** A single answer-key entry for the teacher handbook. */
export interface AnswerKeyItem {
  /** What this answer refers to, e.g. "Kuis 1" or challenge id. */
  ref: string;
  /** The correct answer or canonical solution. */
  answer: string;
  /** Optional teaching note explaining the answer. */
  note?: string;
}

/** Kurikulum Merdeka Informatika Fase D element codes. */
export type ElementCode = "BK" | "TIK" | "SK_JKI" | "AD" | "AP" | "DSI" | "AI";

export interface LessonMeta {
  slug: string;
  title: string;
  summary: string;
  /** Sequential ordering within the whole curriculum. */
  order: number;
  /** Level/Quest 1-6 this lesson belongs to. */
  level: number;
  /** Informatika element code this lesson teaches. */
  element: ElementCode;
  projectKey: string;
  estimatedMinutes?: number;
  challenges: ChallengeSpec[];
  /** Interactive activities (games) that count toward completion. */
  activities: ActivitySpec[];
  /** File-upload missions that count toward completion. */
  missions: MissionSpec[];
  /** Facilitator notes shown only in the teacher handbook (Markdown allowed). */
  teacherNotes?: string;
  /** Answer key entries shown only in the teacher handbook. */
  answerKey: AnswerKeyItem[];
}

export interface Lesson extends LessonMeta {
  body: string;
}

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

async function readLessonFile(file: string): Promise<Lesson> {
  const slug = file.replace(/\.md$/i, "").replace(/^\d+-/, "");
  const raw = await fs.readFile(path.join(LESSONS_DIR, file), "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Partial<LessonMeta>;
  return {
    slug,
    title: data.title ?? slug,
    summary: data.summary ?? "",
    order: data.order ?? 0,
    level: data.level ?? 5,
    element: (data.element as ElementCode) ?? "AP",
    projectKey: data.projectKey ?? slug,
    estimatedMinutes: data.estimatedMinutes,
    challenges: (data.challenges ?? []) as ChallengeSpec[],
    activities: normalizeActivities(data.activities),
    missions: normalizeMissions(data.missions),
    teacherNotes:
      typeof data.teacherNotes === "string" ? data.teacherNotes : undefined,
    answerKey: normalizeAnswerKey(data.answerKey),
    body: parsed.content,
  };
}

function normalizeAnswerKey(raw: unknown): AnswerKeyItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === "object")
    .map((a) => ({
      ref: String(a.ref ?? ""),
      answer: String(a.answer ?? ""),
      note: typeof a.note === "string" ? a.note : undefined,
    }))
    .filter((a) => a.ref.length > 0 && a.answer.length > 0);
}

function normalizeActivities(raw: unknown): ActivitySpec[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === "object")
    .map((a) => ({
      id: String(a.id ?? ""),
      xp: Number(a.xp ?? 0),
      required: a.required !== false,
      active: a.active !== false,
    }))
    .filter((a) => a.id.length > 0);
}

function normalizeMissions(raw: unknown): MissionSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === "object")
    .map((m) => ({
      key: String(m.key ?? ""),
      required: m.required !== false,
    }))
    .filter((m) => m.key.length > 0);
}

let cache: Lesson[] | null = null;

export async function getAllLessons(): Promise<Lesson[]> {
  if (cache) return cache;
  try {
    const files = await fs.readdir(LESSONS_DIR);
    const lessons = await Promise.all(
      files.filter((f) => f.toLowerCase().endsWith(".md")).map(readLessonFile)
    );
    cache = lessons.sort((a, b) => a.order - b.order);
    return cache;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const all = await getAllLessons();
  return all.find((l) => l.slug === slug) ?? null;
}
