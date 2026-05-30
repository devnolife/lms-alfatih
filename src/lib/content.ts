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

export interface LessonMeta {
  slug: string;
  title: string;
  summary: string;
  order: number;
  projectKey: string;
  estimatedMinutes?: number;
  challenges: ChallengeSpec[];
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
    projectKey: data.projectKey ?? slug,
    estimatedMinutes: data.estimatedMinutes,
    challenges: (data.challenges ?? []) as ChallengeSpec[],
    body: parsed.content,
  };
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
