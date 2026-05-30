"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";
import {
  classify,
  extractFeatures,
  isBlank,
  FEATURE_GRID,
  type Prediction,
  type Sample,
} from "@/lib/ml/teachable";

interface Props {
  title?: string;
  hint?: string;
  /** Minimum example drawings required per category before training. */
  minExamples?: string;
  /** Minimum number of categories required before training. */
  minCategories?: string;
  /** XP awarded once when the student finishes training and makes a guess. */
  xp?: string;
}

interface Category {
  id: number;
  name: string;
  /** Feature vectors of the example drawings the student added. */
  examples: number[][];
}

type Phase = "train" | "predict";

const CANVAS = 224;
const PALETTE = [
  "var(--color-grape)",
  "var(--color-sky-blue)",
  "var(--color-duo-green)",
  "var(--color-bubblegum)",
  "var(--color-sunshine-dark)",
];

/** Reads the canvas into a grayscale ink grid (0..1, 1 = full ink). */
function readInk(canvas: HTMLCanvasElement): {
  gray: Float32Array;
  w: number;
  h: number;
} {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width: w, height: h } = canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    // Canvas is white background + dark strokes; ink = how dark + how opaque.
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3] / 255;
    const lum = (r + g + b) / (3 * 255);
    gray[i] = (1 - lum) * a;
  }
  return { gray, w, h };
}

/**
 * "Teachable Machine" game: the student creates and names their own categories,
 * draws a few example pictures to TRAIN a tiny in-browser classifier (weighted
 * KNN over downscaled ink grids), then switches to PREDICT mode where the AI
 * guesses new drawings and shows per-category confidence bars.
 *
 * Authored as `::game{type="teachable" activityId="ai-teachable"}`.
 */
