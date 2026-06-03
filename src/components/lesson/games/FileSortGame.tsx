"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /**
   * Files encoded as `emoji nama:Kategori` separated by `|`. The set of
   * categories becomes the folders. Example:
   *   "🖼️ foto.jpg:Gambar|📄 tugas.docx:Dokumen|🎵 lagu.mp3:Musik"
   */
  files?: string;
  title?: string;
  hint?: string;
  xp?: string;
}

interface FileItem {
  name: string;
  category: string;
}

const FOLDER_EMOJI: Record<string, string> = {
  Gambar: "🖼️",
  Dokumen: "📄",
  Musik: "🎵",
  Video: "🎬",
  Program: "💻",
};

/**
 * "Misi Sortir Berkas": click a file then click the correct folder. Wrong drops
 * bounce back. Authored as `::game{type="filesort" files="🖼️ foto.jpg:Gambar|..."}`.
 */
export default function FileSortGame({
  files = "",
  title = "Misi Sortir Berkas",
  hint = "Klik berkas, lalu klik folder yang tepat.",
  xp = "20",
}: Props) {
  const parsed = useMemo<FileItem[]>(
    () =>
      files
        .split("|")
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => {
          const [name, category] = f.split(":");
          return { name: (name ?? "").trim(), category: (category ?? "").trim() };
        }),
    [files]
  );

  const folders = useMemo(
    () => Array.from(new Set(parsed.map((f) => f.category))),
    [parsed]
  );

  const fb = useGameFeedback();
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [shakeFolder, setShakeFolder] = useState<string | null>(null);
  const [awarded, setAwarded] = useState(false);

  const remaining = parsed.filter((f) => placed[f.name] === undefined);
  const done = remaining.length === 0 && parsed.length > 0;

  function dropTo(folder: string) {
    if (!selected) return;
    const file = parsed.find((f) => f.name === selected);
    if (!file) return;
    if (file.category === folder) {
      const next = { ...placed, [file.name]: folder };
      setPlaced(next);
      setSelected(null);
      if (Object.keys(next).length === parsed.length && !awarded) {
        setAwarded(true);
        fb.solved({
          xp: Number(xp) || 20,
          label: `+${xp} XP`,
          game: "filesort",
          score: 100,
          data: { ...next },
        });
      } else {
        fb.correct();
      }
    } else {
      setShakeFolder(folder);
      fb.wrong();
      setTimeout(() => setShakeFolder(null), 500);
    }
  }

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eef6ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🗂️ {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      <div className="mx-auto mb-4 flex min-h-[52px] max-w-[820px] flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-cloud)] bg-white/60 p-3">
        {remaining.length === 0 ? (
          <span className="text-sm text-[var(--color-silver)]">
            Semua berkas sudah rapi! ✨
          </span>
        ) : (
          remaining.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelected(selected === f.name ? null : f.name)}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${selected === f.name
                ? "border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light)] text-[var(--color-sky-blue-dark)]"
                : "border-[var(--color-cloud)] bg-white hover:border-[var(--color-sky-blue)]"
                }`}
            >
              {f.name}
            </button>
          ))
        )}
      </div>

      <div className="mx-auto grid max-w-[820px] gap-3 sm:grid-cols-3">
        {folders.map((folder) => {
          const contents = Object.entries(placed)
            .filter(([, c]) => c === folder)
            .map(([n]) => n);
          return (
            <button
              key={folder}
              onClick={() => dropTo(folder)}
              className={`flex min-h-[96px] flex-col rounded-2xl border-2 p-3 text-left transition-transform ${shakeFolder === folder
                ? "border-[#ff6b6b] bg-[#ffe9e9]"
                : "border-[var(--color-cloud)] bg-white hover:border-[var(--color-sunshine-dark)]"
                } ${selected ? "cursor-pointer" : ""}`}
            >
              <span
                className="mb-1 text-sm font-bold text-[var(--color-charcoal)]"
                style={{ fontFamily: "var(--font-feather)" }}
              >
                {FOLDER_EMOJI[folder] ?? "📁"} {folder}
              </span>
              <span className="flex flex-wrap gap-1">
                {contents.map((n) => (
                  <span
                    key={n}
                    className="rounded-md bg-[var(--color-duo-green-light)] px-2 py-0.5 text-xs text-[var(--color-duo-green-dark)]"
                  >
                    {n}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mx-auto mt-4 max-w-[820px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
          🎉 Semua berkas tersimpan di folder yang benar!
        </div>
      )}
    </div>
  );
}
