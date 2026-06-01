"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /** Column label for the categories, e.g. "Makanan". */
  labelHeader?: string;
  /** Column label for the values, e.g. "Terjual". */
  valueHeader?: string;
  /**
   * Data rows as `nama:angka` separated by `|`. Example:
   *   "Bakso:32|Mie Ayam:25|Es Teh:40|Gorengan:18"
   */
  rows?: string;
  title?: string;
  hint?: string;
  xp?: string;
}

interface Row {
  name: string;
  value: number;
}

function approx(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

/**
 * Mini spreadsheet: students compute SUM and AVERAGE of a data column, with a
 * live bar chart of the values. Authored as
 * `::game{type="spreadsheet" rows="Bakso:32|..." labelHeader="Makanan" valueHeader="Terjual"}`.
 */
export default function SpreadsheetGame({
  labelHeader = "Item",
  valueHeader = "Jumlah",
  rows = "",
  title = "Detektif Data",
  hint = "Hitung total (SUM) dan rata-rata (AVERAGE) dari data berikut.",
  xp = "20",
}: Props) {
  const data = useMemo<Row[]>(
    () =>
      rows
        .split("|")
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => {
          const [name, v] = r.split(":");
          return { name: (name ?? "").trim(), value: Number((v ?? "0").trim()) };
        }),
    [rows]
  );

  const sum = data.reduce((s, r) => s + r.value, 0);
  const avg = data.length ? sum / data.length : 0;
  const max = Math.max(1, ...data.map((r) => r.value));

  const fb = useGameFeedback();
  const [sumInput, setSumInput] = useState("");
  const [avgInput, setAvgInput] = useState("");
  const [sumOk, setSumOk] = useState<boolean | null>(null);
  const [avgOk, setAvgOk] = useState<boolean | null>(null);
  const [awarded, setAwarded] = useState(false);

  function check() {
    const s = approx(Number(sumInput), sum);
    const a = approx(Number(avgInput), avg);
    setSumOk(s);
    setAvgOk(a);
    if (s && a) {
      if (!awarded) {
        setAwarded(true);
        fb.solved({
          xp: Number(xp) || 20,
          label: `+${xp} XP`,
          game: "spreadsheet",
          score: 100,
          data: { SUM: sumInput, AVERAGE: avgInput },
        });
      }
    } else {
      fb.wrong();
    }
  }

  const both = sumOk && avgOk;

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#fdeef7] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-bubblegum)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🔎 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      <div className="mx-auto grid max-w-[620px] gap-4 sm:grid-cols-2">
        {/* Table */}
        <table className="w-full overflow-hidden rounded-xl border-2 border-[var(--color-cloud)] text-sm">
          <thead>
            <tr className="bg-[var(--color-bubblegum)] text-white">
              <th className="px-3 py-2 text-left">{labelHeader}</th>
              <th className="px-3 py-2 text-right">{valueHeader}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.name} className={i % 2 ? "bg-white" : "bg-[#fff7fb]"}>
                <td className="border-t border-[var(--color-cloud)] px-3 py-1.5">
                  {r.name}
                </td>
                <td className="border-t border-[var(--color-cloud)] px-3 py-1.5 text-right font-mono">
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bar chart */}
        <div className="flex flex-col justify-end gap-1.5">
          {data.map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-xs text-[var(--color-graphite)]">
                {r.name}
              </span>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--color-cloud)]">
                <div
                  className="h-full rounded-full bg-[var(--color-bubblegum)]"
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
              <span className="w-7 shrink-0 text-right font-mono text-xs">
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 flex max-w-[620px] flex-wrap items-end justify-center gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold text-[var(--color-charcoal)]">
          Total (SUM)
          <input
            value={sumInput}
            onChange={(e) => setSumInput(e.target.value)}
            inputMode="numeric"
            className={`w-28 rounded-xl border-2 px-3 py-2 font-mono text-sm ${sumOk === null
                ? "border-[var(--color-cloud)]"
                : sumOk
                  ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)]"
                  : "border-[#ff6b6b] bg-[#ffe9e9]"
              }`}
            placeholder="=SUM(...)"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-[var(--color-charcoal)]">
          Rata-rata (AVERAGE)
          <input
            value={avgInput}
            onChange={(e) => setAvgInput(e.target.value)}
            inputMode="decimal"
            className={`w-28 rounded-xl border-2 px-3 py-2 font-mono text-sm ${avgOk === null
                ? "border-[var(--color-cloud)]"
                : avgOk
                  ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)]"
                  : "border-[#ff6b6b] bg-[#ffe9e9]"
              }`}
            placeholder="rata-rata"
          />
        </label>
        <button
          onClick={check}
          className="rounded-xl bg-[var(--color-bubblegum)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#c2185b] hover:brightness-105 active:translate-y-0.5"
        >
          Periksa
        </button>
      </div>

      {both && (
        <div className="mx-auto mt-4 max-w-[620px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
          🎉 Tepat! Total {sum} dan rata-rata {avg.toFixed(1)}.
        </div>
      )}
    </div>
  );
}
