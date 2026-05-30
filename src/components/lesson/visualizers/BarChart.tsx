"use client";

import { useState } from "react";

interface Props {
  /** Pipe-separated `label:value` pairs, e.g. "Bakso:32|Es Teh:40". */
  data?: string;
  /** Heading shown above the chart. */
  title?: string;
  /** Unit appended to the SUM/AVERAGE footer, e.g. "porsi". */
  unit?: string;
}

interface Bar {
  label: string;
  value: number;
}

function parseData(data: string): Bar[] {
  return data
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const idx = p.lastIndexOf(":");
      const label = idx >= 0 ? p.slice(0, idx).trim() : p.trim();
      const value = idx >= 0 ? Number(p.slice(idx + 1).trim()) || 0 : 0;
      return { label, value };
    });
}

/**
 * A simple bar chart that turns numbers into bars (taller = bigger). A button
 * reveals the SUM (total) and AVERAGE plus a dashed average line, connecting the
 * picture to the two ideas the data lesson teaches. Pure render from props.
 */
export default function BarChart({
  data = "A:3|B:5|C:2",
  title = "Grafik batang",
  unit = "",
}: Props) {
  const [showStats, setShowStats] = useState(false);
  const bars = parseData(data);
  const max = Math.max(1, ...bars.map((b) => b.value));
  const total = bars.reduce((s, b) => s + b.value, 0);
  const avg = bars.length ? total / bars.length : 0;
  const avgPct = (avg / max) * 100;
  const unitTxt = unit ? ` ${unit}` : "";

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        {title}
      </div>

      <div className="relative flex h-[180px] items-end justify-around gap-2">
        {showStats && avgPct > 0 && (
          <div
            className="pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-[var(--color-grape)]"
            style={{ bottom: `${avgPct}%` }}
          >
            <span className="absolute -top-2 right-0 rounded bg-[var(--color-grape)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
              rata-rata {Math.round(avg)}
            </span>
          </div>
        )}
        {bars.map((b, i) => {
          const pct = (b.value / max) * 100;
          const isMax = b.value === max;
          return (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              <span className="mb-1 text-xs font-bold text-[var(--color-charcoal)]">
                {b.value}
              </span>
              <div
                className="w-full max-w-[44px] rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(4, pct)}%`,
                  background: isMax
                    ? "var(--color-duo-green)"
                    : "var(--color-sky-blue)",
                }}
                title={`${b.label}: ${b.value}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex justify-around gap-2 border-t-2 border-[var(--color-cloud)] pt-2">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[11px] font-semibold leading-tight text-[var(--color-graphite)]"
          >
            {b.value === max && <span aria-hidden>🏆 </span>}
            {b.label}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          onClick={() => setShowStats((s) => !s)}
          className="rounded-xl border-2 border-[var(--color-grape)] bg-[var(--color-grape)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90"
        >
          {showStats ? "🙈 Sembunyikan hitungan" : "🧮 Hitung SUM & AVERAGE"}
        </button>
        {showStats && (
          <p className="text-center text-xs font-bold text-[var(--color-charcoal)]">
            Total (SUM) = <span className="text-[var(--color-grape-dark)]">{total}{unitTxt}</span>{" "}
            · Rata-rata (AVERAGE) ={" "}
            <span className="text-[var(--color-grape-dark)]">
              {Math.round(avg * 10) / 10}{unitTxt}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
