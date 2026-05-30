"use client";

import { useMemo, useRef, useState } from "react";
import type { Lesson } from "@/lib/content";
import LessonContent from "@/components/lesson/LessonContent";
import LessonEditor from "@/components/editor/LessonEditor";
import MascotSvg from "@/components/MascotSvg";
import CompletionCard from "@/components/festivity/CompletionCard";
import { useSound } from "@/components/festivity/SoundProvider";
import { burstConfetti } from "@/lib/client/celebrate";

interface Props {
  lesson: Lesson;
}

/** Splits a markdown body into focused chunks at each H2/H3 heading. */
function splitIntoSteps(body: string): string[] {
  return body
    .split(/\n(?=#{2,3} )/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Presents a lesson as a guided, one-screen-at-a-time flow (Duolingo style) so
 * young learners focus on a single chunk instead of a wall of text plus an
 * editor. Material steps come first; the final step is the practice phase that
 * reveals the code editor. All steps stay mounted (hidden) so the editor and
 * Python runtime preload in the background and keep their state.
 */
export default function LessonPlayer({ lesson }: Props) {
  const sections = useMemo(() => splitIntoSteps(lesson.body), [lesson.body]);
  const hasChallenges = (lesson.challenges?.length ?? 0) > 0;

  // Each section is one step. When there are challenges, the LAST section (the
  // "🏆 …" practice intro) also reveals the code editor.
  const totalSteps = sections.length;
  const practiceStep = hasChallenges ? totalSteps - 1 : -1;

  const [step, setStep] = useState(0);
  const [mascotMood, setMascotMood] = useState<"idle" | "cheer">("idle");
  const [showComplete, setShowComplete] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play } = useSound();

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(totalSteps - 1, next));
    if (clamped > step) {
      play("advance");
      setMascotMood("cheer");
      if (cheerTimer.current) clearTimeout(cheerTimer.current);
      cheerTimer.current = setTimeout(() => setMascotMood("idle"), 800);
    }
    setStep(clamped);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const finish = () => {
    play("win");
    burstConfetti();
    setShowComplete(true);
  };

  const isPractice = (i: number) => i === practiceStep;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div ref={topRef} className="scroll-mt-6">
      {/* Progress header */}
      <div className="mb-6 flex items-center gap-3">
        <MascotSvg className="hidden h-12 w-12 shrink-0 sm:block" mood={mascotMood} />
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
            <span>
              Langkah {step + 1} dari {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-cloud)]">
            <div
              className="h-full rounded-full bg-[var(--color-duo-green)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps — only the active one is shown, the rest stay mounted but hidden */}
      {Array.from({ length: totalSteps }).map((_, i) => {
        const active = i === step;
        return (
          <div key={i} hidden={!active} aria-hidden={!active}>
            <div className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5 sm:p-7">
              {isPractice(i) ? (
                <>
                  <article className="min-w-0">
                    <LessonContent body={sections[i] ?? ""} />
                  </article>
                  <div className="mt-5">
                    <div
                      className="mb-3 text-lg text-[var(--color-duo-green-dark)]"
                      style={{ fontFamily: "var(--font-feather)" }}
                    >
                      ✍️ Sekarang giliranmu!
                    </div>
                    <LessonEditor lesson={lesson} />
                  </div>
                </>
              ) : (
                <article className="min-w-0">
                  <LessonContent body={sections[i] ?? ""} />
                </article>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--color-graphite)] disabled:opacity-40"
        >
          ← Kembali
        </button>

        {step < totalSteps - 1 ? (
          <button
            onClick={() => goTo(step + 1)}
            className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-duo-green)] px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
          >
            Lanjut →
          </button>
        ) : (
          <button
            onClick={finish}
            className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-grape)] px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-grape-dark)]"
          >
            Selesai ✓
          </button>
        )}
      </div>

      {showComplete && <CompletionCard lessonTitle={lesson.title} href="/app" />}
    </div>
  );
}
