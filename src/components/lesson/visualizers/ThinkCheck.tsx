"use client";

import { useState } from "react";

interface Props {
  /**
   * Pipe-separated `letter:word:meaning` rows, e.g.
   * "T:True:Apakah ini benar?|K:Kind:Apakah ini baik & sopan?".
   */
  data?: string;
  /** Heading shown above the checklist. */
  title?: string;
  /** Message shown once every item is ticked. */
  done?: string;
}

interface Item {
  letter: string;
  word: string;
  meaning: string;
}

function parseData(data: string): Item[] {
  return data
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const seg = p.split(":").map((s) => s.trim());
      return {
        letter: seg[0] ?? "",
        word: seg[1] ?? "",
        meaning: seg.slice(2).join(":").trim(),
      };
    });
}

/**
 * An interactive checklist for the THINK-before-you-post idea. Each row is a
 * question the student ticks off; once all are ticked, a success message shows
 * that the post is safe to share. Reinforces stop-and-reflect digital habits.
 */
export default function ThinkCheck({
  data = "T:True:Apakah ini benar?|H:Helpful:Apakah ini bermanfaat?|I:Inspiring:Apakah ini menginspirasi?|N:Necessary:Apakah ini perlu dibagikan?|K:Kind:Apakah ini baik & sopan?",
  title = "THINK sebelum membagikan",
  done = "Semua ✓ — aman untuk dibagikan!",
}: Props) {
  const items = parseData(data);
  const [checked, setChecked] = useState<boolean[]>(() =>
    items.map(() => false)
  );
  const allDone = checked.length > 0 && checked.every(Boolean);

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        {title}
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((it, i) => {
          const on = checked[i];
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
                  on
                    ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)]"
                    : "border-[var(--color-cloud)] bg-[#fafafa] hover:border-[var(--color-sky-blue)]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-white transition-colors ${
                    on ? "bg-[var(--color-duo-green)]" : "bg-[var(--color-silver)]"
                  }`}
                  aria-hidden
                >
                  {on ? "✓" : it.letter}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-extrabold text-[var(--color-charcoal)]">
                    {it.letter} — {it.word}
                  </span>
                  {it.meaning && (
                    <span className="text-xs font-semibold text-[var(--color-graphite)]">
                      {it.meaning}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={`mt-3 rounded-xl px-3 py-2 text-center text-xs font-bold transition-all ${
          allDone
            ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
            : "bg-[#fafafa] text-[var(--color-silver)]"
        }`}
      >
        {allDone ? done : `Centang semua (${checked.filter(Boolean).length}/${items.length})`}
      </div>
    </div>
  );
}
