"use client";

import { useEffect, useRef, useState } from "react";
import { useAiChat } from "@/hooks/useAiChat";
import Spinner from "@/components/ui/Spinner";
import LottiePlayer from "@/components/ui/LottiePlayer";

interface Props {
  /** Lesson slug for grounding the tutor's answers. */
  lessonSlug?: string;
  /** Friendly lesson title shown in the panel header. */
  lessonTitle?: string;
}

const STARTERS = [
  "Aku belum paham bagian ini 🤔",
  "Beri aku petunjuk dong",
  "Apa itu variabel?",
];

/**
 * Floating AI tutor ("Pyo"). A bubble button bottom-right opens a chat panel
 * that streams Socratic hints from the local model. Designed to sit at the
 * lesson level so it has the lesson context without cluttering the editor.
 */
export default function AiTutorPanel({ lessonSlug, lessonTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, streaming, error, send, reset } = useAiChat({
    endpoint: "/api/ai/tutor",
    lessonSlug,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;
    setInput("");
    void send(value);
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Tutup tutor AI" : "Buka tutor AI"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-grape)] text-2xl text-white shadow-[0_6px_0_var(--color-grape-dark,#5b3a9e)] transition-transform hover:scale-105 active:translate-y-0.5 active:shadow-[0_3px_0_var(--color-grape-dark,#5b3a9e)]"
      >
        {open ? (
          "✕"
        ) : (
          <LottiePlayer
            src="/lottie/robot.json"
            className="h-11 w-11"
            fallback={<span className="text-2xl">🤖</span>}
          />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-3 left-3 z-40 mx-auto flex h-[68dvh] max-h-[560px] w-auto max-w-[380px] flex-col overflow-hidden rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-white shadow-[0_10px_0_var(--color-almost-black)] sm:left-auto sm:right-5 sm:w-[min(92vw,380px)]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[var(--color-grape)] px-4 py-3 text-white">
            <span className="text-2xl" aria-hidden>
              <LottiePlayer
                src="/lottie/robot.json"
                className="h-8 w-8"
                fallback={<span>🤖</span>}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold leading-tight">Pyo · Tutor AI</div>
              <div className="truncate text-xs opacity-90">
                {lessonTitle ? lessonTitle : "Tanya apa saja soal pelajaran"}
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={reset}
                className="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold hover:bg-white/30"
              >
                Reset
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-snow,#fafafa)] px-3 py-4"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="rounded-2xl bg-white px-3 py-2 text-sm text-[var(--color-charcoal)] shadow-sm">
                  Hai! Aku <strong>Pyo</strong> 👋 Aku bantu kamu belajar dengan
                  petunjuk, bukan jawaban langsung. Mau mulai dari mana?
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-full border-2 border-[var(--color-grape)] px-3 py-1 text-xs font-bold text-[var(--color-grape)] hover:bg-[var(--color-grape)] hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === "user"
                    ? "bg-[var(--color-grape)] text-white"
                    : "bg-white text-[var(--color-charcoal)] shadow-sm"
                    }`}
                >
                  {m.content || (
                    <span className="inline-flex items-center gap-2 text-[var(--color-silver)]">
                      <Spinner size={14} /> Pyo sedang berpikir…
                    </span>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <p className="rounded-xl bg-[var(--color-error-light,#fde8e8)] px-3 py-2 text-xs font-bold text-[var(--color-error)]">
                {error}
              </p>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 border-t-2 border-[var(--color-cloud)] bg-white px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaanmu…"
              disabled={streaming}
              className="min-w-0 flex-1 rounded-xl border-2 border-[var(--color-cloud)] px-3 py-2.5 text-base outline-none focus:border-[var(--color-grape)] disabled:opacity-60 sm:text-sm"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-grape)] text-white disabled:opacity-50"
              aria-label="Kirim"
            >
              {streaming ? <Spinner size={16} /> : <span aria-hidden>➤</span>}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
