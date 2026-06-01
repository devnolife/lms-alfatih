"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /**
   * Questions encoded as:
   *   `pertanyaan|opsiA;opsiB;opsiC|indexJawaban|penjelasan`
   * separated by `~` between questions. Example:
   *   "1 byte = ? bit|4;8;16|1|Satu byte = 8 bit.~CPU itu...|...|0|..."
   */
  data?: string;
  title?: string;
  /** XP awarded once when every question is answered correctly. */
  xp?: string;
}

interface QItem {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

function parse(data: string): QItem[] {
  return data
    .split("~")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [q, opts, ans, explain] = chunk.split("|");
      return {
        q: (q ?? "").trim(),
        options: (opts ?? "").split(";").map((o) => o.trim()).filter(Boolean),
        answer: Number((ans ?? "0").trim()),
        explain: (explain ?? "").trim(),
      };
    });
}

/**
 * Multi-question quiz with instant per-question feedback and explanations.
 * Authored as `::game{type="quiz" data="..." title="Kuis Jaringan"}`.
 */
export default function QuizGame({
  data = "",
  title = "Kuis Cepat",
  xp = "15",
}: Props) {
  const items = useMemo(() => parse(data), [data]);
  const fb = useGameFeedback();
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [awarded, setAwarded] = useState(false);

  const correctCount = items.filter((it, i) => picked[i] === it.answer).length;
  const allCorrect = items.length > 0 && correctCount === items.length;

  function choose(qi: number, oi: number) {
    if (picked[qi] === oi) return;
    const next = { ...picked, [qi]: oi };
    setPicked(next);
    const isRight = items[qi].answer === oi;
    if (isRight) {
      const done = items.every((it, i) => next[i] === it.answer);
      if (done && !awarded) {
        setAwarded(true);
        const answers: Record<string, unknown> = {};
        items.forEach((it, i) => {
          answers[it.q || `Soal ${i + 1}`] = it.options[next[i]] ?? "";
        });
        fb.solved({
          xp: Number(xp) || 15,
          label: `+${xp} XP kuis`,
          game: "quiz",
          score: 100,
          data: answers,
        });
      } else {
        fb.correct();
      }
    } else {
      fb.wrong();
    }
  }

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#fff7ec] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sunshine-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        📝 {title}
      </div>
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
        {correctCount}/{items.length} benar
      </p>

      <div className="mx-auto flex max-w-[560px] flex-col gap-5">
        {items.map((it, qi) => {
          const chosen = picked[qi];
          const answered = chosen !== undefined;
          const right = answered && chosen === it.answer;
          return (
            <div
              key={qi}
              className="rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4"
            >
              <p className="mb-3 font-bold text-[var(--color-almost-black)]">
                {qi + 1}. {it.q}
              </p>
              <div className="flex flex-col gap-2">
                {it.options.map((opt, oi) => {
                  let cls =
                    "border-[var(--color-cloud)] bg-white text-[var(--color-almost-black)] hover:border-[var(--color-sky-blue)]";
                  if (answered && oi === it.answer)
                    cls =
                      "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]";
                  else if (answered && oi === chosen && oi !== it.answer)
                    cls = "border-[#ff6b6b] bg-[#ffe9e9] text-[#d33]";
                  return (
                    <button
                      key={oi}
                      onClick={() => choose(qi, oi)}
                      className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && it.explain && (
                <div
                  className={`mt-3 rounded-xl px-3 py-2 text-sm ${right
                      ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                      : "bg-[#fff3f3] text-[#c0392b]"
                    }`}
                >
                  <strong>{right ? "✅ Benar! " : "💡 "}</strong>
                  {it.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allCorrect && (
        <div
          className="mx-auto mt-4 max-w-[560px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]"
        >
          🎉 Hebat! Semua jawaban benar!
        </div>
      )}
    </div>
  );
}
