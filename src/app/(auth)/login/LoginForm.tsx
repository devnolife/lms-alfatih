"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Gagal masuk. Coba lagi.");
        setSubmitting(false);
        return;
      }
      startTransition(() => {
        router.push(next);
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
          Selamat datang kembali! 👋
        </h1>
        <p
          className="mt-1 text-graphite"
          style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14 }}
        >
          Masuk untuk lanjut petualangan codingmu.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em" }}>
            Username
          </span>
          <span className="auth-field-wrap">
            <span className="auth-field-icon">👤</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="auth-field"
              placeholder="namamu"
            />
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
              autoComplete="current-password"
              className="auth-field"
              placeholder="••••••"
            />
          </span>
        </label>
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
          Masuk
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-[var(--color-graphite)]" style={{ fontFamily: "var(--font-din)", fontWeight: 700 }}>
        Belum punya akun?{" "}
        <Link href="/register" className="text-[var(--color-sky-blue)] font-bold hover:underline">
          Daftar di sini
        </Link>
      </p>
    </>
  );
}
