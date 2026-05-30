"use client";

import useAutoStepper from "@/hooks/useAutoStepper";
import PlayControls from "@/components/lesson/visualizers/PlayControls";

interface Props {
  /** Start value (inclusive). */
  start?: string;
  /** Stop value (exclusive, like Python range). */
  stop?: string;
  /** Variable name shown in the loop, defaults to "i". */
  varName?: string;
  /** Template for the body line; {i} is replaced by the current value. */
  body?: string;
}

/**
 * Auto-animates a `for i in range(...)` loop one iteration at a time so
 * students can watch the loop variable change and see what each pass prints.
 */
export default function LoopStepper({
  start = "0",
  stop = "5",
  varName = "i",
  body = "print({i})",
}: Props) {
  const from = Number.parseInt(start, 10) || 0;
  const to = Number.parseInt(stop, 10) || 0;
  const values: number[] = [];
  for (let v = from; v < to; v++) values.push(v);

  const { value: step, done, playing, toggle, reset } = useAutoStepper(
    values.length,
    { intervalMs: 1800 }
  );
  const current = values[step];

  const renderedBody = body.replace(/\{i\}/g, String(current ?? ""));
  const printed = values
    .slice(0, Math.min(step + (done ? 0 : 1), values.length))
    .map((v) => body.replace(/\{i\}/g, String(v)))
    .map((line) => line.replace(/^print\((.*)\)$/, "$1").replace(/['"]/g, ""));

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <pre className="rounded-xl bg-[#1e1e1e] px-4 py-3 text-sm leading-relaxed text-white overflow-auto">
        <code>
          <span className="text-[#c586c0]">for</span> {varName}{" "}
          <span className="text-[#c586c0]">in</span>{" "}
          <span className="text-[#dcdcaa]">range</span>({from}, {to}):{"\n"}
          {"    "}
          <span
            className={
              done ? "opacity-40" : "bg-[var(--color-sunshine)]/30 rounded px-1"
            }
          >
            {renderedBody.replace(/\{i\}/g, varName)}
          </span>
        </code>
      </pre>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <div className="rounded-xl border-2 border-[var(--color-grape)] bg-[#f3ecff] px-3 py-1.5 text-sm font-bold text-[var(--color-grape-dark)]">
          {varName} = {done ? "selesai" : current}
        </div>
        <PlayControls
          playing={playing}
          onToggle={toggle}
          onReset={reset}
          status={done ? "selesai" : `putaran ${step + 1}/${values.length}`}
        />
      </div>

      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
          Output
        </div>
        <pre className="mt-1 min-h-[44px] rounded-xl border-2 border-[var(--color-cloud)] bg-[#f7f7f7] px-3 py-2 text-sm whitespace-pre-wrap">
          {printed.join("\n")}
        </pre>
      </div>
    </div>
  );
}
