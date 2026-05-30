"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeacherClass } from "@/lib/classes";

interface Props {
  initialClasses: TeacherClass[];
}

export default function TeacherClassManager({ initialClasses }: Props) {
  const router = useRouter();
  const [classes, setClasses] = useState<TeacherClass[]>(initialClasses);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat kelas.");
        return;
      }
      setClasses((prev) => [
        { ...data.class, studentCount: 0, activeSessionId: null },
        ...prev,
      ]);
      setName("");
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStartSession(classId: string, activeSessionId: string | null) {
    if (activeSessionId) {
      router.push(`/app/sessions/${activeSessionId}`);
      return;
    }
    if (startingId) return;
    setStartingId(classId);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memulai sesi.");
        return;
      }
      router.push(`/app/sessions/${data.sessionId}`);
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setStartingId(null);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5"
      >
        <h2
          className="mb-3 text-lg"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          Buat Kelas Baru
        </h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kelas, mis. Kelas 7A"
            maxLength={80}
            aria-label="Nama kelas"
            className="auth-field flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-duo-green)] px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-50"
          >
            {busy ? "Membuat…" : "Buat"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm font-bold text-[var(--color-error)]">
            {error}
          </p>
        )}
      </form>

      {classes.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[var(--color-cloud)] p-10 text-center text-[var(--color-silver)]">
          Belum ada kelas. Buat kelas pertamamu di atas.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5"
            >
              <div
                className="text-xl"
                style={{ fontFamily: "var(--font-feather)" }}
              >
                {c.name}
              </div>
              <p className="mt-1 text-sm text-[var(--color-graphite)]">
                {c.studentCount} siswa bergabung
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-xl bg-[var(--color-cloud)] px-3 py-1.5 font-mono text-base font-bold tracking-[0.15em]">
                  {c.joinCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyCode(c.joinCode)}
                  className="rounded-xl border-2 border-[var(--color-cloud)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)] hover:bg-[var(--color-cloud)]"
                >
                  {copied === c.joinCode ? "Tersalin ✓" : "Salin kode"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleStartSession(c.id, c.activeSessionId)}
                disabled={startingId === c.id}
                className={`btn-3d mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50 ${
                  c.activeSessionId
                    ? "bg-[var(--color-sky-blue)] shadow-[0_4px_0_var(--color-sky-blue-dark)]"
                    : "bg-[var(--color-duo-green)] shadow-[0_4px_0_var(--color-duo-green-dark)]"
                }`}
              >
                {startingId === c.id
                  ? "Memulai…"
                  : c.activeSessionId
                    ? "Masuk Sesi Live →"
                    : "Mulai Sesi Live"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
