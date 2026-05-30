"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /**
   * Pairs encoded as `emoji nama perangkat:fungsi` separated by `|`. Example:
   *   "⌨️ Keyboard:Mengetik teks|🖥️ Monitor:Menampilkan gambar"
   */
  pairs?: string;
  title?: string;
  hint?: string;
  /** XP awarded once when all pairs are matched. */
  xp?: string;
}

interface Pair {
  device: string;
  fn: string;
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
 * Drag-free "match" game: click a device, then click its function. Correct
 * matches lock in green. 100% unlocks the "Teknisi Muda" badge. Authored as
 * `::game{type="hardware" pairs="⌨️ Keyboard:Mengetik|..."}`.
 */
export default function HardwareMatchGame({
  pairs = "",
  title = "Pasangkan Perangkat",
  hint = "Klik perangkat lalu klik fungsinya yang benar.",
  xp = "20",
}: Props) {
  const parsed = useMemo<Pair[]>(
    () =>
      pairs
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const [device, fn] = p.split(":");
          return { device: (device ?? "").trim(), fn: (fn ?? "").trim() };
        }),
    [pairs]
  );

  const fns = useMemo(() => shuffle(parsed.map((p) => p.fn)), [parsed]);
  const fb = useGameFeedback();

  const [selDevice, setSelDevice] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrongFn, setWrongFn] = useState<string | null>(null);
  const [awarded, setAwarded] = useState(false);

  const allMatched = parsed.length > 0 && Object.keys(matched).length === parsed.length;

  function pickFn(fn: string) {
    if (!selDevice) return;
    const pair = parsed.find((p) => p.device === selDevice);
    if (!pair) return;
    if (pair.fn === fn) {
      const next = { ...matched, [selDevice]: fn };
      setMatched(next);
      setSelDevice(null);
      setWrongFn(null);
      if (Object.keys(next).length === parsed.length && !awarded) {
        setAwarded(true);
        fb.solved({
          xp: Number(xp) || 20,
          label: `+${xp} XP`,
          badge: {
            id: "teknisi-muda",
            label: "Teknisi Muda",
            emoji: "🛠️",
          },
        });
      } else {
        fb.correct();
      }
    } else {
      setWrongFn(fn);
      fb.wrong();
      setTimeout(() => setWrongFn(null), 600);
    }
  }

  const usedFns = new Set(Object.values(matched));

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#fffaf0] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sunshine-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🛠️ {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      <div className="mx-auto grid max-w-[560px] grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {parsed.map((p) => {
            const done = matched[p.device] !== undefined;
            const sel = selDevice === p.device;
            return (
              <button
                key={p.device}
                disabled={done}
                onClick={() => setSelDevice(sel ? null : p.device)}
                className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                  done
                    ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                    : sel
                      ? "border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light)] text-[var(--color-sky-blue-dark)]"
                      : "border-[var(--color-cloud)] bg-white hover:border-[var(--color-sky-blue)]"
                }`}
              >
                {p.device} {done && "✓"}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {fns.map((fn) => {
            const used = usedFns.has(fn);
            const isWrong = wrongFn === fn;
            return (
              <button
                key={fn}
                disabled={used}
                onClick={() => pickFn(fn)}
                className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  used
                    ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                    : isWrong
                      ? "border-[#ff6b6b] bg-[#ffe9e9] text-[#d33]"
                      : "border-[var(--color-cloud)] bg-white hover:border-[var(--color-sunshine-dark)]"
                }`}
              >
                {fn}
              </button>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <div className="mx-auto mt-4 max-w-[560px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
          🏅 Mantap! Kamu mendapat lencana Teknisi Muda!
        </div>
      )}
    </div>
  );
}
