"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinClassPanel() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal bergabung.");
        return;
      }
      setSuccess(`Berhasil bergabung ke kelas "${data.className}"! 🎉`);
      setCode("");
      router.refresh();
    } catch {
      setError("Jaringan bermasalah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5"
    >
      <h2
        className="mb-1 text-lg text-[var(--color-graphite)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        Gabung Kelas
      </h2>
      <p className="mb-4 text-sm text-[var(--color-graphite)]">
        Punya kode dari gurumu? Masukkan di sini untuk bergabung.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="KODE KELAS"
          maxLength={12}
          aria-label="Kode kelas"
          className="auth-field flex-1 min-w-[160px] uppercase tracking-[0.2em]"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-duo-green)] px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-50"
        >
          {busy ? "Bergabung…" : "Gabung"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm font-bold text-[var(--color-error)]">{error}</p>
      )}
      {success && (
        <p className="mt-3 text-sm font-bold text-[var(--color-duo-green-dark)]">
          {success}
        </p>
      )}
    </form>
  );
}
