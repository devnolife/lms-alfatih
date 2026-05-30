"use client";

import { useState } from "react";

interface Props {
  /**
   * Grid of ink intensities 0..9, rows separated by `/` and digits optionally
   * separated by spaces. Example (a small heart):
   *   "0990990/9999999/9999999/0999990/0099900/0009000"
   */
  pattern?: string;
  /** Heading shown above the grid. */
  title?: string;
  /** Emoji/label describing what a human sees in the picture. */
  human?: string;
}

/** Parses a `/`-separated digit grid into a rectangular number matrix. */
function parseGrid(pattern: string): number[][] {
  const rows = pattern
    .split("/")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) =>
      (r.includes(" ") ? r.split(/\s+/) : r.split(""))
        .map((d) => Math.max(0, Math.min(9, parseInt(d, 10) || 0)))
    );
  const width = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return rows.map((r) => {
    const padded = [...r];
    while (padded.length < width) padded.push(0);
    return padded;
  });
}

/**
 * Shows how a computer "sees" a picture: the same drawing rendered either as
 * shaded squares (what a human sees) or as a grid of brightness numbers 0–9
 * (what the AI actually reads). Toggling between the two makes the core ML idea
 * concrete — images are just numbers. Pure render from props (no randomness),
 * safe for SSR.
 */
export default function PixelGrid({
  pattern = "0990990/9999999/9999999/0999990/0099900/0009000",
  title = "Bagaimana komputer melihat gambar",
  human = "❤️",
}: Props) {
  const [showNumbers, setShowNumbers] = useState(false);
  const grid = parseGrid(pattern);

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        {title}
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
        <div className="text-5xl" aria-hidden>
          {human}
        </div>
        <div className="text-2xl font-black text-[var(--color-silver)]" aria-hidden>
          →
        </div>
        <div
          className="grid gap-[2px] rounded-lg bg-[var(--color-cloud)] p-1"
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 1}, 1fr)` }}
        >
          {grid.flatMap((row, y) =>
            row.map((v, x) => {
              const shade = Math.round(255 - (v / 9) * 230); // 0=white, 9=dark
              const dark = v >= 5;
              return (
                <div
                  key={`${y}-${x}`}
                  className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[10px] font-bold transition-colors"
                  style={{
                    background: `rgb(${shade},${shade},${shade})`,
                    color: dark ? "#fff" : "var(--color-silver)",
                  }}
                >
                  {showNumbers ? v : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setShowNumbers((s) => !s)}
          className="rounded-xl border-2 border-[var(--color-sky-blue)] bg-[var(--color-sky-blue)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90"
        >
          {showNumbers ? "🙂 Lihat seperti manusia" : "🤖 Lihat seperti AI"}
        </button>
      </div>

      <p className="mt-3 text-center text-xs font-medium text-[var(--color-graphite)]">
        {showNumbers
          ? "Bagi AI, gambar hanyalah kumpulan angka: 0 = kosong, 9 = paling gelap."
          : "Mata kita melihat sebuah gambar. Tekan tombol untuk melihat versi AI."}
      </p>
    </div>
  );
}
