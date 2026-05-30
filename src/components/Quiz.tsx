"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import { useGameState } from "@/hooks/useGameState";
import { useAudio } from "@/hooks/useAudio";

gsap.registerPlugin(ScrollTrigger);

const quizData = [
  {
    question:
      '1. Kode manakah yang benar untuk menampilkan kalimat "Halo Python" di layar komputer?',
    options: [
      'print("Halo Python")',
      'echo "Halo Python"',
      "system.out.print(Halo Python)",
      'display("Halo Python")',
    ],
    correct: 0,
  },
  {
    question: '2. Berapakah hasil keluaran baris kode ini?\nprint("🐍" * 3)',
    options: ["🐍3", "🐍🐍🐍", "Syntax Error (Salah Koding)", "3"],
    correct: 1,
  },
  {
    question:
      "3. Konsep dasar pemrograman manakah yang paling pas dipakai untuk menyimpan suatu nilai sementara?",
    options: [
      "Looping (Perulangan)",
      "Variable (Variabel)",
      "Function (Fungsi)",
      "Sorting",
    ],
    correct: 1,
  },
];

const letters = ["A", "B", "C", "D"];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [complete, setComplete] = useState(false);

  const { increaseXp, decreaseLife } = useGameState();
  const { playSuccess, playError } = useAudio();

  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".quiz-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const data = quizData[current];
  const progress = ((current + 1) / quizData.length) * 100;

  const handleSelect = useCallback(
    (idx: number) => {
      if (feedback) return;
      setSelected(idx);

      const isCorrect = idx === data.correct;
      setFeedback(isCorrect ? "correct" : "incorrect");

      if (isCorrect) {
        increaseXp(20);
        playSuccess();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        decreaseLife();
        playError();
        gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.1, repeat: 3, yoyo: true });
      }
    },
    [feedback, data.correct, increaseXp, decreaseLife, playSuccess, playError]
  );

  const handleNext = () => {
    if (current < quizData.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setFeedback(null);
      gsap.fromTo(cardRef.current, { opacity: 0, x: 25 }, { opacity: 1, x: 0, duration: 0.4 });
    } else {
      setComplete(true);
      increaseXp(50);
      playSuccess();
      // Confetti cascade
      const end = Date.now() + 1600;
      const colors = ["#58cc02", "#1cb0f6", "#ffc700", "#a570ff", "#cc348d"];
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setSelected(null);
    setFeedback(null);
    setComplete(false);
  };

  return (
    <section ref={sectionRef} id="quiz" className="py-28">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="text-center max-w-[800px] mx-auto mb-16 quiz-reveal">
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] text-sky-blue-dark mb-5 tracking-tight">
            Uji Kekuatan Logikamu! 🏆
          </h2>
          <p className="text-xl text-graphite font-bold leading-relaxed">
            Jawab kuis di bawah, raih poin prestasi, dan pacu peringkat
            belajarmu!
          </p>
        </div>

        {/* Quiz Card */}
        <div
          ref={cardRef}
          className="quiz-reveal max-w-[650px] mx-auto border-3 border-almost-black rounded-3xl bg-snow shadow-[0_10px_0_var(--color-almost-black)] p-10 relative overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="bg-cloud h-5 rounded-xl overflow-hidden mb-8 border-3 border-almost-black">
            <div
              className="h-full bg-duo-green rounded-lg transition-all duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!complete ? (
            <>
              {/* Question */}
              <h3 className="font-[family-name:var(--font-feather)] text-2xl mb-7 leading-snug whitespace-pre-line">
                {data.question}
              </h3>

              {/* Options */}
              <div className="flex flex-col gap-4">
                {data.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={feedback !== null}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-3 text-left font-extrabold transition-all cursor-pointer
                        ${isSelected
                          ? "border-sky-blue-dark bg-sky-blue-light text-sky-blue-dark shadow-[0_5px_0_var(--color-sky-blue-dark)]"
                          : "border-cloud bg-snow text-almost-black shadow-[0_5px_0_var(--color-cloud)] hover:bg-[#fafbfc] hover:-translate-y-0.5 hover:shadow-[0_7px_0_var(--color-silver)]"
                        }
                        disabled:cursor-default
                      `}
                    >
                      <span
                        className={`w-9 h-9 rounded-[10px] border-3 flex items-center justify-center font-[family-name:var(--font-feather)] text-base flex-shrink-0 ${isSelected
                            ? "border-sky-blue-dark bg-sky-blue text-snow"
                            : "border-cloud bg-snow"
                          }`}
                      >
                        {letters[idx]}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Drawer */}
              <div
                className={`absolute bottom-[-3px] left-[-3px] right-[-3px] border-3 rounded-b-3xl px-10 py-6 flex justify-between items-center transition-all duration-350 z-10
                  ${feedback
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-full opacity-0 pointer-events-none"
                  }
                  ${feedback === "correct"
                    ? "bg-duo-green-light border-duo-green-dark"
                    : "bg-error-light border-error"
                  }
                `}
              >
                <div className="flex items-center gap-5">
                  <span className="text-4xl">
                    {feedback === "correct" ? "🎉" : "😢"}
                  </span>
                  <span
                    className={`font-[family-name:var(--font-feather)] text-xl ${feedback === "correct"
                        ? "text-duo-green-dark"
                        : "text-error"
                      }`}
                  >
                    {feedback === "correct"
                      ? "Jawabanmu Benar! +20 XP"
                      : `Kurang tepat! Jawaban: ${letters[data.correct]}`}
                  </span>
                </div>
                <button
                  onClick={handleNext}
                  className="btn-3d btn-green !py-3 !px-7 !text-sm"
                >
                  LANJUT
                </button>
              </div>
            </>
          ) : (
            /* Completed Screen */
            <div className="text-center py-8">
              <span className="text-7xl inline-block animate-bounce mb-6">
                🏆
              </span>
              <h3 className="font-[family-name:var(--font-feather)] text-3xl text-sky-blue-dark mb-3">
                Luar Biasa Hebat!
              </h3>
              <p className="text-graphite font-bold text-lg mb-6">
                Kamu berhasil menuntaskan semua tantangan! Bonus +50 XP!
              </p>
              <button className="btn-3d btn-green" onClick={handleReset}>
                Main Lagi 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
