"use client";

import { useMemo } from "react";
import { useGameState } from "@/hooks/useGameState";

interface Entry {
  name: string;
  xp: number;
  avatar: string;
  isUser: boolean;
}

const baseData: Entry[] = [
  { name: "Alif_Tech_Pro 🚀", xp: 120, avatar: "🔥", isUser: false },
  { name: "Siti_🐍_Slayer", xp: 90, avatar: "🐉", isUser: false },
  { name: "Budi_Gamer_Cilik", xp: 60, avatar: "🕹️", isUser: false },
  { name: "Kamu 👑", xp: 0, avatar: "🦁", isUser: true },
];

export default function Leaderboard() {
  const { xp } = useGameState();

  const sorted = useMemo(() => {
    const data = baseData.map((e) =>
      e.isUser ? { ...e, xp } : e
    );
    return [...data].sort((a, b) => b.xp - a.xp);
  }, [xp]);

  return (
    <div className="max-w-[600px] mx-auto mt-10 border-3 border-almost-black rounded-3xl bg-snow shadow-[0_8px_0_var(--color-almost-black)] overflow-hidden">
      <div className="bg-sunshine border-b-3 border-almost-black py-5 text-center">
        <h3 className="font-[family-name:var(--font-feather)] text-2xl text-almost-black">
          🏆 PAPAN PERINGKAT LIVE
        </h3>
      </div>
      <div className="flex flex-col">
        {sorted.map((row, idx) => (
          <div
            key={row.name}
            className={`flex justify-between items-center px-6 py-4 border-b-2 border-cloud last:border-b-0 transition-colors ${row.isUser ? "bg-sky-blue-light" : ""
              }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-[family-name:var(--font-feather)] text-xl text-graphite w-6">
                #{idx + 1}
              </span>
              <span className="w-11 h-11 rounded-full border-2 border-almost-black flex items-center justify-center text-xl bg-cloud">
                {row.avatar}
              </span>
              <span className="font-extrabold">{row.name}</span>
            </div>
            <span className="font-[family-name:var(--font-feather)] text-sunshine-dark">
              {row.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
