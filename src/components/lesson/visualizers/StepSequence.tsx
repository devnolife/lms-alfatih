"use client";

import useAutoStepper from "@/hooks/useAutoStepper";
import PlayControls from "@/components/lesson/visualizers/PlayControls";

interface Props {
  /** Pipe-separated steps, e.g. "Bangun|Mandi|Sarapan|Berangkat". */
  steps?: string;
  /** Optional pipe-separated emoji, one per step, e.g. "⏰|🚿|🍳|🎒". */
  emojis?: string;
  /** Heading shown above the sequence. */
  title?: string;
}

/**
 * Visualizes an algorithm as an ordered, animated sequence of plain-language
 * steps (no code) — reinforcing the idea that an algorithm is a runtut
 * (step-by-step, in-order) list of actions. Built for computational-thinking
 * lessons where students have not yet seen Python.
 */
export default function StepSequence({
  steps = "Langkah 1|Langkah 2|Langkah 3",
  emojis = "",
  title = "Algoritma: urutan langkah",
}: Props) {
  const items = steps.split("|").map((s) => s.trim()).filter(Boolean);
  const icons = emojis.split("|").map((s) => s.trim());
  const { value: revealed, done, playing, toggle, reset } = useAutoStepper(
    items.length,
    { intervalMs: 1400 }
  );

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4 sm:p-5">
      <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        {title}
      </div>

      <ol className="flex flex-wrap items-stretch justify-center gap-2">
        {items.map((it, i) => {
          const shown = i < revealed;
          return (
            <li key={i} className="flex items-center gap-2">
              <div
                className={`flex min-w-[112px] flex-col items-center justify-center rounded-2xl border-2 px-3 py-3 text-center transition-all duration-300 sm:min-w-[124px] ${shown
                    ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] opacity-100 scale-100"
                    : "border-[var(--color-cloud)] bg-[#fafafa] opacity-40 scale-95"
                  }`}
              >
                <span
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white ${shown ? "bg-[var(--color-duo-green)]" : "bg-[var(--color-silver)]"
                    }`}
                >
                  {i + 1}
                </span>
                {icons[i] && (
                  <span className="text-2xl leading-none">{icons[i]}</span>
                )}
                <span className="mt-1 text-sm font-bold text-[var(--color-charcoal)]">
                  {it}
                </span>
              </div>
              {i < items.length - 1 && (
                <span
                  className={`text-xl font-black transition-colors duration-300 ${i < revealed - 1
                      ? "text-[var(--color-duo-green)]"
                      : "text-[var(--color-cloud)]"
                    }`}
                  aria-hidden
                >
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex justify-center">
        <PlayControls
          playing={playing}
          onToggle={toggle}
          onReset={reset}
          status={done ? "urutan lengkap ✓" : `langkah ${revealed}/${items.length}`}
        />
      </div>
    </div>
  );
}
