"use client";

import { useState } from "react";
import type { GameState } from "@/hooks/useSessionStream";
import { GAME_CATALOG, QUIZ_BANK } from "@/components/session/quizBank";

const POINTS_PER_CORRECT = 100;

interface Props {
  sessionId: string;
  game: GameState;
  isTeacher: boolean;
  currentUserId: string;
  locked: boolean;
}

export default function GamePanel({
  sessionId,
  game,
  isTeacher,
  currentUserId,
  locked,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const round = game.round;
  const isOpen = round?.status === "OPEN";
  const myScore = game.scoreboard.find((s) => s.userId === currentUserId);

  async function startRound(gameKey: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameKey }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Gagal memulai kuis.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function closeRound() {
    if (busy || !round) return;
    if (!confirm("Tutup kuis ini? Skor akhir akan dibekukan.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/game/${round.id}/close`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Gagal menutup kuis.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitScore(score: number) {
    if (!round) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/game/${round.id}/score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Gagal mengirim skor.");
      }
    } catch {
      setError("Gagal mengirim skor.");
    }
  }

  return (
    <div className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg" style={{ fontFamily: "var(--font-feather)" }}>
          🎮 Kuis Cepat Kelompok
        </h2>
        {round && (
          <span
            className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              isOpen
                ? "bg-[var(--color-duo-green-light,#d7ffb8)] text-[var(--color-duo-green-dark)]"
                : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
            }`}
          >
            {isOpen ? "Berlangsung" : "Ditutup"}
          </span>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-[var(--color-error)]/10 px-3 py-2 text-sm font-bold text-[var(--color-error)]">
          {error}
        </p>
      )}

      {/* Teacher controls */}
      {isTeacher && !locked && (
        <div className="mb-4">
          {!isOpen ? (
            <div>
              <p className="mb-2 text-sm text-[var(--color-graphite)]">
                Pilih kuis untuk dimainkan bersama:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GAME_CATALOG).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    disabled={busy}
                    onClick={() => startRound(key)}
                    className="btn-3d rounded-2xl bg-[var(--color-duo-green)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-50"
                  >
                    Mulai · {meta.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={closeRound}
              className="btn-3d rounded-2xl bg-[var(--color-error)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_#c43d3d] disabled:opacity-50"
            >
              Tutup Kuis
            </button>
          )}
        </div>
      )}

      {/* Active round info */}
      {round ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[var(--color-cloud)] px-4 py-3">
            <div>
              <p className="font-bold">{round.title}</p>
              <p className="text-xs text-[var(--color-graphite)]">
                {round.questionCount} soal · maks{" "}
                {round.questionCount * POINTS_PER_CORRECT} poin
              </p>
            </div>
            {!isTeacher && isOpen && !locked && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="btn-3d rounded-2xl bg-[var(--color-sky-blue)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-sky-blue-dark)]"
              >
                {myScore ? "Main Lagi" : "Main"}
              </button>
            )}
          </div>

          {/* Scoreboard */}
          {game.scoreboard.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-silver)]">
              Belum ada yang mengirim skor.
            </p>
          ) : (
            <ul className="space-y-2">
              {game.scoreboard.map((row, i) => (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 ${
                    row.userId === currentUserId
                      ? "border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light,#ddf4ff)]"
                      : "border-[var(--color-cloud)]"
                  }`}
                >
                  <span className="w-6 text-center text-base font-bold">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="flex-1 font-bold">{row.displayName}</span>
                  <span className="rounded-xl bg-[var(--color-sunshine,#ffd700)]/30 px-3 py-1 text-sm font-bold text-[var(--color-charcoal)]">
                    {row.score} poin
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="py-6 text-center text-[var(--color-silver)]">
          {isTeacher
            ? "Belum ada kuis. Mulai satu untuk seluruh kelas!"
            : "Menunggu guru memulai kuis…"}
        </p>
      )}

      {playing && round && QUIZ_BANK[round.gameKey] && (
        <QuizRunner
          questions={QUIZ_BANK[round.gameKey]}
          title={round.title}
          onClose={() => setPlaying(false)}
          onFinish={(score) => {
            setPlaying(false);
            void submitScore(score);
          }}
        />
      )}
    </div>
  );
}

interface RunnerProps {
  questions: { prompt: string; code?: string; options: string[]; answerIndex: number }[];
  title: string;
  onClose: () => void;
  onFinish: (score: number) => void;
}

function QuizRunner({ questions, title, onClose, onFinish }: RunnerProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answerIndex) setCorrect((c) => c + 1);
  }

  function next() {
    if (picked === null) return;
    if (isLast) {
      const finalCorrect = correct;
      onFinish(finalCorrect * POINTS_PER_CORRECT);
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg" style={{ fontFamily: "var(--font-feather)" }}>
            {title}
          </h3>
          <span className="text-sm font-bold text-[var(--color-graphite)]">
            {index + 1}/{questions.length}
          </span>
        </div>

        <p className="mb-3 font-bold">{q.prompt}</p>
        {q.code && (
          <pre className="mb-4 overflow-x-auto rounded-2xl bg-[var(--color-almost-black,#1a1a1a)] px-4 py-3 text-sm text-[#d7ffb8]">
            <code>{q.code}</code>
          </pre>
        )}

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answerIndex;
            const isPicked = i === picked;
            let cls =
              "w-full rounded-2xl border-2 px-4 py-3 text-left font-bold transition";
            if (picked === null) {
              cls +=
                " border-[var(--color-cloud)] hover:border-[var(--color-sky-blue)]";
            } else if (isAnswer) {
              cls +=
                " border-[var(--color-duo-green)] bg-[var(--color-duo-green-light,#d7ffb8)] text-[var(--color-duo-green-dark)]";
            } else if (isPicked) {
              cls +=
                " border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]";
            } else {
              cls += " border-[var(--color-cloud)] opacity-60";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={picked !== null}
                onClick={() => choose(i)}
                className={cls}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-[var(--color-silver)] hover:text-[var(--color-graphite)]"
          >
            Keluar
          </button>
          <button
            type="button"
            disabled={picked === null}
            onClick={next}
            className="btn-3d rounded-2xl bg-[var(--color-duo-green)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-40"
          >
            {isLast ? "Selesai" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}
