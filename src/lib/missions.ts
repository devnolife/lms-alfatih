/**
 * Server-side registry of file missions (Level 2 — Navigator Digital).
 *
 * The mission asks students to RECOGNISE file types by uploading one real file
 * per category (image, document, music). The expected categories and their
 * allowed extensions are defined here and NEVER trusted from the client.
 *
 * No ZIP / no folders — to keep it friendly for SMP beginners who have not
 * learned to compress folders. We only read file NAMES (extensions); files are
 * never written to disk, so there is no path-traversal surface.
 */

export interface MissionCategory {
  /** Stable id used in feedback. */
  id: string;
  /** Friendly label shown to students, e.g. "Gambar". */
  label: string;
  /** Emoji shown next to the label. */
  emoji: string;
  /** Allowed file extensions (without the dot, lowercase). */
  extensions: string[];
  /** Short hint of example files. */
  examples: string;
}

export interface FileMission {
  key: string;
  title: string;
  /** XP awarded once on the first passing submission. */
  xp: number;
  /** Lesson slug this mission belongs to (drives lesson completion). */
  lessonSlug: string;
  categories: MissionCategory[];
}

export const FILE_MISSIONS: Record<string, FileMission> = {
  "berkas-rescue": {
    key: "berkas-rescue",
    title: "Misi Pengenal Berkas",
    xp: 40,
    lessonSlug: "navigator-berkas",
    categories: [
      {
        id: "gambar",
        label: "Gambar",
        emoji: "🖼️",
        extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic"],
        examples: "foto .jpg / .png",
      },
      {
        id: "dokumen",
        label: "Dokumen",
        emoji: "📄",
        extensions: ["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx", "odt"],
        examples: "tugas .pdf / .docx",
      },
      {
        id: "musik",
        label: "Musik / Suara",
        emoji: "🎵",
        extensions: ["mp3", "wav", "m4a", "ogg", "aac", "flac"],
        examples: "lagu .mp3 / .wav",
      },
    ],
  },
};

export function getMission(key: string): FileMission | undefined {
  return FILE_MISSIONS[key];
}

export interface CategoryFeedback {
  id: string;
  label: string;
  emoji: string;
  /** Name of the uploaded file that matched this category, if any. */
  matchedFile: string | null;
  status: "correct" | "missing";
}

export interface MissionResult {
  passed: boolean;
  correct: number;
  total: number;
  details: CategoryFeedback[];
}

/** Lowercased extension (without dot) of a filename, or "" if none. */
function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i + 1).toLowerCase();
}

/**
 * Grades a list of uploaded file names against a mission's categories. A
 * category is satisfied when at least one uploaded file has a matching
 * extension. Pure function — no IO — so it is easy to unit test.
 */
export function gradeMission(
  mission: FileMission,
  fileNames: string[]
): MissionResult {
  const exts = fileNames.map(extOf);

  const details: CategoryFeedback[] = mission.categories.map((cat) => {
    const idx = exts.findIndex((e) => cat.extensions.includes(e));
    return {
      id: cat.id,
      label: cat.label,
      emoji: cat.emoji,
      matchedFile: idx >= 0 ? fileNames[idx] : null,
      status: idx >= 0 ? "correct" : "missing",
    };
  });

  const correct = details.filter((d) => d.status === "correct").length;
  return {
    passed: correct === mission.categories.length,
    correct,
    total: mission.categories.length,
    details,
  };
}
