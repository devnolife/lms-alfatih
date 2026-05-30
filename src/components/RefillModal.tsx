"use client";

import { useGameState } from "@/hooks/useGameState";
import { useAudio } from "@/hooks/useAudio";
import confetti from "canvas-confetti";

export default function RefillModal() {
  const { lives, refillLives } = useGameState();
  const { playSuccess } = useAudio();

  if (lives > 0) return null;

  const handleRefill = () => {
    refillLives();
    playSuccess();
    confetti({ particleCount: 40, spread: 40 });
  };

  return (
    <div className="fixed inset-0 bg-almost-black/70 flex items-center justify-center z-[1000] animate-in fade-in duration-300">
      <div className="bg-snow border-3 border-almost-black rounded-[28px] shadow-[0_14px_0_var(--color-almost-black)] max-w-[480px] w-[90%] p-10 text-center animate-in zoom-in-95 duration-300">
        {/* Sad mascot */}
        <svg
          className="w-[120px] h-[120px] mx-auto mb-5"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="#ffdfe0"
            stroke="#ea2b2b"
            strokeWidth="4"
          />
          <path
            d="M30,60 Q50,50 70,60"
            stroke="#3c3c3c"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="40" cy="40" r="6" fill="#3c3c3c" />
          <circle cx="60" cy="40" r="6" fill="#3c3c3c" />
          <path
            d="M35,28 Q40,32 45,30 M55,30 Q60,32 65,28"
            stroke="#3c3c3c"
            strokeWidth="3"
            fill="none"
          />
        </svg>
        <h3 className="font-[family-name:var(--font-feather)] text-3xl text-error mb-3">
          Nyawamu Habis! 😢
        </h3>
        <p className="text-graphite font-bold mb-6">
          Tidak apa-apa! Kesalahan adalah bukti nyata bahwa kamu sedang dalam
          proses belajar.
        </p>
        <button className="btn-3d btn-green" onClick={handleRefill}>
          Isi Ulang 5 Nyawa Gratis! ❤️
        </button>
      </div>
    </div>
  );
}
