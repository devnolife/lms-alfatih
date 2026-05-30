"use client";

import { useState } from "react";
import type { TaskRow, TaskStatus } from "@/hooks/useSessionStream";

interface Props {
  sessionId: string;
  tasks: TaskRow[];
  isTeacher: boolean;
  currentUserId: string;
  locked: boolean;
}

const COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: "TODO", label: "Belum", accent: "var(--color-silver)" },
  { key: "DOING", label: "Dikerjakan", accent: "var(--color-sky-blue)" },
  { key: "DONE", label: "Selesai", accent: "var(--color-duo-green)" },
];

export default function TaskBoard({
  sessionId,
  tasks,
  isTeacher,
  currentUserId,
  locked,
}: Props) {
  const [title, setTitle] = useState("");
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
      }
    } catch {
      setError("Jaringan bermasalah.");
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !title.trim()) return;
    setBusy(true);
    await call(`/api/sessions/${sessionId}/tasks`, "POST", { title: title.trim() });
    setTitle("");
    setBusy(false);
  }

  const patch = (taskId: string, body: unknown) =>
    call(`/api/sessions/${sessionId}/tasks/${taskId}`, "PATCH", body);
  const remove = (taskId: string) =>
    call(`/api/sessions/${sessionId}/tasks/${taskId}`, "DELETE");

  return (
    <div className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5">
      <h2 className="mb-1 text-lg" style={{ fontFamily: "var(--font-feather)" }}>
        Papan Tugas Kelompok
      </h2>
      <p className="mb-4 text-sm text-[var(--color-graphite)]">
        Bagi pekerjaan dan ambil tugas yang ingin kamu kerjakan.
      </p>

      {!locked && (
        <form onSubmit={addTask} className="mb-4 flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tambah tugas, mis. Bikin fungsi cek angka"
            maxLength={120}
            aria-label="Judul tugas"
            className="auth-field flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="btn-3d rounded-2xl bg-[var(--color-duo-green)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-50"
          >
            Tambah
          </button>
        </form>
      )}

      {error && (
        <p className="mb-3 text-sm font-bold text-[var(--color-error)]">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div
                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                style={{ color: col.accent }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: col.accent }}
                />
                {col.label} ({items.length})
              </div>

              <ul className="space-y-2">
                {items.map((t) => {
                  const mine = t.claimedByUserId === currentUserId;
                  const canEdit =
                    isTeacher ||
                    t.createdByUserId === currentUserId ||
                    mine;
                  return (
                    <li
                      key={t.id}
                      className="rounded-2xl border-2 border-[var(--color-cloud)] p-3"
                    >
                      <p className="font-bold leading-snug">{t.title}</p>
                      <p className="mt-1 text-xs text-[var(--color-silver)]">
                        {t.claimedByName
                          ? `Diambil: ${t.claimedByName}`
                          : `Dibuat: ${t.createdByName}`}
                      </p>

                      {!locked && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {!t.claimedByUserId && (
                            <button
                              onClick={() => patch(t.id, { claim: true })}
                              className="rounded-lg bg-[var(--color-sky-blue-light)] px-2.5 py-1 text-xs font-bold text-[var(--color-sky-blue-dark)]"
                            >
                              Ambil
                            </button>
                          )}
                          {col.key !== "DOING" && (
                            <button
                              onClick={() => patch(t.id, { status: "DOING" })}
                              className="rounded-lg bg-[var(--color-cloud)] px-2.5 py-1 text-xs font-bold"
                            >
                              Kerjakan
                            </button>
                          )}
                          {col.key !== "DONE" && (
                            <button
                              onClick={() => patch(t.id, { status: "DONE" })}
                              className="rounded-lg bg-[var(--color-duo-green-light)] px-2.5 py-1 text-xs font-bold text-[var(--color-duo-green-dark)]"
                            >
                              Selesai
                            </button>
                          )}
                          {col.key === "DONE" && (
                            <button
                              onClick={() => patch(t.id, { status: "TODO" })}
                              className="rounded-lg bg-[var(--color-cloud)] px-2.5 py-1 text-xs font-bold"
                            >
                              Buka lagi
                            </button>
                          )}
                          {mine && (
                            <button
                              onClick={() => patch(t.id, { claim: false })}
                              className="rounded-lg bg-[var(--color-cloud)] px-2.5 py-1 text-xs font-bold"
                            >
                              Lepas
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => remove(t.id)}
                              className="rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--color-error)]"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
                {items.length === 0 && (
                  <li className="rounded-2xl border-2 border-dashed border-[var(--color-cloud)] p-3 text-center text-xs text-[var(--color-silver)]">
                    Kosong
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
