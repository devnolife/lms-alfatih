"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PendingLink from "@/components/ui/PendingLink";
import gsap from "gsap";
import MascotSvg from "@/components/MascotSvg";

const SAMPLE = `# Modul 1 · Identitas Digital
nama = "Sinta"
umur = 13

print(f"Halo, aku {nama}!")
print(f"Umurku {umur} tahun.")

for i in range(3):
    print("🐍" * (i + 1))`;

export default function MarketingHero() {
  const mascotRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  const [typed, setTyped] = useState("");

  // Intro animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(textRef.current, { x: -60, opacity: 0, duration: 0.9 })
        .from(
          codeRef.current,
          { y: 40, opacity: 0, duration: 0.9 },
          "-=0.6"
        )
        .from(
          mascotRef.current,
          { scale: 0, rotation: -20, duration: 1.2, ease: "back.out(1.6)" },
          "-=0.7"
        )
        .from(shadowRef.current, { scaleX: 0, opacity: 0, duration: 0.6 }, "-=0.7");

      gsap.to(mascotRef.current, {
        y: -14,
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

  // Typewriter
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setTyped(SAMPLE.slice(0, i));
      i = i < SAMPLE.length ? i + 1 : 0;
      const next = i === 1 ? 600 : i === SAMPLE.length ? 2400 : 32;
      setTimeout(tick, next);
    };
    const t = setTimeout(tick, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <section className="relative pt-16 pb-24 lg:pt-20 lg:pb-28 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-duo-green-light blur-3xl opacity-60" />
        <div className="absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-sky-blue-light blur-3xl opacity-70" />
      </div>

      <div className="mx-auto max-w-[1180px] px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        {/* Left: text */}
        <div ref={textRef}>
          <div className="mb-5 w-fit rounded-2xl bg-snow p-2.5 border-2 border-cloud shadow-[0_4px_0_var(--color-cloud)]">
            <Image
              src="/logo.png"
              alt="Fakultas Teknik Unismuh Makassar"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-duo-green-light text-duo-green-dark font-[family-name:var(--font-feather)] font-bold text-[13px] border-2 border-duo-green">
            🎓 KURIKULUM MERDEKA · ELEMEN AP & PLB
          </span>
          <h1 className="font-[family-name:var(--font-feather)] text-5xl md:text-[64px] leading-[1.05] tracking-tight mb-6">
            Belajar{" "}
            <span className="text-duo-green relative inline-block">
              Python
              <span className="absolute -bottom-1 left-0 w-full h-3 bg-duo-green-light rounded -z-10" />
            </span>
            ,<br />
            tanpa <span className="text-sky-blue">install</span> apa-apa.
          </h1>
          <p className="text-graphite text-lg md:text-[19px] font-bold mb-9 leading-relaxed max-w-xl">
            FunPython adalah platform LMS untuk siswa SMP — coding Python langsung
            di browser, materi yang dikemas seperti game, monitoring
            real-time untuk guru. Tanpa setup ribet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mb-8">
            <PendingLink href="/register" className="btn-3d btn-green text-base flex-1">
              Mulai Gratis 🚀
            </PendingLink>
            <a href="#sandbox" className="btn-3d btn-outline text-base flex-1">
              Coba Sandbox
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-bold uppercase tracking-wide text-graphite">
            <li className="flex items-center gap-2"><span className="text-duo-green">✓</span> Zero setup</li>
            <li className="flex items-center gap-2"><span className="text-duo-green">✓</span> Bahasa Indonesia</li>
            <li className="flex items-center gap-2"><span className="text-duo-green">✓</span> Sertifikat digital</li>
          </ul>
        </div>

        {/* Right: code window + mascot */}
        <div className="relative">
          <div
            ref={codeRef}
            className="relative bg-[#0f1924] border-4 border-almost-black rounded-2xl shadow-[0_12px_0_var(--color-almost-black)] overflow-hidden"
          >
            {/* window chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a2433] border-b-2 border-[#2a3548]">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#7f8aa0]">
                main.py · pyodide
              </span>
              <span className="text-[11px] font-bold text-duo-green">● Live</span>
            </div>

            {/* code */}
            <pre className="px-5 py-5 text-[13.5px] leading-[1.65] text-[#e6edf3] font-mono tracking-normal min-h-[280px] whitespace-pre">
              <Highlighted code={typed} />
              <span className="inline-block w-2 h-4 align-[-2px] bg-duo-green animate-pulse ml-0.5" />
            </pre>

            {/* output strip */}
            <div className="px-5 py-3 bg-[#0a121b] border-t-2 border-[#2a3548] text-[12.5px] text-[#8fd175] font-mono">
              ▸ Halo, aku Sinta! · 🐍 🐍🐍 🐍🐍🐍
            </div>
          </div>

          {/* Floating mascot */}
          <div className="absolute -bottom-8 -right-6 lg:-right-10 hidden sm:block">
            <div
              ref={shadowRef}
              className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-32 h-4 bg-black/15 rounded-full"
            />
            <div ref={mascotRef} className="relative z-10">
              <MascotSvg className="w-[150px] h-auto drop-shadow-[0_8px_0_rgba(0,0,0,0.06)]" />
            </div>
          </div>

          {/* XP sticker */}
          <div className="absolute -top-5 -left-5 hidden md:flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-sunshine border-4 border-almost-black shadow-[0_6px_0_var(--color-almost-black)] rotate-[-8deg] font-[family-name:var(--font-feather)]">
            <span className="text-[10px] uppercase tracking-wider text-charcoal">+XP</span>
            <span className="text-2xl text-almost-black leading-none">100</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Lightweight Python syntax highlighter for the hero typewriter.
function Highlighted({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={classFor(t.kind)}>
          {t.text}
        </span>
      ))}
    </>
  );
}

type Tok = { text: string; kind: "kw" | "str" | "num" | "com" | "fn" | "plain" };

const KEYWORDS = new Set(["for", "in", "if", "else", "elif", "def", "return", "while", "True", "False", "None", "import", "from", "as"]);
const BUILTINS = new Set(["print", "range", "len", "input", "int", "str", "float", "list"]);

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "#") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      out.push({ text: src.slice(i, stop), kind: "com" });
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j++;
      const isF = i > 0 && src[i - 1] === "f";
      if (isF) {
        const last = out[out.length - 1];
        if (last && last.text.endsWith("f")) last.text = last.text.slice(0, -1);
      }
      out.push({ text: (isF ? "f" : "") + src.slice(i, Math.min(j + 1, src.length)), kind: "str" });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      const next = src[j];
      if (KEYWORDS.has(word)) out.push({ text: word, kind: "kw" });
      else if (BUILTINS.has(word) || next === "(") out.push({ text: word, kind: "fn" });
      else out.push({ text: word, kind: "plain" });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push({ text: src.slice(i, j), kind: "num" });
      i = j;
      continue;
    }
    out.push({ text: c, kind: "plain" });
    i++;
  }
  return out;
}

function classFor(kind: Tok["kind"]): string {
  switch (kind) {
    case "kw":
      return "text-[#ff7b72]";
    case "str":
      return "text-[#a5d6ff]";
    case "num":
      return "text-[#ffa657]";
    case "com":
      return "text-[#7f8aa0] italic";
    case "fn":
      return "text-[#d2a8ff]";
    default:
      return "text-[#e6edf3]";
  }
}
