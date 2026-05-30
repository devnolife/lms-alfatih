"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import MascotSvg from "./MascotSvg";

export default function Hero() {
  const mascotRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(mascotRef.current, {
        scale: 0,
        rotation: -45,
        duration: 1.3,
        ease: "back.out(1.8)",
      })
        .from(shadowRef.current, { scaleX: 0, opacity: 0, duration: 0.8 }, "-=1")
        .from(textRef.current, { x: -60, opacity: 0, duration: 0.9 }, "-=1");

      // Idle floating
      gsap.to(mascotRef.current, {
        y: -18,
        rotation: 3,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(shadowRef.current, {
        scaleX: 0.85,
        opacity: 0.5,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 min-h-[calc(100vh-80px)] flex items-center">
      <div className="mx-auto max-w-[1140px] px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
        {/* Text */}
        <div ref={textRef}>
          <span className="inline-block mb-4 px-4 py-2 rounded-full bg-duo-green-light text-duo-green-dark font-[family-name:var(--font-feather)] font-bold text-sm border-2 border-duo-green">
            🔥 LEVEL: PEMULA (SMP)
          </span>
          <h1 className="font-[family-name:var(--font-feather)] text-5xl md:text-[64px] leading-[1.1] tracking-tight mb-6">
            Belajar{" "}
            <span className="text-duo-green relative inline-block">
              &quot;python&quot;
              <span className="absolute bottom-0.5 left-0 w-full h-2 bg-duo-green-light rounded -z-1" />
            </span>
            <br />
            Gak Pake <span className="text-sky-blue">Boring!</span>
          </h1>
          <p className="text-graphite text-lg md:text-xl font-extrabold mb-10 leading-relaxed max-w-xl">
            Belajar coding seseru bermain game petualangan! Ketik baris kodenya
            langsung di browser, selesaikan tantangan berhadiah XP, dan pamerkan
            skor tertinggimu! 🚀🐍✨
          </p>
          <div className="flex flex-col gap-5 max-w-sm">
            <button
              className="btn-3d btn-green text-base"
              onClick={() => scrollTo("sandbox")}
            >
              Coba Ketik Kode! 💻
            </button>
            <button
              className="btn-3d btn-outline text-base"
              onClick={() => scrollTo("quiz")}
            >
              Ikut Kuis Menantang 🏆
            </button>
          </div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center items-center relative order-first lg:order-last">
          <div
            ref={shadowRef}
            className="absolute bottom-[-10px] w-60 h-6 bg-black/8 rounded-full z-[1]"
          />
          <div ref={mascotRef} className="z-[2] cursor-pointer">
            <MascotSvg className="w-full max-w-[420px] h-auto drop-shadow-[0_8px_0_rgba(0,0,0,0.05)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
