"use client";

import { useGameState } from "@/hooks/useGameState";

export default function Header() {
  const { xp, lives } = useGameState();

  return (
    <header className="sticky top-0 z-50 bg-snow border-b-4 border-cloud">
      <div className="mx-auto max-w-[1140px] px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-3 font-[family-name:var(--font-feather)] text-[28px] font-bold text-duo-green no-underline hover:scale-105 transition-transform"
        >
          <svg className="w-12 h-12 drop-shadow-sm" viewBox="0 0 100 100">
            <path
              d="M20,50 Q35,20 50,50 T80,50"
              stroke="#58cc02"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="30" cy="45" r="5" fill="#3c3c3c" />
            <path
              d="M26,38 Q25,32 30,30"
              stroke="#ffc700"
              strokeWidth="3"
              fill="none"
            />
            <path d="M12,48 L4,48 L8,42 Z" fill="#cc348d" />
          </svg>
          python is fun
        </a>

        {/* HUD Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border-3 border-sunshine bg-[#fffdf0] text-sunshine-dark font-[family-name:var(--font-feather)] font-bold text-base shadow-[0_4px_0_var(--color-sunshine)] hover:-translate-y-0.5 transition-transform select-none">
            ⚡ <span>{xp}</span> XP
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border-3 border-[#ffb8b8] bg-[#fff5f5] text-error font-[family-name:var(--font-feather)] font-bold text-base shadow-[0_4px_0_#ff8383] hover:-translate-y-0.5 transition-transform select-none">
            ❤️ <span>{lives}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
