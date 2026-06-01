/**
 * Builds a compact, pre-trained reference dataset for the "Quick, Draw!" game
 * from Google's public Quick, Draw! bitmap dataset.
 *
 * For each animal it Range-downloads only the first slice of the big .npy file
 * (we never need all ~100k samples), converts each 28x28 bitmap into the SAME
 * 16x16 L2-normalised feature vector the in-browser classifier uses
 * (`extractFeatures` from src/lib/ml/teachable.ts), keeps N good prototypes per
 * class, quantises them to bytes, and writes one small JSON to
 * public/datasets/quickdraw-animals.json.
 *
 * Run: npx tsx scripts/build-quickdraw.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { extractFeatures, isBlank, FEATURE_GRID } from "../src/lib/ml/teachable";

const BASE = "https://storage.googleapis.com/quickdraw_dataset/full/numpy_bitmap";

/** Animal categories (Quick, Draw! label → kid-friendly Indonesian + emoji).
 *  Chosen for distinctive doodle silhouettes so the tiny KNN can tell them
 *  apart (cat/dog/rabbit scribbles look near-identical, so we avoid mixing
 *  several four-legged mammals). */
const ANIMALS: { key: string; label: string; emoji: string }[] = [
  { key: "cat", label: "Kucing", emoji: "🐱" },
  { key: "fish", label: "Ikan", emoji: "🐟" },
  { key: "bird", label: "Burung", emoji: "🐦" },
  { key: "snake", label: "Ular", emoji: "🐍" },
  { key: "butterfly", label: "Kupu-kupu", emoji: "🦋" },
  { key: "octopus", label: "Gurita", emoji: "🐙" },
];

/** Prototypes kept per class. KNN over these powers the in-browser guess. */
const PER_CLASS = 200;
/** Raw rows scanned per class to find non-blank prototypes. */
const SCAN_ROWS = 2600;
const ROW = 28 * 28; // bytes per bitmap

async function fetchRange(url: string, start: number, end: number): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
  if (!res.ok && res.status !== 206) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

/** Parses an .npy v1/v2 header, returning data offset and row count. */
async function readNpyMeta(url: string): Promise<{ offset: number; rows: number }> {
  const head = await fetchRange(url, 0, 511);
  const magic = String.fromCharCode(...head.slice(0, 6));
  if (magic !== "\x93NUMPY") throw new Error(`Not an .npy file: ${url}`);
  const major = head[6];
  let headerLen: number;
  let dictStart: number;
  if (major <= 1) {
    headerLen = head[8] | (head[9] << 8);
    dictStart = 10;
  } else {
    headerLen = head[8] | (head[9] << 8) | (head[10] << 16) | (head[11] << 24);
    dictStart = 12;
  }
  const dict = new TextDecoder().decode(head.slice(dictStart, dictStart + headerLen));
  const shapeMatch = dict.match(/'shape':\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!shapeMatch) throw new Error(`Cannot parse shape in ${url}: ${dict}`);
  const rows = Number(shapeMatch[1]);
  return { offset: dictStart + headerLen, rows };
}

async function buildClass(key: string): Promise<number[][]> {
  const url = `${BASE}/${key}.npy`;
  const { offset, rows } = await readNpyMeta(url);
  const scan = Math.min(SCAN_ROWS, rows);
  const raw = await fetchRange(url, offset, offset + scan * ROW - 1);
  const out: number[][] = [];
  for (let r = 0; r < scan && out.length < PER_CLASS; r++) {
    const base = r * ROW;
    const gray = new Float32Array(ROW);
    for (let i = 0; i < ROW; i++) gray[i] = raw[base + i] / 255; // 255 = full ink
    if (isBlank(gray)) continue;
    out.push(extractFeatures(gray, 28, 28, { grid: FEATURE_GRID }));
  }
  return out;
}

/** Quantises an L2-normalised feature vector (values ~0..0.6) to bytes. */
function quantize(vec: number[]): number[] {
  return vec.map((v) => Math.max(0, Math.min(255, Math.round(v * 512))));
}

async function main() {
  const classes: { label: string; emoji: string; data: string }[] = [];
  for (const a of ANIMALS) {
    process.stdout.write(`  • ${a.key} (${a.label})... `);
    const protos = await buildClass(a.key);
    const bytes: number[] = [];
    for (const v of protos) bytes.push(...quantize(v));
    const b64 = Buffer.from(Uint8Array.from(bytes)).toString("base64");
    classes.push({ label: a.label, emoji: a.emoji, data: b64 });
    console.log(`${protos.length} prototipe`);
  }

  const payload = {
    grid: FEATURE_GRID,
    scale: 512,
    perClass: PER_CLASS,
    source: "Google Quick, Draw! Dataset (CC BY 4.0)",
    classes,
  };

  const dir = resolve(__dirname, "../public/datasets");
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, "quickdraw-animals.json");
  writeFileSync(file, JSON.stringify(payload));
  const kb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(0);
  console.log(`\nWrote ${file} (${kb} KB, ${classes.length} kelas)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
