"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TEST_QUESTIONS } from "@/lib/test-questions";
import TestQuestion from "@/components/test/TestQuestion";
import MascotSvg from "@/components/MascotSvg";

const DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface Props {
  type: "PRE" | "POST";
}

export default function TestPlayer({ type }: Props) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
  } | null>(null);

  // Timer
  const startedAtRef = useRef(new Date().toISOString());
  const [remaining, setRemaining] = useState(DURATION_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!started) return;
    startedAtRef.current = new Date().toISOString();
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, DURATION_MS - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        // Auto-submit on timeout
        if (!submittedRef.current) {
          submittedRef.current = true;
          doSubmit();
        }
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const handleChange = useCallback((id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const doSubmit = async () => {
    if (submittedRef.current && submitted) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          answers,
          startedAt: startedAtRef.current,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ score: data.score, total: data.total, percentage: data.percentage });
        setSubmitted(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        alert(data.error || "Gagal menyimpan jawaban.");
        submittedRef.current = false;
      }
    } catch {
      alert("Gagal menghubungi server. Coba lagi.");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const answered = Object.keys(answers).length;
    if (answered < TEST_QUESTIONS.length) {
      const unanswered = TEST_QUESTIONS.length - answered;
      if (
        !confirm(
          `Masih ada ${unanswered} soal yang belum dijawab. Yakin ingin mengumpulkan?`
        )
      )
        return;
    }
    doSubmit();
  };

  // Format timer
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const timerText = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isUrgent = remaining < 5 * 60 * 1000; // < 5 min

  // ─── Dialog pembuka sebelum test dimulai ───
  if (!started) {
    const isPre = type === "PRE";
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center px-4 py-10">
        <div className="w-full rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-white p-7 text-center shadow-[0_8px_0_var(--color-almost-black)]">
          <MascotSvg className="mx-auto h-28 w-28" mood="cheer" />
          <h1
            className="mt-3 text-3xl text-[var(--color-duo-green-dark)]"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            {isPre ? "Halo, Calon Coder! 👋" : "Ayo Tunjukkan Kemampuanmu! 🎉"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-charcoal)]">
            {isPre ? (
              <>
                Sebelum mulai petualangan, yuk kerjakan{" "}
                <strong>tes kecil</strong> dulu. Tenang, ini{" "}
                <strong>bukan ujian</strong>! Kami cuma mau tahu apa yang sudah
                kamu ketahui. 😊
              </>
            ) : (
              <>
                Kamu sudah menyelesaikan semua level! Sekarang kerjakan{" "}
                <strong>tes akhir</strong> untuk melihat seberapa hebat
                kemajuanmu. 💪
              </>
            )}
          </p>

          <div className="mt-5 grid gap-2.5 text-left text-sm">
            <InfoRow emoji="📝" text={`${TEST_QUESTIONS.length} soal pilihan ganda yang mudah`} />
            <InfoRow emoji="⏱️" text={`Waktu ${Math.round(DURATION_MS / 60000)} menit (santai saja!)`} />
            <InfoRow emoji="✅" text="Tidak perlu bisa koding — cukup pakai logika" />
            <InfoRow emoji="🌟" text="Tidak ada nilai jelek, jawab sebisamu ya!" />
          </div>

          <button
            onClick={() => setStarted(true)}
            className="btn-3d mt-6 w-full rounded-2xl bg-[var(--color-duo-green)] px-8 py-4 text-base font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
          >
            🚀 Mulai Tes
          </button>
          <p className="mt-3 text-xs text-[var(--color-graphite)]">
            Klik tombol di atas kalau kamu sudah siap
          </p>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <MascotSvg className="mx-auto h-28 w-28" mood="cheer" />
        <h2
          className="mt-4 text-3xl text-[var(--color-duo-green-dark)]"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          {type === "PRE" ? "Pre-Test Selesai!" : "Post-Test Selesai!"}
        </h2>
        <p className="mt-2 text-[var(--color-charcoal)]">
          Skor kamu: <strong>{result.score}</strong> dari{" "}
          <strong>{result.total}</strong> ({result.percentage}%)
        </p>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-sunshine)] px-5 py-2 text-base font-bold text-[var(--color-almost-black)]">
          ⭐ {result.percentage}% benar
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push(type === "PRE" ? "/app" : "/app")}
            className="btn-3d rounded-2xl bg-[var(--color-duo-green)] px-8 py-3 text-base font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
          >
            {type === "PRE" ? "Mulai Belajar →" : "Kembali ke Beranda →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl text-[var(--color-duo-green-dark)]"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            {type === "PRE" ? "📝 Pre-Test" : "📝 Post-Test"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-graphite)]">
            {TEST_QUESTIONS.length} soal · Waktu {Math.round(DURATION_MS / 60000)} menit
          </p>
        </div>
        <div
          className={`rounded-xl border-2 px-4 py-2 text-center font-mono text-lg font-bold ${isUrgent
            ? "animate-pulse border-red-400 bg-red-50 text-red-600"
            : "border-[var(--color-cloud)] bg-white text-[var(--color-charcoal)]"
            }`}
        >
          ⏱️ {timerText}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--color-graphite)]">
          <span>
            {Object.keys(answers).length} / {TEST_QUESTIONS.length} dijawab
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-cloud)]">
          <div
            className="h-full rounded-full bg-[var(--color-duo-green)] transition-all"
            style={{
              width: `${(Object.keys(answers).length / TEST_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {TEST_QUESTIONS.map((q, i) => (
          <div
            key={q.id}
            className="rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-5 shadow-sm"
          >
            <TestQuestion
              q={q}
              index={i}
              value={answers[q.id]}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-3d rounded-2xl bg-[var(--color-grape)] px-10 py-4 text-base font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-grape-dark)] disabled:opacity-50"
        >
          {submitting ? "⏳ Mengirim..." : "📤 Kumpulkan Jawaban"}
        </button>
        <p className="mt-2 text-xs text-[var(--color-graphite)]">
          Jawaban tidak bisa diubah setelah dikumpulkan
        </p>
      </div>
    </div>
  );
}

function InfoRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-[var(--color-cloud)] bg-[var(--color-snow)] px-3 py-2.5">
      <span className="text-xl">{emoji}</span>
      <span className="font-medium text-[var(--color-charcoal)]">{text}</span>
    </div>
  );
}
