"use client";

import { useEffect, useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /**
   * Flowchart steps separated by `|`. A step containing `___` is a blank to be
   * filled. Example:
   *   "Mulai|Baca angka|___|Tampilkan hasil|Selesai"
   */
  steps?: string;
  /** Correct tokens for each blank, in order, separated by `;`. */
  answers?: string;
  /** Token bank (includes the answers plus distractors), separated by `;`. */
  bank?: string;
  title?: string;
  hint?: string;
  xp?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fill the blanks of an algorithm flowchart from a token bank, in order.
 * Authored as `::game{type="flowchart" steps="Mulai|___|Selesai" answers="..." bank="..."}`.
 */
export default function FlowchartGame({
  steps = "",
  answers = "",
  bank = "",
  title = "Lengkapi Diagram Alir",
  hint = "Klik token untuk mengisi kotak rumpang dari atas ke bawah.",
  xp = "15",
}: Props) {
  const stepList = useMemo(
    () => steps.split("|").map((s) => s.trim()).filter(Boolean),
    [steps]
  );
  const answerList = useMemo(
    () => answers.split(";").map((a) => a.trim()).filter(Boolean),
    [answers]
  );
  const tokenBank = useMemo(
    () => bank.split(";").map((b) => b.trim()).filter(Boolean),
    [bank]
  );
  // Render the bank in source order on the server and first client paint to
  // avoid a hydration mismatch, then shuffle once after mount.
  const [tokens, setTokens] = useState<string[]>(tokenBank);
  useEffect(() => {
    setTokens(shuffle(tokenBank));
  }, [tokenBank]);

  const fb = useGameFeedback();
  const [fills, setFills] = useState<string[]>([]);
  const [awarded, setAwarded] = useState(false);

  const blanksTotal = answerList.length;

  function placeToken(token: string) {
    if (fills.length >= blanksTotal) return;
    const idx = fills.length;
    const next = [...fills, token];
    setFills(next);
    if (token === answerList[idx]) {
      if (next.length === blanksTotal && next.every((f, i) => f === answerList[i])) {
        if (!awarded) {
          setAwarded(true);
          const data: Record<string, unknown> = {};
          next.forEach((f, i) => {
            data[`isian ${i + 1}`] = f;
          });
          fb.solved({
            xp: Number(xp) || 15,
            label: `+${xp} XP`,
            game: "flowchart",
            score: 100,
            data,
          });
        }
      } else {
        fb.correct();
      }
    } else {
      fb.wrong();
    }
  }

  function reset() {
    setFills([]);
  }

  const usedCounts = fills.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  let blankIndex = -1;
  const allCorrect =
    fills.length === blanksTotal && fills.every((f, i) => f === answerList[i]);

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#f3edff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-grape)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🧠 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      <div className="mx-auto flex max-w-[460px] flex-col items-center gap-1">
        {stepList.map((step, i) => {
          const isBlank = step.includes("___");
          if (isBlank) blankIndex += 1;
          const myBlank = blankIndex;
          const filled = isBlank ? fills[myBlank] : null;
          const correct = isBlank && filled === answerList[myBlank];
          const wrong = isBlank && filled !== undefined && !correct;
          return (
            <div key={i} className="flex w-full flex-col items-center">
              <div
                className={`w-full rounded-xl border-2 px-4 py-2.5 text-center text-sm font-bold ${!isBlank
                  ? "border-[var(--color-grape)] bg-white text-[var(--color-almost-black)]"
                  : correct
                    ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                    : wrong
                      ? "border-[#ff6b6b] bg-[#ffe9e9] text-[#d33]"
                      : "border-dashed border-[var(--color-grape)] bg-[var(--color-cloud)] text-[var(--color-silver)]"
                  }`}
              >
                {isBlank ? filled ?? "❔ rumpang" : step}
              </div>
              {i < stepList.length - 1 && (
                <span className="text-[var(--color-grape)]">↓</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-5 flex max-w-[620px] flex-wrap justify-center gap-2">
        {tokens.map((token, i) => {
          const allowedUses = answerList.filter((a) => a === token).length;
          const exhausted = (usedCounts[token] ?? 0) >= Math.max(allowedUses, 1);
          return (
            <button
              key={`${token}-${i}`}
              disabled={fills.length >= blanksTotal || exhausted}
              onClick={() => placeToken(token)}
              className="rounded-xl border-2 border-[var(--color-cloud)] bg-white px-3 py-2 font-mono text-sm font-bold text-[var(--color-almost-black)] transition-colors hover:border-[var(--color-grape)] disabled:opacity-40"
            >
              {token}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={reset}
          className="rounded-xl border-2 border-[var(--color-cloud)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)] hover:border-[var(--color-grape)]"
        >
          ↺ Ulangi
        </button>
      </div>

      {allCorrect && (
        <div className="mx-auto mt-4 max-w-[620px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
          🎉 Diagram alirnya lengkap dan benar!
        </div>
      )}
    </div>
  );
}
