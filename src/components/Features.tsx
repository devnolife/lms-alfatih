"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    emoji: "📖",
    title: "Super Sederhana",
    desc: "Membaca kode Python semudah membaca buku cerita bahasa Inggris biasa. Gak bikin pusing kepala!",
  },
  {
    emoji: "🤖",
    title: "Mesin Utama AI",
    desc: "Pondasi dasar ChatGPT dan AI tercanggih di dunia dibangun menggunakan instruksi script Python.",
  },
  {
    emoji: "🚀",
    title: "Skill Abad ke-21",
    desc: "Pelajari keahlian ajaib yang sangat dibutuhkan di masa depan oleh ribuan startup digital keren!",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((el) => {
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

  return (
    <section ref={sectionRef} className="py-28 bg-[#fafbfc]">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] text-grape-dark mb-5 tracking-tight">
            Kenapa Harus Belajar Python? 🤔
          </h2>
          <p className="text-xl text-graphite font-bold leading-relaxed">
            Bahasa pemrograman modern pilihan #1 yang menggerakkan kecerdasan
            buatan, visual game, dan teknologi luar angkasa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card duo-card p-10 group cursor-default"
            >
              <span className="text-5xl mb-6 inline-block group-hover:scale-115 group-hover:rotate-5 transition-transform duration-300">
                {f.emoji}
              </span>
              <h3 className="font-[family-name:var(--font-feather)] text-2xl mb-4">
                {f.title}
              </h3>
              <p className="text-graphite font-bold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
