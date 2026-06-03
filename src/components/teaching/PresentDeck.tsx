"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Slide } from "@/lib/teaching";

interface Props {
  slides: Slide[];
  levelTitle: string;
  color: string;
  /** Where the "Tutup" button returns to. */
  backHref: string;
  /**
   * "presenter" → teacher screen with controls + presenter notes.
   * "audience"  → clean projected screen for students (slide only, no notes).
   */
  variant?: "presenter" | "audience";
  /** BroadcastChannel name that keeps presenter & audience screens in sync. */
  channelKey: string;
  /** URL of the clean audience screen; presenter opens it in a second window. */
  audienceHref?: string;
}

type SyncMessage = { type: "sync"; index: number } | { type: "hello" };

/** Deterministic floating decorations (fixed values avoid hydration mismatch). */
const PARTICLES = [
  { left: "8%", size: 26, duration: 17, delay: 0, emoji: "🐍" },
  { left: "20%", size: 18, duration: 22, delay: 4, emoji: "✨" },
  { left: "34%", size: 22, duration: 19, delay: 9, emoji: "⭐" },
  { left: "48%", size: 16, duration: 24, delay: 2, emoji: "💡" },
  { left: "62%", size: 24, duration: 16, delay: 6, emoji: "🎯" },
  { left: "74%", size: 19, duration: 21, delay: 11, emoji: "✨" },
  { left: "86%", size: 28, duration: 18, delay: 3, emoji: "🚀" },
  { left: "93%", size: 15, duration: 23, delay: 8, emoji: "⭐" },
];

