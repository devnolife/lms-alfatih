"use client";

import { useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  missionKey?: string;
  title?: string;
  hint?: string;
}

interface Detail {
  id: string;
  label: string;
  emoji: string;
  matchedFile: string | null;
  status: "correct" | "missing";
}

interface ApiResult {
  ok?: boolean;
  error?: string;
  passed?: boolean;
  correct?: number;
  total?: number;
  details?: Detail[];
  xpAwarded?: number;
  alreadyAwarded?: boolean;
}

/**
 * Real file-upload mission (Level 2 — Navigator Digital). Beginner-friendly:
 * instead of building a ZIP, students upload one real file per category
 * (gambar, dokumen, musik). Grading is done server-side by file extension.
 * Authored as `::filemission{missionKey="berkas-rescue"}`.
 */
export default function FileRescueMission({
  missionKey = "berkas-rescue",
  title = "Misi Pengenal Berkas",
  hint = "Unggah 3 berkas berbeda: satu Gambar 🖼️, satu Dokumen 📄, dan satu Musik 🎵. Tidak perlu ZIP!",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fb = useGameFeedback();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [awarded, setAwarded] = useState(false);

  async function upload(files: FileList) {
    setBusy(true);
    setResult(null);
    try {
      const body = new FormData();
      body.append("missionKey", missionKey);
      for (const f of Array.from(files)) body.append("file", f);
      const res = await fetch("/api/missions/file-rescue", {
        method: "POST",
        body,
      });
      const json: ApiResult = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ error: json.error || "Gagal mengunggah." });
        fb.wrong();
        return;
      }
      setResult(json);
      if (json.passed) {
        if (!awarded && json.xpAwarded && json.xpAwarded > 0) {
          setAwarded(true);
          fb.solved({ xp: json.xpAwarded, label: `+${json.xpAwarded} XP misi` });
        } else {
          fb.correct();
        }
      } else {
        fb.wrong();
      }
    } catch {
      setResult({ error: "Tidak bisa terhubung ke server." });
      fb.wrong();
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFileNames(Array.from(files).map((f) => f.name));
    void upload(files);
  }

  const targets = [
    { emoji: "🖼️", label: "Gambar", ex: ".jpg / .png" },
    { emoji: "📄", label: "Dokumen", ex: ".pdf / .docx" },
    { emoji: "🎵", label: "Musik", ex: ".mp3 / .wav" },
  ];

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eef6ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        📂 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      {/* Target checklist */}
      <div className="mx-auto mb-4 flex max-w-[520px] flex-wrap justify-center gap-2">
        {targets.map((c) => {
          const done = result?.details?.find(
            (d) =>
              d.label.toLowerCase().startsWith(c.label.toLowerCase()) &&
              d.status === "correct"
          );
          return (
            <span
              key={c.label}
              className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold ${done
                  ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                  : "border-[var(--color-cloud)] bg-white text-[var(--color-charcoal)]"
                }`}
            >
              {done ? "✓ " : ""}
              {c.emoji} {c.label}{" "}
              <span className="font-mono text-xs text-[var(--color-graphite)]">
                {c.ex}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.odt"
          onChange={onPick}
          className="hidden"
        />
        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-[var(--color-sky-blue)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_var(--color-sky-blue-dark)] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {busy ? "Memeriksa…" : "📤 Pilih & Unggah Berkas"}
        </button>
        <p className="text-center text-xs text-[var(--color-graphite)]">
          Bisa pilih beberapa berkas sekaligus (tahan Ctrl/Cmd saat memilih).
        </p>
        {fileNames.length > 0 && (
          <span className="text-center text-xs text-[var(--color-graphite)]">
            Dipilih: {fileNames.join(", ")}
          </span>
        )}
      </div>

      {result?.error && (
        <div className="mx-auto mt-4 max-w-[480px] rounded-xl bg-[#ffe9e9] px-3 py-2 text-center text-sm font-bold text-[#d33]">
          {result.error}
        </div>
      )}

      {result && !result.error && result.details && (
        <div className="mx-auto mt-4 max-w-[480px]">
          <div
            className={`mb-3 rounded-xl px-3 py-2 text-center text-sm font-bold ${result.passed
                ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                : "bg-[#fff3f3] text-[#c0392b]"
              }`}
          >
            {result.passed
              ? result.alreadyAwarded
                ? "✅ Hebat! (XP sudah pernah didapat)"
                : "🎉 Hebat! Kamu berhasil mengenali ketiga jenis berkas!"
              : `${result.correct}/${result.total} jenis berkas sudah benar. Lengkapi yang kurang!`}
          </div>
          <ul className="space-y-1.5">
            {result.details.map((d) => (
              <li
                key={d.id}
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${d.status === "correct"
                    ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                    : "bg-[#fff3f3] text-[#c0392b]"
                  }`}
              >
                <span className="font-bold">
                  {d.emoji} {d.label}
                </span>
                <span className="text-xs font-bold">
                  {d.status === "correct" ? (
                    <span className="font-mono">✓ {d.matchedFile}</span>
                  ) : (
                    "❔ belum ada"
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
