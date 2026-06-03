"use client";

import { useState } from "react";
import Link from "next/link";
import type { LevelGuide } from "@/lib/teaching";

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[var(--color-graphite)]">
        <span aria-hidden>{emoji}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function LevelGuideCard({
  guide,
  defaultOpen = false,
}: {
  guide: LevelGuide;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { meta, facilitation, lessons } = guide;

  return (
    <div
      className="duo-card overflow-hidden p-0"
      style={{ borderColor: meta.color }}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-snow)]"
          aria-expanded={open}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${meta.color}22` }}
            aria-hidden
          >
            {meta.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-lg font-bold text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-feather)" }}
            >
              Level {meta.level} · {meta.title}
            </span>
            <span className="block truncate text-sm text-[var(--color-graphite)]">
              {meta.elementLabel} · {meta.blurb}
            </span>
          </span>
          <span className="shrink-0 text-[var(--color-graphite)]">
            {open ? "▲" : "▼"}
          </span>
        </button>
        <Link
          href={`/dashboard/present/${meta.level}`}
          className="flex shrink-0 items-center gap-1.5 border-l-2 border-[var(--color-cloud)] px-4 text-sm font-bold text-white transition hover:opacity-90"
          style={{ backgroundColor: meta.color }}
          title="Buka mode presentasi layar penuh"
        >
          ▶ Presentasi
        </Link>
      </div>

      {open && (
        <div className="border-t-2 border-[var(--color-cloud)] px-5 py-5">
          {facilitation && (
            <div className="rounded-2xl bg-[var(--color-snow)] p-4">
              <p className="text-sm font-bold text-[var(--color-charcoal)]">
                ⏱️ Pacing: {facilitation.pacing}
              </p>

              <Section title="Tujuan Belajar" emoji="🎯">
                <ul className="ml-5 list-disc space-y-1 text-sm text-[var(--color-almost-black)]">
                  {facilitation.objectives.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Catatan Fasilitator" emoji="🧑‍🏫">
                <ul className="ml-5 list-disc space-y-1 text-sm text-[var(--color-almost-black)]">
                  {facilitation.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </Section>
            </div>
          )}

          {lessons.length === 0 ? (
            <p className="mt-4 text-sm italic text-[var(--color-graphite)]">
              Belum ada materi untuk level ini.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.slug}
                  className="rounded-2xl border-2 border-[var(--color-cloud)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-[var(--color-charcoal)]">
                      {lesson.title}
                    </h3>
                    <Link
                      href={`/learn/${lesson.slug}`}
                      className="shrink-0 rounded-xl border-2 border-[var(--color-cloud)] px-3 py-1.5 text-xs font-bold text-[var(--color-sky-blue-dark)] transition hover:border-[var(--color-sky-blue)]"
                    >
                      👀 Lihat seperti siswa →
                    </Link>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-graphite)]">
                    {lesson.summary}
                  </p>
                  {lesson.estimatedMinutes != null && (
                    <p className="mt-1 text-xs text-[var(--color-graphite)]">
                      ⏳ Estimasi: {lesson.estimatedMinutes} menit
                    </p>
                  )}

                  {lesson.teacherNotes && (
                    <Section title="Pegangan Guru" emoji="📝">
                      <p className="whitespace-pre-line text-sm text-[var(--color-almost-black)]">
                        {lesson.teacherNotes}
                      </p>
                    </Section>
                  )}

                  {(lesson.answerKey.length > 0 ||
                    lesson.challengeAnswers.some(
                      (c) => c.expected.length > 0
                    )) && (
                      <Section title="Kunci Jawaban" emoji="🔑">
                        <div className="space-y-2">
                          {lesson.answerKey.map((a, i) => (
                            <div
                              key={`ak-${i}`}
                              className="rounded-xl bg-[var(--color-snow)] p-3 text-sm"
                            >
                              <span className="font-bold text-[var(--color-charcoal)]">
                                {a.ref}:
                              </span>{" "}
                              <span className="text-[var(--color-almost-black)]">
                                {a.answer}
                              </span>
                              {a.note && (
                                <p className="mt-1 text-xs text-[var(--color-graphite)]">
                                  {a.note}
                                </p>
                              )}
                            </div>
                          ))}
                          {lesson.challengeAnswers
                            .filter((c) => c.expected.length > 0)
                            .map((c) => (
                              <div
                                key={`ca-${c.id}`}
                                className="rounded-xl bg-[var(--color-snow)] p-3 text-sm"
                              >
                                <p className="font-bold text-[var(--color-charcoal)]">
                                  {c.prompt}
                                </p>
                                <p className="mt-1 text-xs text-[var(--color-graphite)]">
                                  Output yang diharapkan:
                                </p>
                                {c.expected.map((e, i) => (
                                  <pre
                                    key={i}
                                    className="mt-1 overflow-x-auto rounded-lg bg-[var(--color-almost-black)] px-3 py-2 text-xs text-white"
                                  >
                                    {e}
                                  </pre>
                                ))}
                              </div>
                            ))}
                        </div>
                      </Section>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
