"use client";

import PendingLink from "@/components/ui/PendingLink";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const studentNames = ["Sinta", "Budi", "Andi", "Rara", "Dewi", "Tio"];

export default function ForTeachersSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".teacher-reveal",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="guru"
      ref={ref}
      className="py-28 bg-[#0f1924] text-snow relative overflow-hidden"
    >
      {/* grid background */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-[1180px] px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-14 items-center">
        <div className="teacher-reveal">
          <span className="inline-block mb-4 text-[11px] uppercase tracking-[0.2em] font-bold text-sunshine">
            ✦ Untuk Guru
          </span>
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[46px] leading-[1.05] tracking-tight mb-6">
            Lihat tiap baris kode siswa,{" "}
            <span className="text-duo-green">tanpa pindah meja.</span>
          </h2>
          <p className="text-[#c7d0dc] text-[17px] font-bold leading-relaxed mb-8 max-w-lg">
            Dashboard guru menampilkan progres seluruh kelas secara real-time.
            Klik salah satu siswa, lalu tekan <strong className="text-sunshine">Push to Screen</strong>{" "}
            untuk memproyeksikan kode mereka ke layar kelas — instant code review,
            tanpa USB, tanpa screenshare.
          </p>

          <ul className="space-y-3 mb-9">
            {[
              "Buat kelas + bagikan kode join 6-digit",
              "Lihat siswa siapa yang sudah selesai modul mana",
              "Pancarkan kode siswa ke proyektor dengan satu klik",
              "Ekspor sertifikat siswa per kelas (PDF cetak)",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15px] font-bold text-[#dde3ec]">
                <span className="mt-1 w-5 h-5 rounded-md bg-duo-green text-[#0f1924] inline-flex items-center justify-center text-xs">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>

          <PendingLink
            href="/register"
            className="btn-3d btn-green !text-base inline-flex"
          >
            Daftar sebagai Guru
          </PendingLink>
        </div>

        {/* Right: dashboard mock */}
        <div className="teacher-reveal relative">
          <div className="rounded-2xl border-2 border-[#2a3548] bg-[#121e2d] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* topbar */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#1a2433] border-b border-[#2a3548]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-duo-green animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#9fb0c8]">
                  Kelas 8A · Modul 2 berjalan
                </span>
              </div>
              <button className="text-[11px] font-bold uppercase tracking-wide text-sunshine border border-sunshine/40 px-2.5 py-1 rounded-md hover:bg-sunshine hover:text-[#0f1924] transition-colors">
                Push to Screen ↗
              </button>
            </div>

            {/* grid of students */}
            <div className="grid grid-cols-3 gap-3 p-5">
              {studentNames.map((name, i) => {
                const states = [
                  { label: "Selesai", color: "bg-duo-green text-[#0f1924]" },
                  { label: "Mengerjakan", color: "bg-sky-blue text-[#0f1924]" },
                  { label: "Idle", color: "bg-[#3a4659] text-[#aab4c4]" },
                ];
                const state = states[i % 3];
                return (
                  <div
                    key={name}
                    className="rounded-xl bg-[#0f1924] border border-[#2a3548] p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12.5px] font-bold text-snow">
                        {name}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${state.color}`}
                      >
                        {state.label}
                      </span>
                    </div>
                    <pre className="text-[10px] font-mono text-[#7f8aa0] leading-snug whitespace-pre">
{`for i in range(${i + 2}):
  print("🐍"*i)`}
                    </pre>
                  </div>
                );
              })}
            </div>

            {/* footer stats */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#0a121b] border-t border-[#2a3548] text-[11px] font-bold uppercase tracking-wide text-[#9fb0c8]">
              <span>24 siswa aktif</span>
              <span>Rata-rata XP: 245</span>
              <span className="text-duo-green">● Live</span>
            </div>
          </div>

          {/* sticker */}
          <div className="absolute -top-6 -right-4 hidden md:flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-bubblegum text-snow border-4 border-almost-black shadow-[0_6px_0_var(--color-almost-black)] rotate-[6deg] font-[family-name:var(--font-feather)]">
            <span className="text-[9px] uppercase tracking-wider">FITUR</span>
            <span className="text-sm leading-tight text-center">Push to<br/>Screen</span>
          </div>
        </div>
      </div>
    </section>
  );
}
