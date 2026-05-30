/**
 * Tiny in-browser "machine learning" used by the Teachable Machine game.
 *
 * It is a real (if simple) classifier: a k-nearest-neighbour vote over feature
 * vectors extracted from the student's drawings. Everything here is a PURE
 * function with no DOM/IO dependency so it is trivial to unit test — the game
 * component is responsible for turning a <canvas> into the grayscale ink grid
 * that these helpers consume.
 *
 * Pipeline: canvas → grayscale ink grid (0..1) → extractFeatures (bounding-box
 * crop + downscale + L2 normalise) → classify (weighted KNN vote).
 */

/** Side length of the square feature grid (FEATURE_GRID² features per sample). */
export const FEATURE_GRID = 16;

/** A drawing the model has been told the label of. */
export interface Sample {
  label: string;
  features: number[];
}

/** One classification result, richest-first scores included for the UI bars. */
export interface Prediction {
  /** Best-guess label, or null when there is nothing to compare against. */
  label: string | null;
  /** Confidence of the winning label in 0..1 (share of the weighted vote). */
  confidence: number;
  /** Per-label confidence in 0..1, summing to ~1. Keyed by label. */
  scores: Record<string, number>;
}

export interface FeatureOptions {
  /** Output grid side length. Defaults to FEATURE_GRID. */
  grid?: number;
  /** Ink values at or below this are treated as blank. Defaults to 0.08. */
  inkThreshold?: number;
  /** Extra padding (fraction of bbox size) added around the ink. Defaults 0.12. */
  padding?: number;
}

/** True when the grayscale ink grid contains essentially no drawing. */
export function isBlank(gray: ArrayLike<number>, threshold = 0.08): boolean {
  for (let i = 0; i < gray.length; i++) {
    if (gray[i] > threshold) return false;
  }
  return true;
}

/**
 * Turns a grayscale ink grid (row-major, values 0..1 where 1 is full ink) into
 * a normalised feature vector that is robust to where/how big the student drew.
 *
 * Steps: find the ink bounding box → crop (with a little padding) → box-sample
 * down to a small square grid → L2-normalise so brightness/scale don't matter.
 */
export function extractFeatures(
  gray: ArrayLike<number>,
  width: number,
  height: number,
  opts: FeatureOptions = {}
): number[] {
  const grid = opts.grid ?? FEATURE_GRID;
  const inkThreshold = opts.inkThreshold ?? 0.08;
  const padding = opts.padding ?? 0.12;
  const out = new Array<number>(grid * grid).fill(0);

  // 1) Bounding box of the ink.
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (gray[y * width + x] > inkThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return out; // blank → all-zero vector

  // 2) Pad the box and clamp to the image.
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const padX = Math.round(bw * padding);
  const padY = Math.round(bh * padding);
  const x0 = Math.max(0, minX - padX);
  const y0 = Math.max(0, minY - padY);
  const x1 = Math.min(width - 1, maxX + padX);
  const y1 = Math.min(height - 1, maxY + padY);
  const cropW = x1 - x0 + 1;
  const cropH = y1 - y0 + 1;

  // 3) Box-sample the crop down to grid×grid by averaging each source cell.
  for (let gy = 0; gy < grid; gy++) {
    const sy0 = y0 + Math.floor((gy * cropH) / grid);
    const sy1 = y0 + Math.floor(((gy + 1) * cropH) / grid);
    for (let gx = 0; gx < grid; gx++) {
      const sx0 = x0 + Math.floor((gx * cropW) / grid);
      const sx1 = x0 + Math.floor(((gx + 1) * cropW) / grid);
      let sum = 0;
      let count = 0;
      for (let y = sy0; y < Math.max(sy0 + 1, sy1); y++) {
        for (let x = sx0; x < Math.max(sx0 + 1, sx1); x++) {
          sum += gray[y * width + x];
          count++;
        }
      }
      out[gy * grid + gx] = count > 0 ? sum / count : 0;
    }
  }

  // 4) L2-normalise so two same-shaped drawings match regardless of ink amount.
  let norm = 0;
  for (let i = 0; i < out.length; i++) norm += out[i] * out[i];
  norm = Math.sqrt(norm);
  if (norm > 1e-6) {
    for (let i = 0; i < out.length; i++) out[i] /= norm;
  }
  return out;
}

/** Squared Euclidean distance between two equal-length feature vectors. */
export function distanceSq(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i++) {
    const diff = a[i] - b[i];
    d += diff * diff;
  }
  return d;
}

/**
 * Classifies a query feature vector against labelled samples using a weighted
 * k-nearest-neighbour vote (closer neighbours count more). Returns the winning
 * label plus a normalised confidence score for every label seen in `samples`.
 */
export function classify(samples: Sample[], query: number[], k = 3): Prediction {
  const labels = Array.from(new Set(samples.map((s) => s.label)));
  const emptyScores: Record<string, number> = {};
  for (const l of labels) emptyScores[l] = 0;

  if (samples.length === 0 || query.length === 0) {
    return { label: null, confidence: 0, scores: emptyScores };
  }

  const ranked = samples
    .map((s) => ({ label: s.label, d: distanceSq(s.features, query) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(1, Math.min(k, samples.length)));

  const weights: Record<string, number> = { ...emptyScores };
  let total = 0;
  for (const r of ranked) {
    const w = 1 / (Math.sqrt(r.d) + 1e-3);
    weights[r.label] = (weights[r.label] ?? 0) + w;
    total += w;
  }

  const scores: Record<string, number> = {};
  for (const l of labels) scores[l] = total > 0 ? weights[l] / total : 0;

  let best: string | null = null;
  let bestScore = -1;
  for (const l of labels) {
    if (scores[l] > bestScore) {
      bestScore = scores[l];
      best = l;
    }
  }

  return { label: best, confidence: best ? scores[best] : 0, scores };
}
