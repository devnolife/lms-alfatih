"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";
import { usePython } from "@/hooks/usePython";
import Spinner from "@/components/ui/Spinner";
import {
  SEED_EXAMPLES,
  explainClues,
  predictCode,
  type CodeExample,
  type CodeLabel,
} from "@/lib/ml/codeguard";

interface Props {
  title?: string;
  hint?: string;
  /** XP awarded once the student trains + tests + verifies a guess. */
  xp?: string;
}

type Phase = "train" | "play";

const TRY_SNIPPETS = [
  'print("Aku suka Python")',
  'for i in range(3)\n    print(i)',
  'umur = 12\nprint(Umur)', // NameError: model can't see this → teaching moment
  'print("Halo"',
];

/**
 * "Detektif Error" — a classification lab. The student trains a tiny KNN model
 * on labelled code examples, then types/picks new code; the model predicts
 * "AKAN ERROR" vs "AMAN" with confidence, showing WHICH clues it used. Finally
 * the student runs the code for real (Pyodide) and compares — sometimes the AI
 * is wrong (e.g. an undefined variable), which is the whole point.
 */
export default function ErrorDetectiveGame({ title, hint, xp }: Props) {
  const xpReward = Number(xp ?? 20) || 20;
  const { click, correct, solved } = useGameFeedback();
  const { run, status, preload } = usePython();

  const [phase, setPhase] = useState<Phase>("train");
  const [examples, setExamples] = useState<CodeExample[]>(SEED_EXAMPLES);
  const [trained, setTrained] = useState(false);

  // Add-your-own example (the "campuran" dataset).
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState<CodeLabel>("aman");

  const [code, setCode] = useState(TRY_SNIPPETS[0]);
  const prediction = useMemo(
    () => (trained ? predictCode(examples, code) : null),
    [trained, examples, code]
  );
  const clues = useMemo(() => explainClues(code), [code]);

  const [realResult, setRealResult] = useState<null | { ok: boolean; msg: string }>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [scored, setScored] = useState(false);

  const counts = useMemo(() => {
    let aman = 0;
    let error = 0;
    for (const e of examples) e.label === "aman" ? aman++ : error++;
    return { aman, error };
  }, [examples]);

  function addExample() {
    const c = newCode.trim();
    if (!c) return;
    click();
    setExamples((prev) => [...prev, { code: c, label: newLabel }]);
    setNewCode("");
    setTrained(false);
  }

  function train() {
    correct({ xp: 0 });
    setTrained(true);
    setPhase("play");
    preload();
  }

  function pick(snippet: string) {
    click();
    setCode(snippet);
    setRealResult(null);
  }

  async function verify() {
    if (busy) return;
    setBusy(true);
    setRealResult(null);
    try {
      const result = await run(code);
      const ok = result.ok && !result.timedOut;
      setRealResult({
        ok,
        msg: ok
          ? result.stdout.trim() || "(kode jalan tanpa error)"
          : result.error ?? "Kode error.",
      });
      // Reward the first complete train → predict → verify cycle.
      if (!scored) {
        setScored(true);
        const data: Record<string, unknown> = {};
        examples.forEach((e, i) => {
          data[`contoh ${i + 1}`] = `${e.label}: ${e.code}`;
        });
        solved({
          xp: xpReward,
          label: "Detektif Error",
          game: "errorguard",
          data,
        });
      } else {
        correct({ xp: 0 });
      }
    } finally {
      setBusy(false);
    }
  }

  const predLabel = prediction?.label as CodeLabel | null | undefined;
  const predConf = prediction ? Math.round(prediction.confidence * 100) : 0;
  const agreement =
    realResult && predLabel
      ? (predLabel === "error") === !realResult.ok
      : null;

  return (
    <div className="rounded-3xl border-[3px] border-[var(--color-almost-black)] bg-white p-5 shadow-[0_8px_0_var(--color-almost-black)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🕵️
        </span>
        <div>
          <h3 className="text-base font-bold text-[var(--color-almost-black)]">
            {title ?? "Detektif Error"}
          </h3>
          {hint && (
            <p className="text-xs text-[var(--color-graphite)]">{hint}</p>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-4 flex gap-2 text-xs font-bold uppercase tracking-wide">
        <span
          className={`rounded-full px-3 py-1 ${phase === "train"
            ? "bg-[var(--color-grape)] text-white"
            : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
            }`}
        >
          1 · Latih
        </span>
        <span
          className={`rounded-full px-3 py-1 ${phase === "play"
            ? "bg-[var(--color-grape)] text-white"
            : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
            }`}
        >
          2 · Tebak & Buktikan
        </span>
      </div>

      {phase === "train" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-charcoal)]">
            Model belajar dari{" "}
            <strong>{examples.length} contoh</strong> ({counts.aman} aman,{" "}
            {counts.error} error). Kamu boleh menambah contohmu sendiri, lalu
            tekan <strong>Latih AI</strong>.
          </p>

          <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-xl border-2 border-[var(--color-cloud)] p-2">
            {examples.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-snow,#fafafa)] px-2 py-1"
              >
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${e.label === "aman"
                    ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                    : "bg-[var(--color-error-light)] text-[var(--color-error)]"
                    }`}
                >
                  {e.label}
                </span>
                <code className="truncate text-xs text-[var(--color-charcoal)]">
                  {e.code.replace(/\n/g, " ⏎ ")}
                </code>
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-dashed border-[var(--color-cloud)] p-3">
            <label className="mb-1 block text-xs font-bold text-[var(--color-graphite)]">
              Tambah contohmu sendiri
            </label>
            <textarea
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              rows={2}
              placeholder={'mis. print("hai")'}
              className="w-full rounded-lg border-2 border-[var(--color-cloud)] px-2 py-1.5 font-mono text-xs outline-none focus:border-[var(--color-grape)]"
            />
            <div className="mt-2 flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border-2 border-[var(--color-cloud)] text-xs font-bold">
                <button
                  onClick={() => setNewLabel("aman")}
                  className={`px-3 py-1 ${newLabel === "aman"
                    ? "bg-[var(--color-duo-green)] text-white"
                    : "text-[var(--color-graphite)]"
                    }`}
                >
                  Aman
                </button>
                <button
                  onClick={() => setNewLabel("error")}
                  className={`px-3 py-1 ${newLabel === "error"
                    ? "bg-[var(--color-error)] text-white"
                    : "text-[var(--color-graphite)]"
                    }`}
                >
                  Error
                </button>
              </div>
              <button
                onClick={addExample}
                disabled={!newCode.trim()}
                className="rounded-lg bg-[var(--color-sky-blue)] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
              >
                + Tambah
              </button>
            </div>
          </div>

          <button
            onClick={train}
            className="btn-3d w-full rounded-2xl bg-[var(--color-grape)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-grape-dark)]"
          >
            🚀 Latih AI
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--color-graphite)]">
              Tulis / pilih kode untuk ditebak AI
            </label>
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setRealResult(null);
              }}
              rows={3}
              className="w-full rounded-lg border-2 border-[var(--color-cloud)] px-2 py-1.5 font-mono text-xs outline-none focus:border-[var(--color-grape)]"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TRY_SNIPPETS.map((s) => (
                <button
                  key={s}
                  onClick={() => pick(s)}
                  className="rounded-full border-2 border-[var(--color-cloud)] px-2 py-0.5 text-[10px] font-mono text-[var(--color-graphite)] hover:border-[var(--color-grape)]"
                >
                  {s.split("\n")[0].slice(0, 18)}…
                </button>
              ))}
            </div>
          </div>

          {/* Prediction */}
          {prediction && predLabel && (
            <div
              className={`rounded-2xl border-2 px-4 py-3 ${predLabel === "error"
                ? "border-[var(--color-error)] bg-[var(--color-error-light)]"
                : "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)]"
                }`}
            >
              <div className="text-sm font-bold text-[var(--color-almost-black)]">
                🔮 Tebakan AI:{" "}
                {predLabel === "error" ? "AKAN ERROR ⚠️" : "AMAN ✅"}{" "}
                <span className="font-normal text-[var(--color-graphite)]">
                  (yakin {predConf}%)
                </span>
              </div>
              <ul className="mt-2 grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                {clues.map((c) => (
                  <li
                    key={c.key}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-charcoal)]"
                  >
                    <span aria-hidden>{c.ok ? "✅" : "❌"}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={verify}
            disabled={busy}
            className="btn-3d inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-duo-green)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)] disabled:opacity-60"
          >
            {busy ? <Spinner size={16} /> : <span aria-hidden>▶</span>}
            {status === "loading"
              ? "Menyiapkan Python…"
              : busy
                ? "Menjalankan…"
                : "Jalankan & Buktikan"}
          </button>

          {realResult && (
            <div className="space-y-2">
              <div
                className={`rounded-2xl border-2 px-4 py-3 text-sm ${realResult.ok
                  ? "border-[var(--color-duo-green)] bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                  : "border-[var(--color-error)] bg-[var(--color-error-light)] text-[var(--color-error)]"
                  }`}
              >
                <div className="font-bold">
                  🐍 Hasil sungguhan:{" "}
                  {realResult.ok ? "BERHASIL ✅" : "ERROR ⚠️"}
                </div>
                <pre className="mt-1 whitespace-pre-wrap text-xs opacity-90">
                  {realResult.msg}
                </pre>
              </div>

              {agreement !== null && (
                <div
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${agreement
                    ? "bg-[var(--color-grape-light,#f3edff)] text-[var(--color-grape)]"
                    : "bg-[var(--color-sunshine-light,#fff6d6)] text-[var(--color-sunshine-dark)]"
                    }`}
                >
                  {agreement
                    ? "🎯 Tebakan AI cocok dengan hasil sungguhan!"
                    : "🤔 AI meleset! Komputer hanya melihat 'petunjuk' bentuk kode — ia tak tahu isi sebenarnya. Inilah kenapa AI bisa salah."}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setPhase("train");
              setRealResult(null);
            }}
            className="text-xs font-bold text-[var(--color-grape)] underline"
          >
            ← Kembali melatih
          </button>
        </div>
      )}
    </div>
  );
}
