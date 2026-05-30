"use client";

import useAutoStepper from "@/hooks/useAutoStepper";
import PlayControls from "@/components/lesson/visualizers/PlayControls";

interface Props {
  name?: string;
  value?: string;
  /** Comma-separated list of values to step through, e.g. "Budi,Sinta,Andi". */
  values?: string;
}

/**
 * Visualizes a variable as a labelled "box" holding a value. If `values` is
 * provided, the box auto-cycles through reassignments so students can watch
 * the value change over time.
 */
export default function VariableBox({ name = "x", value = "", values }: Props) {
  const steps = values ? values.split(",").map((v) => v.trim()) : [value];
  const animated = steps.length > 1;

  const { value: idx, playing, toggle, reset } = useAutoStepper(
    animated ? steps.length - 1 : 0,
    { intervalMs: 2000, autoPlay: animated }
  );
  const current = steps[idx] ?? value;
  const isText = /[^0-9.\-]/.test(current) && current !== "";

  return (
    <div className="not-prose my-5 flex flex-col items-center gap-3 rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-4 pt-5 pb-9">
      <div className="flex items-end gap-3">
        <span className="font-mono text-lg font-bold text-[var(--color-charcoal)]">
          {name} =
        </span>
        <div className="relative">
          <div
            key={idx}
            className="min-w-[90px] rounded-xl border-[3px] border-[var(--color-grape)] bg-[#f3ecff] px-5 py-3 text-center text-lg font-bold text-[var(--color-grape-dark)] shadow-[0_4px_0_var(--color-grape)] transition-all duration-300"
          >
            {isText ? (
              <span>&ldquo;{current}&rdquo;</span>
            ) : (
              <span>{current || "?"}</span>
            )}
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
            {isText ? "teks (str)" : "angka (int)"}
          </span>
        </div>
      </div>

      {animated && (
        <div className="mt-4">
          <PlayControls
            playing={playing}
            onToggle={toggle}
            onReset={reset}
            status={`langkah ${idx + 1}/${steps.length}`}
          />
        </div>
      )}
    </div>
  );
}
