"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import useAutoStepper from "@/hooks/useAutoStepper";
import { CONCEPT_SVGS } from "@/components/lesson/svg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

interface Props {
  /** Key into the concept SVG registry, e.g. "variable". */
  visual?: string;
  /** Heading shown above the animation. */
  title?: string;
  children?: ReactNode;
  /** Extra string attributes forwarded to the SVG (e.g. name, value). */
  [key: string]: string | ReactNode | undefined;
}

/**
 * Plays a hand-made concept animation first, then reveals the wrapped lesson
 * text & code once the animation finishes. Authored in markdown as:
 *   :::reveal{visual="variable" title="Apa itu Variabel?"}
 *   ...penjelasan + kode...
 *   :::
 */
export default function ConceptReveal({
  visual,
  title,
  children,
  ...rest
}: Props) {
  const entry = visual ? CONCEPT_SVGS[visual] : undefined;
  const [skipped, setSkipped] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const { value, done, playing, pause, reset } = useAutoStepper(
    entry?.maxPhase ?? 0,
    { intervalMs: 2600, loop: false }
  );

  // Unknown visual key: fail safe by rendering the content directly.
  if (!entry) return <>{children}</>;

  const { Component, maxPhase, captions } = entry;
  const forceDone = skipped || reducedMotion;
  const phase = forceDone ? maxPhase : value;
  const revealed = forceDone || done;

  const svgProps = rest as Record<string, string | undefined>;

  const skip = () => {
    setSkipped(true);
    pause();
  };

  const replay = () => {
    setSkipped(false);
    reset();
  };

  return (
    <div className="not-prose my-6">
      {/* Animation stage */}
      <div className="rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#faf7ff] to-white p-5">
        {title && (
          <div
            className="mb-2 text-center text-lg text-[var(--color-grape-dark)]"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            {title}
          </div>
        )}

        <Component phase={phase} {...svgProps} />

        <p className="mt-3 min-h-[40px] text-center text-sm font-medium text-[var(--color-charcoal)]">
          {captions[phase] ?? captions[captions.length - 1]}
        </p>

        {/* Phase dots */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {Array.from({ length: maxPhase + 1 }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i <= phase
                  ? "bg-[var(--color-grape)]"
                  : "bg-[var(--color-cloud)]"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {!revealed ? (
            <button
              onClick={skip}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--color-cloud)] px-4 py-1.5 text-sm font-bold text-[var(--color-graphite)]"
            >
              Lewati ▸
            </button>
          ) : (
            <button
              onClick={replay}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-grape)] px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_3px_0_var(--color-grape-dark)]"
            >
              ↻ Ulang animasi
            </button>
          )}
          {!revealed && (
            <span className="text-xs font-bold text-[var(--color-silver)]">
              {playing ? "menonton…" : "dijeda"}
            </span>
          )}
        </div>
      </div>

      {/* Revealed lesson content */}
      <div
        aria-hidden={!revealed}
        className={`grid transition-all duration-700 ease-out ${
          revealed
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-2xl border-2 border-dashed border-[var(--color-grape)]/40 bg-white px-4 py-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
