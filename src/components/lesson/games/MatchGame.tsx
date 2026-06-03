"use client";

import { useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /** Code snippet to show (use "\n" for new lines). */
  code?: string;
  /** Answer options separated by "|". Use "\n" inside an option for multi-line. */
  options?: string;
  /** 0-based index of the correct option. */
  answer?: string;
  title?: string;
  question?: string;
}

/**
 * Match-the-output mini-game: shows a small code snippet and asks the student
 * to pick what it prints. Multiple choice with instant feedback. Authored as
 * `::game{type="match" code="print(1+2)" options="3|12|1 2" answer="0"}`.
 */
export default function MatchGame({
  code = "print(\"Halo\")",
  options = "Halo|halo|\"Halo\"",
  answer = "0",
  title = "Tebak Hasilnya",
  question = "Apa yang akan ditampilkan kode ini?",
}: Props) {
  const codeLines = code.split("\\n");
  const opts = options.split("|").map((o) => o.replace(/\\n/g, "\n"));
  const correctIndex = parseInt(answer, 10) || 0;
  const [picked, setPicked] = useState<number | null>(null);
  const fb = useGameFeedback();
  const solvedRef = useRef(false);

  const handlePick = (i: number) => {
    if (i === picked) return;
    setPicked(i);
    if (i === correctIndex) {
      if (!solvedRef.current) {
        solvedRef.current = true;
        fb.correct({ xp: 10 });
      } else {
        fb.correct();
      }
    } else {
      fb.wrong();
    }
  };

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#fff8ec] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sunshine-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🎯 {title}
      </div>
      <p className="mb-3 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {question}
      </p>

      <pre className="mx-auto mb-4 max-w-[680px] overflow-x-auto rounded-2xl bg-[#1e1e1e] px-4 py-3 text-sm leading-relaxed text-white">
        <code className="font-mono">{codeLines.join("\n")}</code>
      </pre>

      <div className="mx-auto flex max-w-[680px] flex-col gap-2">
        {opts.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === correctIndex;
          let cls =
            "border-[var(--color-cloud)] bg-white text-[var(--color-almost-black)]";
          if (picked !== null && isCorrect)
            cls =
              "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]";
          else if (isPicked && !isCorrect)
            cls = "border-[#ff6b6b] bg-[#ffe9e9] text-[#d33]";
          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              className={`flex items-center justify-between rounded-xl border-2 px-4 py-2 text-left font-mono text-sm font-bold transition-colors ${picked !== null && isCorrect ? "fx-pop" : ""
                } ${cls}`}
            >
              <span className="whitespace-pre-wrap">{opt}</span>
              {picked !== null && isCorrect && <span>✅</span>}
              {isPicked && !isCorrect && <span>❌</span>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          className={`mx-auto mt-3 max-w-[680px] rounded-xl px-3 py-2 text-center text-sm font-bold ${picked === correctIndex
              ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
              : "bg-[#ffe9e9] text-[#d33]"
            }`}
        >
          {picked === correctIndex
            ? "⭐ Benar! Kamu paham cara membaca kode! 🎉"
            : "Hampir! Lihat lagi kodenya, lalu coba pilih lagi."}
        </div>
      )}
    </div>
  );
}
