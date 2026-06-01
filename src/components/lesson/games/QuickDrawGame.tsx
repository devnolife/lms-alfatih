"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /** XP awarded once on the first successful guess. */
  xp?: string;
}

interface DatasetClass {
  label: string;
  emoji: string;
  data: string; // base64 of (perClass * grid²) quantised bytes
}
interface Dataset {
  grid: number;
  scale: number;
  perClass: number;
  source: string;
  classes: DatasetClass[];
}

const CANVAS = 224;

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
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3] / 255;
    const lum = (r + g + b) / (3 * 255);
    gray[i] = (1 - lum) * a;
  }
  return { gray, w, h };
}

/** Decodes the base64 prototype payload into labelled KNN samples. */
function decodeSamples(ds: Dataset): Sample[] {
  const dim = ds.grid * ds.grid;
  const samples: Sample[] = [];
  for (const c of ds.classes) {
    const bin = atob(c.data);
    const count = Math.floor(bin.length / dim);
    for (let n = 0; n < count; n++) {
      const features = new Array<number>(dim);
      for (let i = 0; i < dim; i++) {
        features[i] = bin.charCodeAt(n * dim + i) / ds.scale;
      }
      samples.push({ label: `${c.emoji} ${c.label}`, features });
    }
  }
  return samples;
}

/**
 * "Quick, Draw!" game: a pre-trained AI guesses the animal the student draws.
 *
 * The model is a weighted KNN over reference feature vectors built offline from
 * Google's public Quick, Draw! dataset (scripts/build-quickdraw.ts →
 * public/datasets/quickdraw-animals.json). The student draws on a canvas; we
 * extract the SAME 16×16 feature vector used to build the references and vote.
 *
 * Authored as `::game{type="quickdraw" activityId="ai-quickdraw"}`.
 */
export default function QuickDrawGame({
  title = "AI Tebak Gambar Hewan",
  hint = "Gambar seekor hewan, lalu biarkan AI menebaknya! AI sudah belajar dari jutaan coretan.",
  xp = "25",
}: Props) {
  const fb = useGameFeedback();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [awarded, setAwarded] = useState(false);

  const samples = useMemo(
    () => (dataset ? decodeSamples(dataset) : []),
    [dataset]
  );
  const animals = dataset?.classes ?? [];

  useEffect(() => {
    let alive = true;
    fetch("/datasets/quickdraw-animals.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((d: Dataset) => alive && setDataset(d))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

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

  function paintDot(p: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();
    hasInk.current = true;
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointerPos(e);
    paintDot(last.current);
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

  function reset() {
    clearCanvas();
    setPrediction(null);
    fb.click();
  }

  // ---- Prediction -------------------------------------------------------------
  function guess() {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk.current) {
      fb.wrong();
      return;
    }
    const { gray, w, h } = readInk(canvas);
    if (isBlank(gray)) {
      fb.wrong();
      return;
    }
    const feats = extractFeatures(gray, w, h, { grid: FEATURE_GRID });
    const result = classify(samples, feats, 7);
    setPrediction(result);
    if (!awarded) {
      setAwarded(true);
      fb.solved({
        xp: Number(xp) || 25,
        label: `+${xp} XP`,
        badge: { id: "pelatih-ai", label: "Pelatih AI", emoji: "🤖" },
        game: "quickdraw",
        score: Math.round((result.confidence ?? 0) * 100),
        data: {
          tebakan: result.label ?? "?",
          keyakinan: `${Math.round((result.confidence ?? 0) * 100)}%`,
        },
      });
    } else {
      fb.correct();
    }
  }

  const sorted = prediction
    ? Object.entries(prediction.scores).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eef4ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🎨 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      {loadError && (
        <p className="rounded-2xl bg-[var(--color-bubblegum)]/10 p-3 text-center text-sm font-bold text-[var(--color-bubblegum)]">
          Gagal memuat data AI. Coba muat ulang halaman.
        </p>
      )}

      {/* Animals the AI knows */}
      {animals.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
          <span className="text-[var(--color-graphite)]">AI hafal:</span>
          {animals.map((a) => (
            <span
              key={a.label}
              className="rounded-full bg-white px-2 py-1 shadow-sm"
            >
              {a.emoji} {a.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        {/* Drawing pad */}
        <div className="flex flex-col items-center gap-2">
          <canvas
            ref={canvasRef}
            width={CANVAS}
            height={CANVAS}
            className="aspect-square w-[min(78vw,224px)] touch-none rounded-2xl border-2 border-[var(--color-sky-blue)] bg-white shadow-inner"
            style={{ cursor: "crosshair" }}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-full border-2 border-[var(--color-cloud)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-graphite)] transition hover:bg-[var(--color-cloud)]"
            >
              🧽 Hapus
            </button>
            <button
              type="button"
              onClick={guess}
              disabled={!dataset}
              className="rounded-full bg-[var(--color-duo-green)] px-5 py-2 text-sm font-bold text-white shadow transition hover:brightness-105 disabled:opacity-50"
            >
              🤖 Tebak!
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="w-full max-w-xs">
          {prediction && prediction.label ? (
            <>
              <div className="mb-3 rounded-2xl bg-white p-4 text-center shadow-sm">
                <div className="text-xs font-bold text-[var(--color-graphite)]">
                  AI menebak ini...
                </div>
                <div className="text-3xl">{prediction.label}</div>
                <div className="text-sm font-bold text-[var(--color-duo-green)]">
                  {Math.round(prediction.confidence * 100)}% yakin
                </div>
              </div>
              <div className="space-y-1.5">
                {sorted.map(([label, score]) => (
                  <div key={label} className="text-xs">
                    <div className="mb-0.5 flex justify-between font-bold text-[var(--color-graphite)]">
                      <span>{label}</span>
                      <span>{Math.round(score * 100)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-cloud)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-sky-blue)] transition-all"
                        style={{ width: `${Math.round(score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[var(--color-cloud)] p-6 text-center text-sm text-[var(--color-graphite)]">
              Gambar dulu seekor hewan 🐱�🐦🐍🦋🐙 lalu tekan{" "}
              <b>Tebak!</b> untuk melihat AI bekerja.
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] text-[var(--color-silver)]">
        AI ini belajar dari Google Quick, Draw! Dataset (CC BY 4.0).
      </p>
    </div>
  );
}
