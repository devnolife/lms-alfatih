"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/lib/content";
import Spinner from "@/components/ui/Spinner";
import TurtleCanvas from "@/components/lesson/TurtleCanvas";
import { usePython } from "@/hooks/usePython";
import { useSound } from "@/components/festivity/SoundProvider";
import { useReward } from "@/components/festivity/RewardProvider";
import { burstConfetti } from "@/lib/client/celebrate";
import { gradeChallenge, type TestResult } from "@/lib/python/grader";
import type { DrawCommand, RunResult } from "@/lib/python/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] flex items-center justify-center text-[var(--color-silver)] text-sm">
      Memuat editor…
    </div>
  ),
});

interface Props {
  lesson: Lesson;
  /** Called when a challenge is solved for the first time. */
  onChallengeSolved?: (challengeIndex: number) => void;
}

type OutputTab = "text" | "visual";

export default function LessonEditor({ lesson, onChallengeSolved }: Props) {
  const challenges = useMemo(() => lesson.challenges ?? [], [lesson.challenges]);
  const { status, run, preload } = usePython();
  const { play } = useSound();
  const { awardXp } = useReward();
  const router = useRouter();

  const [activeIdx, setActiveIdx] = useState(0);
  const active = challenges[activeIdx];
  const fallback = "# Tulis kode Python kamu di sini\nprint('Halo!')\n";

  const [codeByIdx, setCodeByIdx] = useState<Record<number, string>>({});
  const code = codeByIdx[activeIdx] ?? active?.starterCode ?? fallback;

  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draw, setDraw] = useState<DrawCommand[]>([]);
  const [tab, setTab] = useState<OutputTab>("text");
  const [hasRun, setHasRun] = useState(false);

  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [checking, setChecking] = useState(false);

  const busy = status === "running" || checking;
  const booting = status === "loading";

  useEffect(() => {
    preload();
  }, [preload]);

  function setCode(value: string) {
    setCodeByIdx((prev) => ({ ...prev, [activeIdx]: value }));
  }

  function selectChallenge(idx: number) {
    setActiveIdx(idx);
    setStdout("");
    setStderr("");
    setErrorMsg(null);
    setDraw([]);
    setTestResults(null);
    setHasRun(false);
    setTab("text");
  }

  function applyRunOutput(result: RunResult) {
    setStdout(result.stdout);
    setStderr(result.stderr);
    setErrorMsg(result.error);
    setDraw(result.draw);
    setHasRun(true);
    setTab(result.hadTurtle ? "visual" : "text");
  }

  async function handleRun() {
    if (busy) return;
    setTestResults(null);
    const result = await run(code);
    applyRunOutput(result);
  }

  async function handleCheck() {
    if (busy || !active) return;
    setChecking(true);
    try {
      // Show the plain run first so students see their output, then grade.
      const result = await run(code);
      applyRunOutput(result);

      // If the code itself fails or hangs, don't bother grading every test
      // (which would re-run the broken code N times).
      if (!result.ok || result.timedOut) {
        setTestResults([
          {
            passed: false,
            name: "Jalankan kode dulu",
            detail: result.error ?? "Kode gagal dijalankan.",
          },
        ]);
        play("wrong");
        return;
      }

      const grade = await gradeChallenge(run, active, code);
      setTestResults(grade.results);

      // Persist the attempt (pass or fail) for durable XP + teacher audit. The
      // server is the source of truth and idempotent for XP.
      void persistSubmission(active.id, code, grade.passed, grade.results);

      if (grade.passed) {
        play("win");
        burstConfetti();
        if (!solved.has(activeIdx)) {
          setSolved((prev) => new Set(prev).add(activeIdx));
          if (active.xpReward) awardXp(active.xpReward);
          onChallengeSolved?.(activeIdx);
        }
      } else {
        play("wrong");
      }
    } finally {
      setChecking(false);
    }
  }

  async function persistSubmission(
    challengeId: string,
    code: string,
    passed: boolean,
    results: TestResult[]
  ) {
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code, passed, results }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { xpAwarded?: number };
      // Refresh so the /app shell header re-reads the persisted XP total.
      if (data.xpAwarded && data.xpAwarded > 0) {
        router.refresh();
      }
    } catch {
      // Network failure is non-fatal: the in-page celebration already happened.
    }
  }

  const earnedXp = useMemo(
    () => [...solved].reduce((sum, i) => sum + (challenges[i]?.xpReward ?? 0), 0),
    [solved, challenges]
  );
  const totalXp = useMemo(
    () => challenges.reduce((sum, c) => sum + (c.xpReward ?? 0), 0),
    [challenges]
  );

  const hasVisual = draw.length > 0;

  return (
    <div className="bg-white border-[3px] border-[var(--color-almost-black)] rounded-3xl overflow-hidden shadow-[0_8px_0_var(--color-almost-black)]">
      {challenges.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-4 pt-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {challenges.map((c, i) => (
              <button
                key={c.id ?? i}
                onClick={() => selectChallenge(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border-2 inline-flex items-center gap-1 ${
                  i === activeIdx
                    ? "bg-[var(--color-duo-green)] text-white border-[var(--color-duo-green-dark)]"
                    : "bg-white text-[var(--color-graphite)] border-[var(--color-cloud)]"
                }`}
              >
                {solved.has(i) && <span aria-hidden>✓</span>}
                Tantangan {i + 1}
              </button>
            ))}
          </div>
          {totalXp > 0 && (
            <span className="text-xs font-bold text-[var(--color-sunshine-dark)]">
              ⭐ {earnedXp}/{totalXp} XP
            </span>
          )}
        </div>
      )}

      {active && (
        <div className="px-5 pt-4 pb-2 text-sm text-[var(--color-charcoal)]">
          <strong>Tantangan:</strong> {active.prompt}
        </div>
      )}

      <div className="border-y-2 border-[var(--color-cloud)]">
        <MonacoEditor
          height="320px"
          defaultLanguage="python"
          path={`challenge-${activeIdx}.py`}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            automaticLayout: true,
          }}
          theme="vs-light"
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-5 py-3 bg-[var(--color-duo-green-light)] flex-wrap">
        <span className="text-xs uppercase tracking-wide text-[var(--color-charcoal)] inline-flex items-center gap-2">
          {booting && <Spinner size={14} />}
          {booting ? "Menyiapkan Python…" : `Python · ${lesson.title}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={busy}
            aria-busy={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--color-sky-blue-dark)] text-sm font-bold uppercase tracking-wide bg-white border-2 border-[var(--color-cloud)] hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? <Spinner size={16} /> : <span aria-hidden>▶</span>}
            {busy ? "Jalan…" : "Run"}
          </button>
          {active?.tests?.length ? (
            <button
              onClick={handleCheck}
              disabled={busy}
              aria-busy={busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold uppercase tracking-wide bg-[var(--color-duo-green)] shadow-[0_3px_0_var(--color-duo-green-dark)] hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? <Spinner size={16} /> : <span aria-hidden>✓</span>}
              Periksa
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 pt-3">
        <button
          onClick={() => setTab("text")}
          className={`px-3 py-1 rounded-t-lg text-xs font-bold uppercase tracking-wide ${
            tab === "text"
              ? "bg-[var(--color-almost-black)] text-white"
              : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
          }`}
        >
          Output
        </button>
        {hasVisual && (
          <button
            onClick={() => setTab("visual")}
            className={`px-3 py-1 rounded-t-lg text-xs font-bold uppercase tracking-wide ${
              tab === "visual"
                ? "bg-[var(--color-almost-black)] text-white"
                : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
            }`}
          >
            🎨 Visual
          </button>
        )}
      </div>

      <div className="px-5 pb-2">
        {tab === "visual" && hasVisual ? (
          <div className="h-[280px] rounded-xl border-2 border-[var(--color-cloud)] bg-white">
            <TurtleCanvas commands={draw} />
          </div>
        ) : (
          <pre className="px-4 py-4 text-sm whitespace-pre-wrap text-[var(--color-almost-black)] min-h-[80px] rounded-xl bg-[#f7f7f7] border-2 border-[var(--color-cloud)] overflow-auto max-h-[280px]">
            {errorMsg ? (
              <span className="text-[var(--color-error)]">⚠ {errorMsg}</span>
            ) : stdout || stderr ? (
              <>
                {stdout}
                {stderr && (
                  <span className="text-[var(--color-error)]">{stderr}</span>
                )}
              </>
            ) : hasRun ? (
              <span className="text-[var(--color-silver)]">(tidak ada output)</span>
            ) : (
              <span className="text-[var(--color-silver)]">
                Output akan tampil di sini setelah kamu menjalankan kode.
              </span>
            )}
          </pre>
        )}
      </div>

      {testResults && (
        <div className="px-5 pb-5 space-y-2">
          {testResults.every((r) => r.passed) ? (
            <div className="rounded-xl bg-[var(--color-duo-green-light)] border-2 border-[var(--color-duo-green)] px-4 py-3 text-sm font-bold text-[var(--color-duo-green-dark)]">
              🎉 Hebat! Semua tes lulus.{" "}
              {active?.xpReward ? `+${active.xpReward} XP` : ""}
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-xl border-2 px-4 py-2 text-sm ${
                    r.passed
                      ? "bg-[var(--color-duo-green-light)] border-[var(--color-duo-green)] text-[var(--color-duo-green-dark)]"
                      : "bg-[var(--color-error-light)] border-[var(--color-error)] text-[var(--color-error)]"
                  }`}
                >
                  <div className="font-bold">
                    {r.passed ? "✓" : "✗"} {r.name}
                  </div>
                  {!r.passed && r.detail && (
                    <pre className="mt-1 whitespace-pre-wrap text-xs opacity-90">
                      {r.detail}
                    </pre>
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
