"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    level: 1,
    color: "bg-duo-green shadow-[0_8px_0_var(--color-duo-green-dark)]",
    title: "Dasar Perintah",
    desc: "Mulai memecahkan misteri teks print() di layar komputer!",
    align: "left" as const,
    active: true,
  },
  {
    level: 2,
    color: "bg-sky-blue shadow-[0_8px_0_var(--color-sky-blue-dark)]",
    title: "Kondisi Ajaib",
    desc: "Membuahkan percabangan sakti lewat if dan else.",
    align: "right" as const,
    active: false,
  },
  {
    level: 3,
    color: "bg-sunshine shadow-[0_8px_0_var(--color-sunshine-dark)]",
    title: "Instan Berulang",
    desc: "Mencetak ribuan ular dalam 1 milidetik pakai loop for / range().",
    align: "left" as const,
    active: false,
  },
  {
    level: "🏆",
    color: "bg-grape shadow-[0_8px_0_var(--color-grape-dark)]",
    title: "Python Champ!",
    desc: "Ciptakan mahakarya game interaktifmu sendiri!",
    align: "center" as const,
    active: false,
  },
];

export default function Pathway() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleNodeClick = (el: HTMLButtonElement) => {
    gsap.fromTo(el, { scale: 0.75 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <section className="py-28 bg-[#f8fafc]">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] text-duo-green-dark mb-5 tracking-tight">
            Peta Petualangan Python-mu 🗺️
          </h2>
          <p className="text-xl text-graphite font-bold leading-relaxed">
            Naik kelas selangkah demi selangkah, asah logikamu, dan rebut tahta
            Master Python!
          </p>
        </div>

        <div
          ref={ref}
          className="relative max-w-[850px] mx-auto border-4 border-almost-black rounded-[32px] shadow-[0_12px_0_var(--color-almost-black)] bg-white px-8 py-20 flex flex-col items-center gap-16 overflow-hidden"
        >
          {/* Connecting dashed line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
            viewBox="0 0 800 650"
            preserveAspectRatio="none"
          >
            <path
              d="M 180,100 C 400,100 400,280 620,280 C 400,280 400,460 180,460 C 400,460 400,560 400,560"
              fill="none"
              stroke="#cfd8dc"
              strokeWidth="6"
              strokeDasharray="14,14"
              strokeLinecap="round"
            />
          </svg>

          {steps.map((s, i) => {
            const justify =
              s.align === "left"
                ? "justify-start pl-[8%]"
                : s.align === "right"
                  ? "justify-end pr-[8%]"
                  : "justify-center";

            return (
              <div
                key={i}
                className={`flex items-center gap-6 relative z-[2] w-full ${justify}`}
              >
                {s.align === "right" && (
                  <StepInfo title={s.title} desc={s.desc} />
                )}
                <button
                  onClick={(e) => handleNodeClick(e.currentTarget)}
                  className={`w-[90px] h-[90px] rounded-full border-4 border-almost-black flex items-center justify-center text-4xl font-[family-name:var(--font-feather)] font-bold cursor-pointer transition-all hover:-translate-y-1 active:translate-y-1.5 active:!shadow-none relative ${s.color}`}
                >
                  {s.active && (
                    <span className="absolute w-[110px] h-[110px] border-4 border-dashed border-duo-green rounded-full animate-spin [animation-duration:8s]" />
                  )}
                  {s.level}
                </button>
                {s.align !== "right" && (
                  <StepInfo title={s.title} desc={s.desc} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepInfo({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-snow border-3 border-almost-black rounded-2xl px-6 py-4 shadow-[0_6px_0_var(--color-almost-black)] max-w-[280px]">
      <h4 className="font-[family-name:var(--font-feather)] text-lg mb-1">
        {title}
      </h4>
      <p className="text-sm text-graphite font-bold">{desc}</p>
    </div>
  );
}
