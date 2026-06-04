"use client";

import { useMemo, useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /** Code with "___" marking the blank. Use "\n" for new lines. */
  code?: string;
  /** Option tokens separated by "|". */
  options?: string;
  /** The correct token (must match one option exactly). */
  answer?: string;
  title?: string;
  question?: string;
}

/**
 * Fill-in-the-blank mini-game: a code snippet has a blank (`___`); the student
 * picks the token that completes it correctly, with instant feedback. Authored
 * as `::game{type="fill" code="___(\"Halo\")" options="print|tampil|echo" answer="print"}`.
 */
export default function FillBlankGame({
  code = "___(\"Halo, dunia!\")",
  options = "print|tampil|echo",
  answer = "print",
  title = "Isi Bagian Rumpang",
  question = "Pilih kata yang tepat untuk mengisi kotak kosong:",
}: Props) {
  // Shuffle the options once on mount so the correct token isn't always first.
  const opts = useMemo(() => {
    const arr = options.split("|").map((o) => o.trim());
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [options]);
  const [picked, setPicked] = useState<string | null>(null);
  const fb = useGameFeedback();
  const solvedRef = useRef(false);

  const handlePick = (opt: string) => {
    if (opt === picked) return;
    setPicked(opt);
    if (opt === answer) {
      if (!solvedRef.current) {
        solvedRef.current = true;
        // Persist completion (via ActivityContext) when used as a lesson
        // activity — mirrors QuizGame so lesson progress flips to COMPLETED.
        fb.solved({
          xp: 10,
          label: "+10 XP",
          game: "fill",
          score: 100,
          data: { [question]: opt },
        });
      } else {
        fb.correct();
      }
    } else {
      fb.wrong();
    }
  };

  const isCorrect = picked === answer;
  const [before, after] = code.includes("___")
    ? code.split("___")
    : [code, ""];

  const renderCode = () => {
    const fill =
      picked === null ? (
        <span className="rounded bg-[var(--color-sunshine)] px-3 py-0.5 text-[#1e1e1e]">
          ___
        </span>
      ) : (
        <span
          className={`rounded px-2 py-0.5 ${isCorrect ? "bg-[var(--color-duo-green)]" : "bg-[#ff6b6b]"
            } text-white`}
        >
          {picked}
        </span>
      );
    return (
      <code className="font-mono">
        {before.replace(/\\n/g, "\n")}
        {fill}
        {after.replace(/\\n/g, "\n")}
      </code>
    );
  };

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eefaff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        ✏️ {title}
      </div>
      <p className="mb-3 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {question}
      </p>

      <pre className="mx-auto mb-4 max-w-[680px] overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[#1e1e1e] px-4 py-3 text-base leading-relaxed text-white">
        {renderCode()}
      </pre>

      <div className="mx-auto flex max-w-[680px] flex-wrap justify-center gap-2">
        {opts.map((opt) => {
          const chosen = picked === opt;
          let cls =
            "border-[var(--color-cloud)] bg-white text-[var(--color-almost-black)]";
          if (chosen && opt === answer)
            cls =
              "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]";
          else if (chosen && opt !== answer)
            cls = "border-[#ff6b6b] bg-[#ffe9e9] text-[#d33]";
          return (
            <button
              key={opt}
              onClick={() => handlePick(opt)}
              className={`rounded-xl border-2 px-4 py-2 font-mono text-sm font-bold transition-colors ${chosen && opt === answer ? "fx-pop" : ""
                } ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          className={`mx-auto mt-3 max-w-[680px] rounded-xl px-3 py-2 text-center text-sm font-bold ${isCorrect
            ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
            : "bg-[#ffe9e9] text-[#d33]"
            }`}
        >
          {isCorrect
            ? "⭐ Pas sekali! Kotaknya terisi dengan benar! 🎉"
            : "Belum tepat 😅 Coba pilihan yang lain, ya."}
        </div>
      )}
    </div>
  );
}
