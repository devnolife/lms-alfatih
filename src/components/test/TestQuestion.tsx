"use client";

import type { TestQuestion as TQ } from "@/lib/test-questions";

/* Single question renderer — pilihan ganda untuk siswa SMP */

interface Props {
  q: TQ;
  index: number;
  value: unknown;
  onChange: (id: string, value: unknown) => void;
}

export default function TestQuestion({ q, index, value, onChange }: Props) {
  const selectedValue = value as number | undefined;
  return (
    <div>
      <div className="flex items-start gap-2">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-duo-green)] text-sm font-bold text-white">
          {index + 1}
        </span>
        <p className="mt-1 text-base font-semibold text-[var(--color-charcoal)] leading-relaxed">
          {q.question}
        </p>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const selected = selectedValue === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(q.id, i)}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition ${selected
                  ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)] shadow-[0_3px_0_var(--color-duo-green-dark)]"
                  : "border-[var(--color-cloud)] bg-white text-[var(--color-charcoal)] hover:border-[var(--color-sky)]"
                }`}
            >
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${selected
                    ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green)] text-white"
                    : "border-[var(--color-cloud)] text-[var(--color-graphite)]"
                  }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
