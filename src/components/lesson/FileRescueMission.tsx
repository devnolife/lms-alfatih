"use client";

import { useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  missionKey?: string;
  title?: string;
  /** Semicolon-separated folder names to show as the target layout. */
  folders?: string;
  /** Optional URL to download the unsorted starter ZIP. */
  download?: string;
  hint?: string;
}

interface Detail {
  name: string;
  expectedFolder: string;
  foundFolder: string | null;
  status: "correct" | "wrong-folder" | "missing";
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
 * Real ZIP-upload mission (Level 2). The student organises files into folders,
 * zips them, and uploads. Grading is done server-side. Authored as
 * `::filemission{missionKey="berkas-rescue" folders="Gambar;Dokumen;Musik"}`.
 */
export default function FileRescueMission({
  missionKey = "berkas-rescue",
  title = "Misi Penyelamatan Berkas",
  folders = "",
  download,
  hint = "Susun berkas ke folder yang benar, jadikan ZIP, lalu unggah di sini.",
}: Props) {
  const folderList = folders.split(";").map((f) => f.trim()).filter(Boolean);
  const inputRef = useRef<HTMLInputElement>(null);
  const fb = useGameFeedback();
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [awarded, setAwarded] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const body = new FormData();
      body.append("missionKey", missionKey);
      body.append("file", file);
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
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    void upload(file);
  }

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eef6ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        📦 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      {folderList.length > 0 && (
        <div className="mx-auto mb-4 flex max-w-[480px] flex-wrap justify-center gap-2">
          {folderList.map((f) => (
            <span
              key={f}
              className="rounded-xl border-2 border-[var(--color-cloud)] bg-white px-3 py-1.5 text-sm font-bold text-[var(--color-charcoal)]"
            >
              📁 {f}
            </span>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-3">
        {download && (
          <a
            href={download}
            className="text-sm font-bold text-[var(--color-sky-blue-dark)] underline"
          >
            ⬇️ Unduh berkas mentah (.zip)
          </a>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          onChange={onPick}
          className="hidden"
        />
        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-[var(--color-sky-blue)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_var(--color-sky-blue-dark)] transition-all hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {busy ? "Memeriksa…" : "📤 Unggah ZIP-mu"}
        </button>
        {fileName && (
          <span className="text-xs text-[var(--color-graphite)]">{fileName}</span>
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
            className={`mb-3 rounded-xl px-3 py-2 text-center text-sm font-bold ${
              result.passed
                ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                : "bg-[#fff3f3] text-[#c0392b]"
            }`}
          >
            {result.passed
              ? result.alreadyAwarded
                ? "✅ Sempurna! (XP sudah pernah didapat)"
                : "🎉 Sempurna! Semua berkas tersusun rapi!"
              : `${result.correct}/${result.total} berkas sudah benar. Coba perbaiki!`}
          </div>
          <ul className="space-y-1.5">
            {result.details.map((d) => (
              <li
                key={d.name}
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                  d.status === "correct"
                    ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                    : "bg-[#fff3f3] text-[#c0392b]"
                }`}
              >
                <span className="font-mono">{d.name}</span>
                <span className="text-xs font-bold">
                  {d.status === "correct"
                    ? `✓ ${d.expectedFolder}`
                    : d.status === "missing"
                      ? "❔ belum ada"
                      : `→ harus di ${d.expectedFolder}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
