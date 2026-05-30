"use client";

import useAutoStepper from "@/hooks/useAutoStepper";
import PlayControls from "@/components/lesson/visualizers/PlayControls";

interface Props {
  /** Pipe-separated print arguments, e.g. "Halo|Nama saya Budi|Selesai". */
  lines?: string;
}

/**
 * Auto-animates how Python runs line by line, top to bottom. Each tick
 * "executes" the next print() and its output appears in order.
 */
export default function PrintFlow({
  lines = "Baris 1|Baris 2|Baris 3",
}: Props) {
  const items = lines.split("|").map((s) => s.trim());
  const { value: executed, done, playing, toggle, reset } = useAutoStepper(
    items.length,
    { intervalMs: 1800 }
  );

  return (
    <div className="not-prose my-5 grid gap-3 sm:grid-cols-2 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
          Kode
        </div>
        <pre className="mt-1 rounded-xl bg-[#1e1e1e] px-3 py-3 text-sm leading-relaxed text-white">
          <code>
            {items.map((it, i) => (
              <div
                key={i}
                className={
                  i < executed
                    ? "opacity-40"
                    : i === executed
                      ? "bg-[var(--color-sunshine)]/30 rounded px-1"
                      : ""
                }
              >
                <span className="text-[#dcdcaa]">print</span>(
                <span className="text-[#ce9178]">&quot;{it}&quot;</span>)
              </div>
            ))}
          </code>
        </pre>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
          Output
        </div>
        <pre className="mt-1 min-h-[80px] rounded-xl border-2 border-[var(--color-cloud)] bg-[#f7f7f7] px-3 py-2 text-sm whitespace-pre-wrap">
          {items.slice(0, executed).join("\n")}
        </pre>
      </div>

      <div className="sm:col-span-2">
        <PlayControls
          playing={playing}
          onToggle={toggle}
          onReset={reset}
          status={done ? "selesai" : `baris ${executed + 1}/${items.length}`}
        />
      </div>
    </div>
  );
}
