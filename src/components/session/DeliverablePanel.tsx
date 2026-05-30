"use client";

import { useState } from "react";
import type {
  DeliverableRow,
  DeliverableType,
  ReviewStatus,
} from "@/hooks/useSessionStream";

interface Props {
  sessionId: string;
  deliverables: DeliverableRow[];
  isTeacher: boolean;
  currentUserId: string;
  locked: boolean;
}

const TYPE_OPTIONS: { value: DeliverableType; label: string }[] = [
  { value: "TEXT", label: "Teks" },
  { value: "LINK", label: "Tautan" },
  { value: "CODE", label: "Kode" },
  { value: "IMAGE", label: "Gambar (URL)" },
];

const REVIEW_LABELS: Record<ReviewStatus, string> = {
  SUBMITTED: "Dikumpulkan",
  REVIEWED: "Ditinjau",
  APPROVED: "Disetujui",
};

const REVIEW_ACCENT: Record<ReviewStatus, string> = {
  SUBMITTED: "var(--color-silver)",
  REVIEWED: "var(--color-sky-blue)",
  APPROVED: "var(--color-duo-green)",
};

export default function DeliverablePanel({
  sessionId,
  deliverables,
  isTeacher,
  currentUserId,
  locked,
}: Props) {
  const [type, setType] = useState<DeliverableType>("TEXT");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, method: string, body?: unknown) {
    setError(null);
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Gagal.");
        return false;
      }
      return true;
    } catch {
      setError("Jaringan bermasalah.");
      return false;
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !content.trim()) return;
    setBusy(true);
    const ok = await call(`/api/sessions/${sessionId}/deliverables`, "POST", {
      type,
      content: content.trim(),
    });
    if (ok) setContent("");
    setBusy(false);
  }

  const setReview = (id: string, teacherStatus: ReviewStatus) =>
    call(`/api/sessions/${sessionId}/deliverables/${id}`, "PATCH", {
      teacherStatus,
    });
  const remove = (id: string) =>
    call(`/api/sessions/${sessionId}/deliverables/${id}`, "DELETE");

  return (
    <div className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5">
      <h2 className="mb-1 text-lg" style={{ fontFamily: "var(--font-feather)" }}>
        Hasil Hari Ini
      </h2>
      <p className="mb-4 text-sm text-[var(--color-graphite)]">
        Kumpulkan hasil kerja kelompok: teks, tautan, potongan kode, atau gambar.
      </p>

      {!locked && (
        <form onSubmit={submit} className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DeliverableType)}
              aria-label="Tipe hasil"
              className="auth-field w-auto"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === "LINK" || type === "IMAGE"
                ? "https://…"
                : "Tulis hasil kerja kalian di sini…"
            }
            rows={type === "CODE" || type === "TEXT" ? 4 : 2}
            maxLength={10000}
            aria-label="Isi hasil"
            className="auth-field w-full font-mono"
          />
          <button
            type="submit"
            disabled={busy || !content.trim()}
            className="btn-3d rounded-2xl bg-[var(--color-duo-green)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-50"
          >
            {busy ? "Mengirim…" : "Kumpulkan"}
          </button>
        </form>
      )}

      {error && (
        <p className="mb-3 text-sm font-bold text-[var(--color-error)]">{error}</p>
      )}

      {deliverables.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--color-cloud)] p-6 text-center text-sm text-[var(--color-silver)]">
          Belum ada hasil dikumpulkan.
        </p>
      ) : (
        <ul className="space-y-3">
          {deliverables.map((d) => {
            const canDelete = isTeacher || d.authorUserId === currentUserId;
            return (
              <li
                key={d.id}
                className="rounded-2xl border-2 border-[var(--color-cloud)] p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--color-graphite)]">
                    {d.authorName}
                  </span>
                  <span
                    className="rounded-lg px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: REVIEW_ACCENT[d.teacherStatus] }}
                  >
                    {REVIEW_LABELS[d.teacherStatus]}
                  </span>
                </div>

                <DeliverableContent type={d.type} content={d.content} />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isTeacher &&
                    (["SUBMITTED", "REVIEWED", "APPROVED"] as ReviewStatus[]).map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => setReview(d.id, s)}
                          disabled={d.teacherStatus === s}
                          className="rounded-lg border-2 border-[var(--color-cloud)] px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                        >
                          {REVIEW_LABELS[s]}
                        </button>
                      )
                    )}
                  {canDelete && (
                    <button
                      onClick={() => remove(d.id)}
                      className="ml-auto rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--color-error)]"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DeliverableContent({
  type,
  content,
}: {
  type: DeliverableType;
  content: string;
}) {
  if (type === "CODE") {
    return (
      <pre className="overflow-x-auto rounded-xl bg-[var(--color-graphite)] p-3 text-sm text-white">
        <code>{content}</code>
      </pre>
    );
  }
  if (type === "LINK") {
    return (
      <a
        href={content}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-bold text-[var(--color-sky-blue-dark)] underline"
      >
        {content}
      </a>
    );
  }
  if (type === "IMAGE") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content}
        alt="Hasil kelompok"
        className="max-h-64 rounded-xl border-2 border-[var(--color-cloud)]"
      />
    );
  }
  return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
}
