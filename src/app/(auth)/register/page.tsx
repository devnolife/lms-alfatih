"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, password, role }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Gagal mendaftar.");
        setSubmitting(false);
        return;
      }
      startTransition(() => {
        router.push(role === "TEACHER" ? "/dashboard" : "/app");
        router.refresh();
      });
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
      setSubmitting(false);
    }
  }

  const loading = submitting || pending;

  return (
    <>
      <div className="mb-6">
        <h1
          className="text-[28px] leading-tight"
          style={{ fontFamily: "var(--font-feather)", fontWeight: 700 }}
        >
          Mulai petualanganmu! 🎉
        </h1>
        <p
          className="mt-1 text-graphite"
          style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14 }}
        >
          Buat akun gratis dan raih XP pertamamu.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>
            Nama tampil
          </span>
          <span className="auth-field-wrap">
            <span className="auth-field-icon">🙂</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="auth-field"
              placeholder="Budi Hebat"
            />
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>
            Username
          </span>
          <span className="auth-field-wrap">
            <span className="auth-field-icon">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              pattern="[a-zA-Z0-9_]{3,24}"
              className="auth-field"
              placeholder="budi_hebat"
            />
          </span>
          <span className="text-xs text-[var(--color-silver)]" style={{ fontFamily: "var(--font-din)", fontWeight: 500 }}>
            3–24 karakter, huruf/angka/underscore.
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>
            Password
          </span>
          <span className="auth-field-wrap">
            <span className="auth-field-icon">🔒</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="auth-field"
              placeholder="Minimal 6 karakter"
            />
          </span>
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>
            Daftar sebagai
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              data-active={role === "STUDENT"}
              className="auth-role"
            >
              <span className="text-2xl">🎒</span>
              <span style={{ fontSize: 15 }} className={role === "STUDENT" ? "text-duo-green-dark" : "text-charcoal"}>
                Siswa
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              data-active={role === "TEACHER"}
              className="auth-role"
            >
              <span className="text-2xl">🧑‍🏫</span>
              <span style={{ fontSize: 15 }} className={role === "TEACHER" ? "text-duo-green-dark" : "text-charcoal"}>
                Guru
              </span>
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] rounded-xl px-3 py-2.5" style={{ fontFamily: "var(--font-din)", fontWeight: 700 }}>
            {error}
          </p>
        )}
        <Button
          type="submit"
          loading={loading}
          loadingText="Memuat…"
          tactile={false}
          className="mt-2 rounded-2xl px-4 py-3.5 text-white font-bold uppercase tracking-wide bg-[var(--color-duo-green)] shadow-[0_4px_0_var(--color-duo-green-dark)] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all inline-flex items-center justify-center gap-2"
        >
          Daftar
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-[var(--color-graphite)]" style={{ fontFamily: "var(--font-din)", fontWeight: 700 }}>
        Sudah punya akun?{" "}
        <Link href="/login" className="text-[var(--color-sky-blue)] font-bold hover:underline">
          Masuk
        </Link>
      </p>
    </>
  );
}
