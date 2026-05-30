"use client";

import { useMemo, useRef, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

type Dir = 0 | 1 | 2 | 3; // 0 up, 1 right, 2 down, 3 left
type Block = "forward" | "left" | "right";

interface Cell {
  r: number;
  c: number;
}

interface Frame {
  r: number;
  c: number;
  dir: Dir;
  active: number; // index of block being run (-1 = start)
  crash: boolean;
}

interface Props {
  /** Rows separated by "/", cells are chars: S start, G goal, # wall, . open. */
  grid?: string;
  /** Starting facing: up | right | down | left. */
  dir?: string;
  /** Set "true" to show the "Ulangi semua langkah" repeat control. */
  loop?: string;
  title?: string;
  hint?: string;
}

const VECT: Record<Dir, { dr: number; dc: number }> = {
  0: { dr: -1, dc: 0 },
  1: { dr: 0, dc: 1 },
  2: { dr: 1, dc: 0 },
  3: { dr: 0, dc: -1 },
};

const DIR_INDEX: Record<string, Dir> = { up: 0, right: 1, down: 2, left: 3 };

const BLOCK_META: Record<
  Block,
  { label: string; icon: string; color: string; shadow: string }
> = {
  forward: {
    label: "Maju",
    icon: "⬆",
    color: "var(--color-sky-blue)",
    shadow: "var(--color-sky-blue-dark)",
  },
  left: {
    label: "Putar Kiri",
    icon: "↺",
    color: "var(--color-grape)",
    shadow: "var(--color-grape-dark)",
  },
  right: {
    label: "Putar Kanan",
    icon: "↻",
    color: "var(--color-sunshine)",
    shadow: "var(--color-sunshine-dark)",
  },
};

const CELL = 52;

function parseGrid(raw: string) {
  const rows = raw.split("/").map((r) => r.trim());
  let start: Cell = { r: 0, c: 0 };
  let goal: Cell = { r: 0, c: 0 };
  const walls: boolean[][] = [];
  rows.forEach((row, r) => {
    walls[r] = [];
    [...row].forEach((ch, c) => {
      walls[r][c] = ch === "#";
      if (ch === "S") start = { r, c };
      if (ch === "G") goal = { r, c };
    });
  });
  return { rows, start, goal, walls };
}

/**
 * Block-based mini-game: students stack movement blocks (Maju / Putar Kiri /
 * Putar Kanan) to guide a turtle across a small grid to its food. No typing —
 * it previews `turtle.forward()` / `turtle.left()` visually and teaches
 * sequencing. Authored as `::game{type="maze" grid="S../.#./..G" dir="right"}`.
 */
export default function MazeGame({
  grid = "S./.G",
  dir = "right",
  loop,
  title = "Pandu Si Kura-kura",
  hint = "Susun blok agar kura-kura sampai ke daun 🥬",
}: Props) {
  const { rows, start, goal, walls } = useMemo(() => parseGrid(grid), [grid]);
  const startDir = DIR_INDEX[dir] ?? 1;
  const cols = Math.max(...rows.map((r) => r.length));
  const loopEnabled = loop === "true";

  const [program, setProgram] = useState<Block[]>([]);
  const [repeat, setRepeat] = useState(1);
  const [display, setDisplay] = useState<{ r: number; c: number; dir: Dir }>({
    ...start,
    dir: startDir,
  });
  const [activeBlock, setActiveBlock] = useState(-1);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "fail">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fb = useGameFeedback();
  const solvedRef = useRef(false);

  const reset = (clearProgram = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
    setActiveBlock(-1);
    setStatus("idle");
    setDisplay({ ...start, dir: startDir });
    if (clearProgram) setProgram([]);
  };

  const addBlock = (b: Block) => {
    if (running) return;
    if (status !== "idle") reset();
    fb.click();
    setProgram((p) => [...p, b]);
  };

  const removeBlock = (index: number) => {
    if (running) return;
    if (status !== "idle") reset();
    setProgram((p) => p.filter((_, i) => i !== index));
  };

  const buildFrames = (): { frames: Frame[]; success: boolean } => {
    const frames: Frame[] = [
      { r: start.r, c: start.c, dir: startDir, active: -1, crash: false },
    ];
    let r = start.r;
    let c = start.c;
    let d: Dir = startDir;
    let crashed = false;
    const cycles = loopEnabled ? Math.max(1, repeat) : 1;
    for (let rep = 0; rep < cycles && !crashed; rep++) {
      program.forEach((b, i) => {
        if (crashed) return;
        if (b === "left") d = ((d + 3) % 4) as Dir;
        else if (b === "right") d = ((d + 1) % 4) as Dir;
        else {
          const nr = r + VECT[d].dr;
          const nc = c + VECT[d].dc;
          const off =
            nr < 0 ||
            nc < 0 ||
            nr >= rows.length ||
            nc >= cols ||
            walls[nr]?.[nc];
          if (off) {
            crashed = true;
            frames.push({ r, c, dir: d, active: i, crash: true });
            return;
          }
          r = nr;
          c = nc;
        }
        frames.push({ r, c, dir: d, active: i, crash: false });
      });
    }
    const success = !crashed && r === goal.r && c === goal.c;
    return { frames, success };
  };

  const run = () => {
    if (running || program.length === 0) return;
    reset();
    const { frames, success } = buildFrames();
    setRunning(true);
    setStatus("idle");
    let i = 0;
    setDisplay({ r: frames[0].r, c: frames[0].c, dir: frames[0].dir });
    timerRef.current = setInterval(() => {
      i += 1;
      if (i >= frames.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setRunning(false);
        setActiveBlock(-1);
        setStatus(success ? "success" : "fail");
        if (success) {
          if (!solvedRef.current) {
            solvedRef.current = true;
            fb.solved({
              xp: 20,
              badge: {
                id: "blok-master",
                emoji: "🧩",
                label: "Jago Blok!",
              },
            });
          } else {
            fb.solved();
          }
        } else {
          fb.wrong();
        }
        return;
      }
      const f = frames[i];
      setDisplay({ r: f.r, c: f.c, dir: f.dir });
      setActiveBlock(f.active);
    }, 650);
  };

  const markerLeft = display.c * CELL + CELL / 2;
  const markerTop = display.r * CELL + CELL / 2;

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#f4fff0] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-duo-green-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🎮 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
        {/* Grid */}
        <div
          className="relative shrink-0 rounded-2xl bg-[var(--color-duo-green-light)] p-2"
          style={{ width: cols * CELL + 16, height: rows.length * CELL + 16 }}
        >
          <div
            className="relative"
            style={{ width: cols * CELL, height: rows.length * CELL }}
          >
            {rows.map((row, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const ch = row[c] ?? ".";
                const isWall = ch === "#";
                const isGoal = r === goal.r && c === goal.c;
                const isStart = r === start.r && c === start.c;
                return (
                  <div
                    key={`${r}-${c}`}
                    className="absolute flex items-center justify-center rounded-lg border border-white/70 text-2xl"
                    style={{
                      left: c * CELL,
                      top: r * CELL,
                      width: CELL,
                      height: CELL,
                      background: isWall
                        ? "var(--color-graphite)"
                        : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {isGoal && "🥬"}
                    {isStart && !isGoal && (
                      <span className="text-xs font-bold text-[var(--color-duo-green-dark)]">
                        MULAI
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* Turtle marker */}
            <div
              className="pointer-events-none absolute z-10 flex items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                left: markerLeft,
                top: markerTop,
                width: CELL,
                height: CELL,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="relative text-3xl drop-shadow">
                🐢
                <span
                  className="absolute left-1/2 top-1/2 text-sm text-[var(--color-bubblegum)] transition-transform duration-300"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${
                      display.dir * 90
                    }deg) translateY(-20px)`,
                  }}
                >
                  ▲
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Controls + program */}
        <div className="w-full max-w-[280px]">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
            Pilih blok
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(BLOCK_META) as Block[]).map((b) => {
              const m = BLOCK_META[b];
              return (
                <button
                  key={b}
                  onClick={() => addBlock(b)}
                  disabled={running}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                  style={{
                    background: m.color,
                    boxShadow: `0 3px 0 ${m.shadow}`,
                  }}
                >
                  <span className="text-base">{m.icon}</span>
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
            Programmu
          </div>
          <div className="mb-3 min-h-[64px] rounded-2xl border-2 border-dashed border-[var(--color-cloud)] bg-white p-2">
            {program.length === 0 ? (
              <p className="py-3 text-center text-xs text-[var(--color-silver)]">
                Klik blok di atas untuk menyusun langkah…
              </p>
            ) : (
              <ol className="flex flex-col gap-1">
                {program.map((b, i) => {
                  const m = BLOCK_META[b];
                  const isActive = i === activeBlock;
                  return (
                    <li
                      key={i}
                      className={`flex items-center justify-between rounded-lg px-2 py-1 text-sm font-bold text-white transition-transform ${
                        isActive ? "scale-105 ring-2 ring-white" : ""
                      }`}
                      style={{ background: m.color }}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="opacity-70">{i + 1}.</span>
                        <span>{m.icon}</span>
                        {m.label}
                      </span>
                      <button
                        onClick={() => removeBlock(i)}
                        disabled={running}
                        aria-label="Hapus blok"
                        className="rounded px-1 text-white/80 hover:text-white disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {loopEnabled && (
            <div className="mb-3 flex items-center justify-between rounded-xl border-2 border-[var(--color-bubblegum)]/40 bg-[#fff0f6] px-3 py-2">
              <span className="text-sm font-bold text-[var(--color-bubblegum)]">
                🔁 Ulangi semua langkah
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRepeat((n) => Math.max(1, n - 1));
                    setStatus("idle");
                  }}
                  disabled={running}
                  aria-label="Kurangi"
                  className="h-7 w-7 rounded-lg bg-[var(--color-bubblegum)] text-white disabled:opacity-50"
                >
                  −
                </button>
                <span className="w-8 text-center text-base font-bold text-[var(--color-bubblegum)]">
                  {repeat}×
                </span>
                <button
                  onClick={() => {
                    setRepeat((n) => Math.min(10, n + 1));
                    setStatus("idle");
                  }}
                  disabled={running}
                  aria-label="Tambah"
                  className="h-7 w-7 rounded-lg bg-[var(--color-bubblegum)] text-white disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={run}
              disabled={running || program.length === 0}
              className="flex-1 rounded-xl bg-[var(--color-duo-green)] px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_var(--color-duo-green-dark)] disabled:opacity-50"
            >
              ▶ Jalankan
            </button>
            <button
              onClick={() => reset(false)}
              disabled={running}
              className="rounded-xl border-2 border-[var(--color-cloud)] px-3 py-2 text-sm font-bold text-[var(--color-graphite)] disabled:opacity-50"
            >
              ↺ Ulang
            </button>
            <button
              onClick={() => reset(true)}
              disabled={running}
              className="rounded-xl border-2 border-[var(--color-cloud)] px-3 py-2 text-sm font-bold text-[var(--color-graphite)] disabled:opacity-50"
            >
              🗑
            </button>
          </div>

          {status === "success" && (
            <div className="mt-3 rounded-xl bg-[var(--color-duo-green-light)] px-3 py-2 text-center text-sm font-bold text-[var(--color-duo-green-dark)]">
              ⭐ Hebat! Kura-kura sampai ke daunnya! 🎉
            </div>
          )}
          {status === "fail" && (
            <div className="mt-3 rounded-xl bg-[#ffe9e9] px-3 py-2 text-center text-sm font-bold text-[#d33]">
              Belum sampai 😅 Coba susun ulang bloknya, ya!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
