"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "🚫💾",
    iconBg: "bg-duo-green-light border-duo-green",
    title: "Zero Setup",
    desc: "Tanpa install Python, tanpa konfigurasi IDE. Editor & runtime jalan langsung di browser pakai WebAssembly.",
    badge: "Pyodide · WASM",
  },
  {
    icon: "🛠️",
    iconBg: "bg-sky-blue-light border-sky-blue",
    title: "Project-Based",
    desc: "Modul 1-hari yang fokus: dari Hello-World sampai Turtle Art jadi dalam satu sesi. Belajar dari ngerjain, bukan ngapal.",
    badge: "3 Modul · 1 Hari",
  },
  {
    icon: "👩‍🏫",
    iconBg: "bg-[#f3e8ff] border-grape",
    title: "Mode Guru",
    desc: "Monitor progres seluruh kelas secara real-time. Tombol Push-to-Screen langsung pancarkan kode siswa ke proyektor.",
    badge: "Live Monitoring",
  },
  {
    icon: "🏅",
    iconBg: "bg-[#fff8d6] border-sunshine",
    title: "Gamifikasi Nyata",
    desc: "XP, badge, dan sertifikat digital “FunPython Certified” yang bisa siswa pamerkan. Setiap tantangan punya hadiah.",
    badge: "XP · Badge · Cert",
  },
];

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="fitur" className="py-28 bg-[#fafbfc]">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="max-w-[760px] mb-14">
          <span className="inline-block mb-4 text-[11px] uppercase tracking-[0.18em] font-bold text-grape-dark">
            Kenapa FunPython
          </span>
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] tracking-tight leading-[1.1]">
            Dirancang untuk{" "}
            <span className="text-grape-dark">guru &amp; murid SMP</span>,
            bukan untuk developer dewasa.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <article key={f.title} className="feature-card duo-card p-7 group">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border-2 text-2xl mb-5 group-hover:rotate-6 group-hover:scale-110 transition-transform ${f.iconBg}`}
              >
                {f.icon}
              </div>
              <h3 className="font-[family-name:var(--font-feather)] text-[22px] mb-2 leading-tight">
                {f.title}
              </h3>
              <p className="text-graphite font-bold text-[14.5px] leading-relaxed mb-4">
                {f.desc}
              </p>
              <span className="inline-block text-[10.5px] uppercase tracking-[0.14em] font-bold text-silver">
                {f.badge}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
