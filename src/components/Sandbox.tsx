"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import { runPython } from "@/utils/interpreter";
import { useGameState } from "@/hooks/useGameState";
import { useAudio } from "@/hooks/useAudio";
import Spinner from "@/components/ui/Spinner";

gsap.registerPlugin(ScrollTrigger);

const presets: Record<string, string> = {
  "preset-1": `print("Halo Calon Programmer Hebat! 👋")\nprint("🐍" * 5)\nprint("Coding Python itu GAMPANG!")`,
  "preset-2": `print("Anak Ular Lahir!")\nfor i in range(4):\n    print("🐍" * (i + 1))`,
  "preset-3": `print("Selamat Belajar!")\nprint("Hasil perkalian 6 dikali 6:")\nprint(6 * 6)`,
};

export default function Sandbox() {
  const [code, setCode] = useState(presets["preset-1"]);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bubbleText, setBubbleText] = useState(
    "Hai! Aku siap membaca baris kodemu. Pilih salah satu preset di sebelah kiri!"
  );
  const [running, setRunning] = useState(false);

  const { increaseXp, decreaseLife } = useGameState();
  const { playSuccess, playError } = useAudio();

  const sectionRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const bubbleMascotRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".sandbox-reveal").forEach((el) => {
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

  const lineCount = Math.max(code.split("\n").length, 6);

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setBubbleText("Menjalankan kodemu… 🐍");
    // Brief pause so the loading affordance is visible before results appear.
    await new Promise((r) => setTimeout(r, 450));
    const result = runPython(code);

    if (result.error) {
      setOutput(null);
      setError(result.error);
      setBubbleText("Aduh! Terjadi kesalahan di kodenya, coba perbarui! 😢");
      playError();
      decreaseLife();
      gsap.fromTo(outputRef.current, { x: -8 }, { x: 0, duration: 0.1, repeat: 4, yoyo: true });
    } else {
      setError(null);
      setOutput(result.output);
      setBubbleText("KODEMU BERHASIL! Ditambah +10 XP sebagai hadiah! 🦎🎉");
      playSuccess();
      increaseXp(10);
      gsap.fromTo(bubbleMascotRef.current, { scale: 0.7, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.5)" });
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
    }
    setRunning(false);
  }, [code, running, playSuccess, playError, increaseXp, decreaseLife]);

  const handlePreset = (key: string) => {
    setCode(presets[key]);
    setBubbleText("Preset ciamik terpasang! Ketuk JALANKAN buat ngebuktiin!");
    gsap.fromTo(bubbleMascotRef.current, { scale: 0.7 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
  };

  return (
    <section ref={sectionRef} id="sandbox" className="py-28">
      <div className="mx-auto max-w-[1140px] px-6">
        {/* Header */}
        <div className="text-center max-w-[800px] mx-auto mb-16 sandbox-reveal">
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] text-duo-green-dark mb-5 tracking-tight">
            Ketik Kodemu Sendiri, Lihat Sihirnya! 🪄
          </h2>
          <p className="text-xl text-graphite font-bold leading-relaxed">
            Coba preset asyik di bawah ini, lalu eksekusi dan ambil XP bonusmu!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
          {/* Editor */}
          <div className="sandbox-reveal border-3 border-almost-black rounded-3xl bg-[#1e1e24] shadow-[0_10px_0_var(--color-almost-black)] overflow-hidden flex flex-col">
            {/* Top bar */}
            <div className="bg-[#121216] border-b-3 border-almost-black px-6 py-4 flex justify-between items-center">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-almost-black bg-[#ff5f56]" />
                <span className="w-3.5 h-3.5 rounded-full border-2 border-almost-black bg-[#ffbd2e]" />
                <span className="w-3.5 h-3.5 rounded-full border-2 border-almost-black bg-[#27c93f]" />
              </div>
              <span className="text-silver font-[family-name:var(--font-feather)] text-sm tracking-wider">
                tantangan.py
              </span>
            </div>

            {/* Code area */}
            <div className="flex relative flex-1">
              {/* Line numbers */}
              <div className="py-5 pl-4 pr-2 text-right select-none bg-[#16161c] border-r-2 border-[#2d2d3a] text-[#555568] font-mono text-[17px] font-bold w-11">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                className="flex-grow h-64 bg-transparent border-none text-[#98ff54] font-mono text-[17px] font-bold p-5 resize-none outline-none leading-relaxed"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {/* Footer */}
            <div className="p-5 bg-[#121216] border-t-3 border-almost-black flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2.5">
                {[
                  { key: "preset-1", label: "Sapa Dunia 👋" },
                  { key: "preset-2", label: "Ular Beranak 🐍" },
                  { key: "preset-3", label: "Matematika 🔢" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePreset(p.key)}
                    className="bg-[#2d2d3a] text-white border-2 border-almost-black px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer shadow-[0_4px_0_var(--color-almost-black)] hover:bg-sky-blue hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                aria-busy={running}
                className="btn-3d btn-green !py-3 !px-6 !text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {running ? <Spinner size={16} /> : null}
                {running ? "MENJALANKAN…" : "JALANKAN ▶️"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div
            ref={outputRef}
            className="sandbox-reveal border-3 border-almost-black rounded-3xl bg-snow shadow-[0_10px_0_var(--color-almost-black)] overflow-hidden flex flex-col"
          >
            <div className="bg-cloud border-b-3 border-almost-black px-6 py-4 font-[family-name:var(--font-feather)] font-bold text-almost-black">
              LAYAR HASIL EKSEKUSI
            </div>

            <div className="p-6 bg-[#fafbfc] flex-grow font-mono text-[17px] min-h-[180px] whitespace-pre-wrap overflow-y-auto">
              {error ? (
                <span className="text-[#ff5f56] font-bold">Error: {error}</span>
              ) : output !== null ? (
                output
              ) : (
                <span className="text-silver italic">
                  Tekan tombol JALANKAN untuk melihat output di sini...
                </span>
              )}
            </div>

            {/* Mascot bubble */}
            <div className="flex items-center gap-5 mt-auto p-5 bg-duo-green-light border-t-3 border-almost-black">
              <svg
                ref={bubbleMascotRef}
                className="w-[60px] h-[60px] flex-shrink-0 transition-transform"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="40" fill="#d7ffb8" stroke="#3c3c3c" strokeWidth="4" />
                <path d="M30,55 Q50,75 70,55" stroke="#3c3c3c" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="44" cy="40" r="5" fill="#3c3c3c" />
                <circle cx="58" cy="40" r="5" fill="#3c3c3c" />
              </svg>
              <div className="relative bg-snow border-3 border-almost-black py-3 px-5 rounded-2xl text-sm font-extrabold shadow-[0_4px_0_var(--color-cloud)] flex-grow after:content-[''] after:absolute after:left-[-12px] after:top-1/2 after:-translate-y-1/2 after:rotate-45 after:w-4 after:h-4 after:bg-snow after:border-l-3 after:border-b-3 after:border-almost-black">
                {bubbleText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
