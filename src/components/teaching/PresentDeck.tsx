"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Slide } from "@/lib/teaching";

interface Props {
  slides: Slide[];
  levelTitle: string;
  color: string;
  /** Where the "Tutup" button returns to. */
  backHref: string;
}

export default function PresentDeck({
  slides,
  levelTitle,
  color,
  backHref,
}: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [showNote, setShowNote] = useState(true);

  const total = slides.length;
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, total - 1)),
    [total]
  );
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    router.push(backHref);
  }, [router, backHref]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        close();
      } else if (e.key.toLowerCase() === "n") {
        setShowNote((v) => !v);
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, close]);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  }

  const slide = slides[index];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white"
      style={{
        background: `radial-gradient(circle at 30% 20%, ${color}, #1a1a2e 80%)`,
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 text-sm font-bold text-white/80">
        <span className="truncate">🐍 {levelTitle}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNote((v) => !v)}
            className="rounded-lg bg-white/15 px-3 py-1.5 transition hover:bg-white/25"
            title="Tampilkan/sembunyikan catatan guru (N)"
          >
            {showNote ? "🙈 Catatan" : "👁️ Catatan"}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/15 px-3 py-1.5 transition hover:bg-white/25"
            title="Layar penuh (F)"
          >
            ⛶ Layar Penuh
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-lg bg-white/15 px-3 py-1.5 transition hover:bg-white/25"
            title="Tutup (Esc)"
          >
            ✕ Tutup
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div
        className="flex flex-1 cursor-pointer select-none flex-col items-center justify-center px-8 text-center"
        onClick={next}
      >
        <div className="max-w-4xl">
          <div className="mb-6 text-7xl md:text-8xl" aria-hidden>
            {slide.emoji}
          </div>

          {slide.kind === "cover" || slide.kind === "closing" ? (
            <>
              <p className="text-2xl font-bold text-white/70 md:text-3xl">
                {slide.title}
              </p>
              {slide.subtitle && (
                <h1
                  className="mt-2 text-4xl font-extrabold md:text-6xl"
                  style={{ fontFamily: "var(--font-feather)" }}
                >
                  {slide.subtitle}
                </h1>
              )}
              {slide.body && (
                <p className="mt-6 text-xl text-white/85 md:text-2xl">
                  {slide.body}
                </p>
              )}
            </>
          ) : (
            <>
              <h1
                className="text-3xl font-extrabold md:text-5xl"
                style={{ fontFamily: "var(--font-feather)" }}
              >
                {slide.title}
              </h1>
              {slide.body && (
                <p className="mt-6 text-xl leading-relaxed text-white/90 md:text-3xl">
                  {slide.body}
                </p>
              )}
              {slide.bullets && (
                <ul className="mx-auto mt-8 max-w-2xl space-y-4 text-left">
                  {slide.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-xl text-white/90 md:text-2xl"
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
      </div>

      {/* Presenter note */}
      {showNote && slide.note && (
        <div className="mx-auto mb-2 max-w-3xl rounded-2xl bg-black/30 px-5 py-3 text-center text-sm text-white/80 backdrop-blur">
          <span className="font-bold text-white/90">🧑‍🏫 Catatan guru: </span>
          {slide.note}
        </div>
      )}

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="rounded-xl bg-white/15 px-4 py-2 font-bold transition hover:bg-white/25 disabled:opacity-30"
        >
          ← Sebelumnya
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === index ? 28 : 10,
                backgroundColor:
                  i === index ? "white" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={index === total - 1}
          className="rounded-xl bg-white px-4 py-2 font-bold text-[var(--color-charcoal)] transition hover:opacity-90 disabled:opacity-30"
        >
          Berikutnya →
        </button>
      </div>
    </div>
  );
}
