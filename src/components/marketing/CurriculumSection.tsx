"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const modules = [
  {
    label: "Modul 1 · 45 mnt",
    badgeBg: "bg-duo-green",
    numColor: "text-duo-green",
    title: "Warm-up: Identitas Digital",
    desc: "Berkenalan dengan print(), variabel, dan f-string. Bikin kartu nama digital pertamamu.",
    skills: ["print()", "variabel", "string"],
    href: "/learn/warmup-digital-identity",
  },
  {
    label: "Modul 2 · 60 mnt",
    badgeBg: "bg-sky-blue",
    numColor: "text-sky-blue",
    title: "Logic Flow: Game Tebak Angka",
    desc: "Percabangan if/else dan loop for/while sambil ngebangun mini-game tebak angka.",
    skills: ["if/else", "for", "list"],
    href: "/learn/logic-tebak-angka",
  },
  {
    label: "Modul 3 · 90 mnt",
    badgeBg: "bg-grape",
    numColor: "text-grape",
    title: "Project Core: Turtle Art",
    desc: "Project penutup — kombinasi fungsi & loop untuk membuat seni ASCII. Selesai = dapat sertifikat.",
    skills: ["def", "loop nested", "fungsi"],
    href: "/learn/project-turtle-art",
  },
];

export default function CurriculumSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".module-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.1,
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="kurikulum"
      ref={sectionRef}
      className="py-28 bg-snow relative overflow-hidden"
    >
      <div className="mx-auto max-w-[1180px] px-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <span className="inline-block mb-4 text-[11px] uppercase tracking-[0.18em] font-bold text-duo-green-dark">
              1-Day Bootcamp Track
            </span>
            <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] tracking-tight leading-[1.1] max-w-[640px]">
              Tiga modul. Satu hari.{" "}
              <span className="text-duo-green">Satu sertifikat.</span>
            </h2>
          </div>
          <p className="text-graphite font-bold text-[15px] max-w-sm">
            Setiap modul punya tantangan ber-tes otomatis. Selesaikan semuanya
            untuk membuka sertifikat <em>FunPython Certified</em>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m, idx) => (
            <Link
              key={m.title}
              href={m.href}
              className="module-card group relative block bg-snow border-4 border-almost-black rounded-3xl p-7 shadow-[0_10px_0_var(--color-almost-black)] hover:-translate-y-1.5 hover:shadow-[0_14px_0_var(--color-almost-black)] transition-all"
            >
              <span
                className={`absolute -top-4 left-7 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-[11px] font-bold uppercase tracking-wide border-2 border-almost-black shadow-[0_3px_0_var(--color-almost-black)] font-[family-name:var(--font-feather)] ${m.badgeBg}`}
              >
                {m.label}
              </span>

              <div className="flex items-baseline gap-3 mb-3 mt-2">
                <span
                  className={`font-[family-name:var(--font-feather)] text-5xl ${m.numColor}`}
                >
                  0{idx + 1}
                </span>
                <span className="text-silver font-bold text-sm">/ 03</span>
              </div>

              <h3 className="font-[family-name:var(--font-feather)] text-2xl mb-2 leading-tight">
                {m.title}
              </h3>
              <p className="text-graphite font-bold text-[14.5px] leading-relaxed mb-5">
                {m.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {m.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-mono text-charcoal bg-[#f3f4f6] border border-cloud rounded-md px-2 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <span className="inline-flex items-center gap-1 text-sky-blue font-bold text-sm uppercase tracking-wide group-hover:gap-3 transition-all">
                Buka modul <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