export default function TeachableMachineGame({
  title = "Latih AI-mu Sendiri",
  hint = "Buat kategori, gambar beberapa contoh untuk melatih AI, lalu uji tebakannya!",
  minExamples = "3",
  minCategories = "2",
  xp = "30",
}: Props) {
  const fb = useGameFeedback();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);

  const minEx = Math.max(1, Number(minExamples) || 3);
  const minCat = Math.max(2, Number(minCategories) || 2);

  const [phase, setPhase] = useState<Phase>("train");
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Kategori 1", examples: [] },
    { id: 2, name: "Kategori 2", examples: [] },
  ]);
  const [activeCat, setActiveCat] = useState(1);
  const [nextId, setNextId] = useState(3);
  const [training, setTraining] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [awarded, setAwarded] = useState(false);
  const [predictCount, setPredictCount] = useState(0);

  // ---- Canvas setup & drawing -------------------------------------------------
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
  }, []);

  useEffect(() => {
    // Paint the white background only after mount so SSR markup (an empty
    // <canvas>) and the first client paint agree — no hydration mismatch.
    clearCanvas();
  }, [clearCanvas]);

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointerPos(e);
    paintDot(last.current);
  }

  function paintDot(p: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();
    hasInk.current = true;
  }

  function moveDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pointerPos(e);
    if (!ctx || !last.current) return;
    ctx.strokeStyle = "#1b1b1b";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    hasInk.current = true;
  }

  function endDraw() {
    drawing.current = false;
    last.current = null;
  }

  // ---- Training ---------------------------------------------------------------
  function currentFeatures(): number[] | null {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk.current) return null;
    const { gray, w, h } = readInk(canvas);
    if (isBlank(gray)) return null;
    return extractFeatures(gray, w, h, { grid: FEATURE_GRID });
  }

  function addExample() {
    const feats = currentFeatures();
    if (!feats) {
      fb.wrong();
      return;
    }
    setCategories((cats) =>
      cats.map((c) =>
        c.id === activeCat ? { ...c, examples: [...c.examples, feats] } : c
      )
    );
    fb.correct();
    clearCanvas();
  }

  function addCategory() {
    const id = nextId;
    setNextId((n) => n + 1);
    setCategories((cats) => [
      ...cats,
      { id, name: `Kategori ${cats.length + 1}`, examples: [] },
    ]);
    setActiveCat(id);
    fb.click();
  }

  function removeCategory(id: number) {
    setCategories((cats) => {
      if (cats.length <= minCat) return cats; // keep the minimum
      const next = cats.filter((c) => c.id !== id);
      if (activeCat === id && next[0]) setActiveCat(next[0].id);
      return next;
    });
  }

  function renameCategory(id: number, name: string) {
    setCategories((cats) =>
      cats.map((c) => (c.id === id ? { ...c, name } : c))
    );
  }

  const namedCats = categories.filter((c) => c.name.trim().length > 0);
  const readyCats = namedCats.filter((c) => c.examples.length >= minEx);
  const canTrain = namedCats.length >= minCat && readyCats.length === namedCats.length;

  function train() {
    if (!canTrain) return;
    setTraining(true);
    fb.click();
    // KNN needs no real fitting; the pause just makes "training" feel real.
    window.setTimeout(() => {
      setTraining(false);
      setPhase("predict");
      setPrediction(null);
      clearCanvas();
    }, 1100);
  }

  function backToTrain() {
    setPhase("train");
    setPrediction(null);
    clearCanvas();
  }

  // ---- Prediction -------------------------------------------------------------
  function predict() {
    const feats = currentFeatures();
    if (!feats) {
      fb.wrong();
      return;
    }
    const samples: Sample[] = [];
    for (const c of categories) {
      for (const f of c.examples) samples.push({ label: c.name, features: f });
    }
    const result = classify(samples, feats, 3);
    setPrediction(result);
    const n = predictCount + 1;
    setPredictCount(n);
    if (!awarded) {
      setAwarded(true);
      fb.solved({
        xp: Number(xp) || 30,
        label: `+${xp} XP`,
        badge: { id: "pelatih-ai", label: "Pelatih AI", emoji: "🤖" },
      });
    } else {
      fb.correct();
    }
  }

  // ---- UI ---------------------------------------------------------------------
  const totalExamples = categories.reduce((s, c) => s + c.examples.length, 0);

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eef4ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🤖 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      {/* Phase indicator */}
      <div className="mb-4 flex justify-center gap-2 text-xs font-bold">
        <span
          className={`rounded-full px-3 py-1 ${
            phase === "train"
              ? "bg-[var(--color-sky-blue)] text-white"
              : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
          }`}
        >
          1 · Latih
        </span>
        <span className="text-[var(--color-silver)]">→</span>
        <span
          className={`rounded-full px-3 py-1 ${
            phase === "predict"
              ? "bg-[var(--color-duo-green)] text-white"
              : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
          }`}
        >
          2 · Tebak
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Left: drawing pad */}
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={CANVAS}
            height={CANVAS}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
            className="aspect-square w-full max-w-[240px] touch-none rounded-2xl border-2 border-[var(--color-sky-blue)] bg-white shadow-inner"
            style={{ cursor: "crosshair" }}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={clearCanvas}
              className="rounded-xl border-2 border-[var(--color-cloud)] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)] hover:border-[var(--color-sky-blue)]"
            >
              ↺ Hapus
            </button>
            {phase === "train" ? (
              <button
                onClick={addExample}
                className="rounded-xl border-2 border-[var(--color-sky-blue)] bg-[var(--color-sky-blue)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90"
              >
                ➕ Tambah ke “{categories.find((c) => c.id === activeCat)?.name ?? ""}”
              </button>
            ) : (
              <button
                onClick={predict}
                className="rounded-xl border-2 border-[var(--color-duo-green)] bg-[var(--color-duo-green)] px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90"
              >
                🔮 Tebak!
              </button>
            )}
          </div>
        </div>

        {/* Right: categories / prediction */}
        <div>
          {phase === "train" ? (
            <div className="flex flex-col gap-2">
              {categories.map((c, i) => {
                const color = PALETTE[i % PALETTE.length];
                const active = c.id === activeCat;
                const ready = c.examples.length >= minEx;
                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border-2 p-2.5 transition-colors ${
                      active
                        ? "border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light)]"
                        : "border-[var(--color-cloud)] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <input
                        value={c.name}
                        onChange={(e) => renameCategory(c.id, e.target.value)}
                        maxLength={20}
                        className="min-w-0 flex-1 rounded-lg border border-[var(--color-cloud)] bg-white px-2 py-1 text-sm font-bold text-[var(--color-almost-black)] focus:border-[var(--color-sky-blue)] focus:outline-none"
                      />
                      <button
                        onClick={() => setActiveCat(c.id)}
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          active
                            ? "bg-[var(--color-sky-blue)] text-white"
                            : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
                        }`}
                      >
                        {active ? "✏️ aktif" : "pilih"}
                      </button>
                      {categories.length > minCat && (
                        <button
                          onClick={() => removeCategory(c.id)}
                          className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--color-error)] hover:bg-[var(--color-error-light)]"
                          aria-label={`Hapus ${c.name}`}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 pl-6 text-xs font-semibold text-[var(--color-graphite)]">
                      <span>{c.examples.length} contoh</span>
                      <span className={ready ? "text-[var(--color-duo-green-dark)]" : "text-[var(--color-silver)]"}>
                        {ready ? "✓ cukup" : `(min ${minEx})`}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={addCategory}
                  className="rounded-xl border-2 border-dashed border-[var(--color-sky-blue)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-sky-blue-dark)] hover:bg-[var(--color-sky-blue-light)]"
                >
                  ➕ Kategori baru
                </button>
                <button
                  onClick={train}
                  disabled={!canTrain || training}
                  className="flex-1 rounded-xl border-2 border-[var(--color-duo-green)] bg-[var(--color-duo-green)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {training ? "🧠 Melatih…" : "🚀 Latih AI"}
                </button>
              </div>
              {!canTrain && (
                <p className="text-center text-xs font-medium text-[var(--color-graphite)]">
                  Butuh minimal {minCat} kategori, masing-masing {minEx} contoh.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="mb-1 text-center text-sm font-bold text-[var(--color-charcoal)]">
                {prediction?.label
                  ? `AI menebak: ${prediction.label} 🎯`
                  : "Gambar sesuatu lalu tekan Tebak!"}
              </div>
              {categories.map((c, i) => {
                const color = PALETTE[i % PALETTE.length];
                const score = prediction?.scores[c.name] ?? 0;
                const pct = Math.round(score * 100);
                const isBest = prediction?.label === c.name;
                return (
                  <div key={c.id}>
                    <div className="mb-0.5 flex justify-between text-xs font-bold text-[var(--color-charcoal)]">
                      <span>{c.name}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-[var(--color-cloud)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: color,
                          opacity: isBest ? 1 : 0.55,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                onClick={backToTrain}
                className="mt-2 rounded-xl border-2 border-[var(--color-cloud)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)] hover:border-[var(--color-sky-blue)]"
              >
                ← Latih lagi (tambah contoh)
              </button>
            </div>
          )}
        </div>
      </div>

      {phase === "predict" && predictCount > 0 && (
        <div className="mx-auto mt-4 max-w-[460px] rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
          🎉 Kamu berhasil melatih AI dengan {totalExamples} contoh! Coba gambar
          yang lain dan lihat apakah tebakannya tepat.
        </div>
      )}
    </div>
  );
}
