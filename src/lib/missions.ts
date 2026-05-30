/**
 * Server-side registry of "file rescue" missions (Level 2 — Navigator Digital).
 *
 * The expected folder layout is defined here and NEVER trusted from the client.
 * A submission ZIP passes when every required file is found inside its correct
 * top-level folder.
 */

export interface MissionFile {
  /** File name the student must place (case-insensitive match on basename). */
  name: string;
  /** Correct top-level folder it belongs in. */
  folder: string;
}

export interface FileMission {
  key: string;
  title: string;
  /** XP awarded once on the first passing submission. */
  xp: number;
  /** Lesson slug this mission belongs to (drives lesson completion). */
  lessonSlug: string;
  folders: string[];
  files: MissionFile[];
}

export const FILE_MISSIONS: Record<string, FileMission> = {
  "berkas-rescue": {
    key: "berkas-rescue",
    title: "Misi Penyelamatan Berkas",
    xp: 40,
    lessonSlug: "navigator-berkas",
    folders: ["Gambar", "Dokumen", "Musik"],
    files: [
      { name: "foto-liburan.jpg", folder: "Gambar" },
      { name: "screenshot.png", folder: "Gambar" },
      { name: "tugas-ipa.docx", folder: "Dokumen" },
      { name: "jadwal.pdf", folder: "Dokumen" },
      { name: "lagu-favorit.mp3", folder: "Musik" },
    ],
  },
};

export function getMission(key: string): FileMission | undefined {
  return FILE_MISSIONS[key];
}

export interface FileFeedback {
  name: string;
  expectedFolder: string;
  foundFolder: string | null;
  status: "correct" | "wrong-folder" | "missing";
}

export interface MissionResult {
  passed: boolean;
  correct: number;
  total: number;
  details: FileFeedback[];
}

/**
 * Grades a flat list of zip entry paths (e.g. "Gambar/foto-liburan.jpg")
 * against a mission spec. Pure function — no IO — so it is easy to unit test.
 */
export function gradeMission(
  mission: FileMission,
  entryPaths: string[]
): MissionResult {
  // Map basename(lowercased) -> its immediate parent folder (top segment).
  const placement = new Map<string, string>();
  for (const raw of entryPaths) {
    const norm = raw.replace(/\\/g, "/").replace(/^\/+/, "");
    if (norm.endsWith("/")) continue; // directory entry
    const segments = norm.split("/").filter(Boolean);
    if (segments.length < 2) continue; // file at root, no folder
    const base = segments[segments.length - 1].toLowerCase();
    const topFolder = segments[0];
    if (!placement.has(base)) placement.set(base, topFolder);
  }

  const details: FileFeedback[] = mission.files.map((f) => {
    const found = placement.get(f.name.toLowerCase()) ?? null;
    let status: FileFeedback["status"];
    if (found === null) status = "missing";
    else if (found.toLowerCase() === f.folder.toLowerCase()) status = "correct";
    else status = "wrong-folder";
    return { name: f.name, expectedFolder: f.folder, foundFolder: found, status };
  });

  const correct = details.filter((d) => d.status === "correct").length;
  return {
    passed: correct === mission.files.length,
    correct,
    total: mission.files.length,
    details,
  };
}
