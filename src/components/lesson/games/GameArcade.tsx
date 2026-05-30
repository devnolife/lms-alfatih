"use client";

import { useState } from "react";
import GameBlock from "@/components/lesson/GameBlock";
import { GAME_CATALOG, type GameEntry } from "@/components/lesson/games/catalog";

const LEVEL_META: Record<number, { label: string; bg: string; fg: string }> = {
  1: { label: "Mudah", bg: "var(--color-duo-green-light)", fg: "var(--color-duo-green-dark)" },
  2: { label: "Sedang", bg: "var(--color-sky-blue-light)", fg: "var(--color-sky-blue-dark)" },
  3: { label: "Seru", bg: "var(--color-sunshine)", fg: "var(--color-almost-black)" },
};

export default function GameArcade() {
  const [active, setActive] = useState<GameEntry | null>(null);

  if (active) {
    return (
      <div>
        <button
          onClick={() => setActive(null)}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--color-cloud)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-charcoal)] hover:border-[var(--color-duo-green)]"
        >
          ← Kembali ke daftar game
        </button>
        <GameBlock type={active.type} {...active.props} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {GAME_CATALOG.map((cat) => (
        <section key={cat.id}>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-2xl">{cat.emoji}</span>
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-feather)" }}>
              {cat.title}
            </h2>
          </div>
          <p className="mb-4 text-sm text-[var(--color-graphite)]">{cat.description}</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cat.games.map((game) => {
              const lvl = LEVEL_META[game.level];
              return (
                <button
                  key={game.id}
                  onClick={() => setActive(game)}
                  className="duo-card group flex flex-col items-start p-5 text-left"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-3xl">{game.emoji}</span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: lvl.bg, color: lvl.fg }}
                    >
                      {lvl.label}
                    </span>
                  </div>
                  <div
                    className="mt-3 text-lg leading-tight"
                    style={{ fontFamily: "var(--font-feather)" }}
                  >
                    {game.title}
                  </div>
                  <p className="mt-1 text-sm font-normal text-[var(--color-graphite)]">
                    {game.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-bold text-[var(--color-sky-blue-dark)]">
                    Main
                    <span className="ml-1 transition-transform group-hover:translate-x-1">
                      ▶
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
