"use client";

import { useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /** Correct lines in order, separated by "|". Shown reversed as the puzzle. */
  lines?: string;
  title?: string;
  hint?: string;
}

/**
 * Code-ordering mini-game: the student reorders scrambled code lines (using
 * up/down buttons) until they match the correct sequence, then checks. Teaches
 * that order matters in a program. Authored as
 * `::game{type="order" lines="a|b|c" title="..."}`.
 *
 * The starting scramble is deterministic (reversed) so server and client
 * render identically (no hydration mismatch).
 */
export default function OrderGame({
  lines = "nama = \"Sinta\"|print(nama)",
  title = "Urutkan Baris Kode",
  hint = "Susun baris dari atas ke bawah agar programnya benar.",
}: Props) {
  const correct = lines.split("|").map((l) => l.trim());
  const [order, setOrder] = useState<string[]>(() => [...correct].reverse());
  const [status, setStatus] = useState<"idle" | "success" | "fail">("idle");
  const fb = useGameFeedback();
  const solvedRef = useRef(false);

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setStatus("idle");
    fb.click();
  };

  const check = () => {
    const ok = order.every((line, i) => line === correct[i]);
    setStatus(ok ? "success" : "fail");
    if (ok) {
      if (!solvedRef.current) {
        solvedRef.current = true;
        fb.correct({ xp: 15 });
      } else {
        fb.correct();
      }
    } else {
      fb.wrong();
    }
  };

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#f3f0ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-grape-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🧩 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      <ol className="mx-auto flex max-w-[680px] flex-col gap-2">
        {order.map((line, i) => (
          <li
            key={`${line}-${i}`}
            className="flex items-center gap-2 rounded-xl border-2 border-[var(--color-cloud)] bg-[#1e1e1e] px-3 py-2"
          >
            <span className="w-5 text-center text-xs font-bold text-[var(--color-silver)]">
              {i + 1}
            </span>
            <code className="flex-1 font-mono text-sm text-white">{line}</code>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Naik"
                className="rounded bg-white/10 px-1.5 text-xs text-white disabled:opacity-30"
              >
                ▲
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label="Turun"
                className="rounded bg-white/10 px-1.5 text-xs text-white disabled:opacity-30"
              >
                ▼
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex justify-center">
        <button
          onClick={check}
          className="rounded-xl bg-[var(--color-grape)] px-5 py-2 text-sm font-bold text-white shadow-[0_3px_0_var(--color-grape-dark)]"
        >
          ✓ Periksa Urutan
        </button>
      </div>

      {status === "success" && (
        <div className="mx-auto mt-3 max-w-[680px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
          ⭐ Tepat! Urutannya sudah benar! 🎉
        </div>
      )}
      {status === "fail" && (
        <div className="mx-auto mt-3 max-w-[680px] rounded-xl bg-[#ffe9e9] px-3 py-2 text-center text-sm font-bold text-[#d33]">
          Belum pas 😅 Coba pindahkan barisnya lagi.
        </div>
      )}
    </div>
  );
}