/** Animated aurora + glowing orbs + drifting particles behind audience slides. */
function PresentBackdrop({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Drifting aurora gradient */}
      <div
        className="present-aurora absolute inset-0"
        style={{
          background: `linear-gradient(120deg, ${color}, #1a1a2e 38%, #16213e 62%, ${color})`,
        }}
      />
      {/* Soft glowing orbs for depth */}
      <div
        className="present-orb absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl"
        style={{ background: color, opacity: 0.5 }}
      />
      <div
        className="present-orb absolute right-[-6rem] bottom-4 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "#ffffff", opacity: 0.12, animationDelay: "5s" }}
      />
      <div
        className="present-orb absolute left-1/2 top-1/3 h-64 w-64 rounded-full blur-3xl"
        style={{ background: color, opacity: 0.28, animationDelay: "9s" }}
      />
      {/* Drifting emoji particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="present-drift absolute bottom-0 select-none"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

/** Renders the visible slide body, shared by presenter & audience screens. */
function SlideBody({ slide, animated = false }: { slide: Slide; animated?: boolean }) {
  // On the projected audience screen we replay cinematic entrance animations;
  // inside the small presenter preview we keep things static.
  const emojiCls = animated ? "present-emoji-in present-emoji-bob" : "";
  const titleCls = animated ? "present-rise-in" : "";
  const bodyCls = animated ? "present-rise-in" : "";
  const bodyDelay = animated ? { animationDelay: "0.12s" } : undefined;
  return (
    <div>
      <div className={`mb-6 text-7xl md:text-8xl ${emojiCls}`} aria-hidden>
        {slide.emoji}
      </div>

      {slide.kind === "cover" || slide.kind === "closing" ? (
        <>
          <p className={`text-2xl font-bold text-white/70 md:text-3xl ${titleCls}`}>
            {slide.title}
          </p>
          {slide.subtitle && (
            <h1
              className={`mt-2 text-4xl font-extrabold md:text-6xl ${bodyCls}`}
              style={{ fontFamily: "var(--font-feather)", ...bodyDelay }}
            >
              {slide.subtitle}
            </h1>
          )}
          {slide.body && (
            <p
              className={`mt-6 text-xl text-white/85 md:text-2xl ${bodyCls}`}
              style={animated ? { animationDelay: "0.24s" } : undefined}
            >
              {slide.body}
            </p>
          )}
        </>
      ) : (
        <>
          <h1
            className={`text-3xl font-extrabold md:text-5xl ${titleCls}`}
            style={{ fontFamily: "var(--font-feather)" }}
          >
            {slide.title}
          </h1>
          {slide.body && (
            <p
              className={`mt-6 text-xl leading-relaxed text-white/90 md:text-3xl ${bodyCls}`}
              style={bodyDelay}
            >
              {slide.body}
            </p>
          )}
          {slide.bullets && (
            <ul className="mx-auto mt-8 max-w-2xl space-y-4 text-left">
              {slide.bullets.map((b, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 text-xl text-white/90 md:text-2xl ${animated ? "present-item-in" : ""
                    }`}
                  style={
                    animated
                      ? { animationDelay: `${0.25 + i * 0.12}s` }
                      : undefined
                  }
                >
                  <span className="mt-1 text-2xl" aria-hidden>
                    ✅
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/** Compact slide thumbnail used inside the presenter console (not projected). */
function SlidePreview({
  slide,
  color,
  size = "md",
  animated = false,
}: {
  slide: Slide;
  color: string;
  size?: "md" | "sm";
  animated?: boolean;
}) {
  const big = size === "md";
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl text-center text-white shadow-inner"
      style={
        animated
          ? undefined
          : {
            background: `radial-gradient(circle at 30% 20%, ${color}, #1a1a2e 80%)`,
          }
      }
    >
      {animated && <PresentBackdrop color={color} />}
      <div className={`relative px-4 ${animated ? "present-rise-in" : ""}`}>
        <div
          className={`${big ? "mb-2 text-4xl" : "mb-1 text-2xl"} ${animated ? "present-emoji-in present-emoji-bob" : ""
            }`}
          aria-hidden
        >
          {slide.emoji}
        </div>
        {slide.kind === "cover" || slide.kind === "closing" ? (
          <>
            <p className={`font-bold text-white/70 ${big ? "text-sm" : "text-[11px]"}`}>
              {slide.title}
            </p>
            {slide.subtitle && (
              <p
                className={`font-extrabold ${big ? "text-xl" : "text-sm"}`}
                style={{ fontFamily: "var(--font-feather)" }}
              >
                {slide.subtitle}
              </p>
            )}
          </>
        ) : (
          <>
            <p
              className={`font-extrabold ${big ? "text-lg" : "text-sm"}`}
              style={{ fontFamily: "var(--font-feather)" }}
            >
              {slide.title}
            </p>
            {big && slide.bullets && (
              <ul className="mx-auto mt-2 max-w-xs space-y-1 text-left text-xs text-white/85">
                {slide.bullets.slice(0, 3).map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span aria-hidden>✅</span>
                    <span className="line-clamp-1">{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {big && !slide.bullets && slide.body && (
              <p className="mt-2 text-xs text-white/80 line-clamp-3">{slide.body}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PresentDeck({
  slides,
  levelTitle,
  color,
  backHref,
  variant = "presenter",
  channelKey,
  audienceHref,
}: Props) {
  const router = useRouter();
  const isAudience = variant === "audience";
  const [index, setIndex] = useState(0);
  const [showNote, setShowNote] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const indexRef = useRef(0);

  const total = slides.length;
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, total - 1)),
    [total]
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Presenter session timer (mm:ss) so the teacher can pace the class.
  useEffect(() => {
    if (isAudience) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isAudience]);

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    // Audience screens are opened in their own window by the presenter.
    if (isAudience && window.opener) {
      window.close();
      return;
    }
    router.push(backHref);
  }, [router, backHref, isAudience]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  }, []);

  const openAudience = useCallback(() => {
    if (!audienceHref) return;
    window.open(audienceHref, "funpython-layar-siswa", "width=1280,height=720");
    setAudienceOpen(true);
  }, [audienceHref]);

  // Keep presenter & audience screens in sync across windows/tabs.
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(channelKey);
    channelRef.current = ch;
    ch.onmessage = (e: MessageEvent<SyncMessage>) => {
      const data = e.data;
      if (isAudience) {
        if (data.type === "sync") setIndex(data.index);
      } else if (data.type === "hello") {
        // A newly opened audience screen asks for the current slide.
        ch.postMessage({ type: "sync", index: indexRef.current } as SyncMessage);
      }
    };
    if (isAudience) ch.postMessage({ type: "hello" } as SyncMessage);
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [channelKey, isAudience]);

  // Presenter broadcasts every slide change to the audience screen.
  useEffect(() => {
    if (isAudience) return;
    channelRef.current?.postMessage({ type: "sync", index } as SyncMessage);
  }, [index, isAudience]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      // The audience screen is driven remotely by the presenter.
      if (isAudience) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key.toLowerCase() === "n") {
        setShowNote((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, close, toggleFullscreen, isAudience]);

  const slide = slides[index];
  const nextSlide = index < total - 1 ? slides[index + 1] : null;

  // ---- Audience screen: clean slide only, no notes or controls ----
  if (isAudience) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#1a1a2e] text-white">
        <PresentBackdrop color={color} />
        <div className="relative flex flex-1 select-none flex-col items-center justify-center px-8 text-center">
          {/* key={index} re-mounts the body so entrance animations replay per slide */}
          <SlideBody key={index} slide={slide} animated />
        </div>
        {/* Slide counter, top-right, subtle */}
        <div className="absolute right-6 top-5 rounded-full bg-black/20 px-3 py-1 text-sm font-bold text-white/70 backdrop-blur-sm">
          {index + 1} / {total}
        </div>
        {/* Progress bar with a sweeping sheen */}
        <div className="relative z-10 h-2 w-full overflow-hidden bg-white/10">
          <div
            className="relative h-full overflow-hidden bg-white/80 transition-all duration-500 ease-out"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          >
            <span
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                animation: "present-progress-sheen 2.2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- Presenter console: a dashboard that looks NOTHING like the student's
  // projected slide. The teacher gets previews, notes, timer & navigation. ----
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1117] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#161922] px-5 py-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wide text-[#0f1117]"
            style={{ backgroundColor: color }}
          >
            Konsol Guru
          </span>
          <span className="truncate text-white/80">{levelTitle}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-sm tabular-nums text-white/80">
            ⏱️ {mm}:{ss}
          </span>
          {audienceHref && (
            <button
              type="button"
              onClick={openAudience}
              className="rounded-lg px-3 py-1.5 text-sm font-bold transition"
              style={{ backgroundColor: color, color: "#0f1117" }}
              title="Buka layar bersih untuk diproyeksikan ke siswa"
            >
              🖥️ {audienceOpen ? "Layar Siswa Aktif" : "Buka Layar Siswa"}
            </button>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold transition hover:bg-white/20"
            title="Layar penuh (F)"
          >
            ⛶
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold transition hover:bg-white/20"
            title="Tutup (Esc)"
          >
            ✕ Tutup
          </button>
        </div>
      </div>

      {/* Main: current slide preview + sidebar (next + notes) */}
      <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Current slide */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/50">
            <span>Sedang Tampil di Layar Siswa</span>
            <span>
              Slide {index + 1} / {total}
            </span>
          </div>
          <button
            type="button"
            onClick={next}
            className="group relative block w-full text-left"
            title="Klik untuk slide berikutnya"
          >
            <SlidePreview key={index} slide={slide} color={color} size="md" animated />
            <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/15 transition group-hover:ring-white/40" />
          </button>

          {!audienceOpen && audienceHref && (
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
              💡 Klik <span className="font-bold">Buka Layar Siswa</span> lalu
              pindahkan jendelanya ke proyektor. Siswa hanya melihat slide
              bersih — catatan & kontrol ini tetap di layarmu.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Next slide */}
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">
              ⏭️ Slide Berikutnya
            </div>
            {nextSlide ? (
              <SlidePreview slide={nextSlide} color={color} size="sm" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-white/40">
                Slide terakhir
              </div>
            )}
          </div>

          {/* Presenter notes */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/50">
              <span>🧑‍🏫 Catatan Guru</span>
              <button
                type="button"
                onClick={() => setShowNote((v) => !v)}
                className="rounded bg-white/10 px-2 py-0.5 text-[11px] hover:bg-white/20"
              >
                {showNote ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
            {showNote ? (
              slide.note ? (
                <p className="text-[15px] leading-relaxed text-white/90">
                  {slide.note}
                </p>
              ) : (
                <p className="text-sm italic text-white/40">
                  Tidak ada catatan untuk slide ini.
                </p>
              )
            ) : (
              <p className="text-sm italic text-white/40">Catatan disembunyikan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#161922] px-5 py-3">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold transition hover:bg-white/20 disabled:opacity-30"
        >
          ← Sebelumnya
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-2.5 shrink-0 rounded-full transition-all"
              style={{
                width: i === index ? 28 : 10,
                backgroundColor: i === index ? color : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={index === total - 1}
          className="rounded-xl px-6 py-2.5 text-sm font-bold text-[#0f1117] transition hover:opacity-90 disabled:opacity-30"
          style={{ backgroundColor: color }}
        >
          Berikutnya →
        </button>
      </div>
    </div>
  );
}
