"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";

interface Props {
  /**
   * Scenario nodes separated by `~`. Each node:
   *   `id>>teks situasi>>opsi::next::wise|opsi::next`
   * `next` is another node id, or `end` to finish. `wise` (optional 3rd field)
   * marks the bijak/best choice and earns XP. Start node id must be `start`.
   */
  data?: string;
  title?: string;
  xp?: string;
}

interface Choice {
  text: string;
  next: string;
  wise: boolean;
}
interface Node {
  id: string;
  text: string;
  choices: Choice[];
}

function parse(data: string): Record<string, Node> {
  const map: Record<string, Node> = {};
  for (const raw of data.split("~").map((s) => s.trim()).filter(Boolean)) {
    const [id, text, choicesRaw] = raw.split(">>");
    const choices: Choice[] = (choicesRaw ?? "")
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [ctext, next, wise] = c.split("::");
        return {
          text: (ctext ?? "").trim(),
          next: (next ?? "end").trim(),
          wise: (wise ?? "").trim() === "wise",
        };
      });
    map[(id ?? "").trim()] = { id: (id ?? "").trim(), text: (text ?? "").trim(), choices };
  }
  return map;
}

/**
 * Branching "what would you do?" scenario for Dampak Sosial Informatika.
 * Authored as `::game{type="branching" data="start>>...>>...::node2::wise|..."}`.
 */
export default function BranchingGame({
  data = "",
  title = "Skenario Digital",
  xp = "20",
}: Props) {
  const nodes = useMemo(() => parse(data), [data]);
  const fb = useGameFeedback();
  const [currentId, setCurrentId] = useState("start");
  const [path, setPath] = useState<{ text: string; wise: boolean }[]>([]);
  const [wiseCount, setWiseCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const current = nodes[currentId];

  function choose(choice: Choice) {
    setPath((p) => [...p, { text: choice.text, wise: choice.wise }]);
    if (choice.wise) {
      setWiseCount((w) => w + 1);
      fb.correct();
    } else {
      fb.wrong();
    }
    if (choice.next === "end" || !nodes[choice.next]) {
      setFinished(true);
      const finalPath = [...path, { text: choice.text, wise: choice.wise }];
      const wiseTotal = wiseCount + (choice.wise ? 1 : 0);
      // Completion is only granted when EVERY decision along the path is wise.
      // An unwise ending shows the recap + "coba lagi" prompt but awards no XP
      // and leaves the lesson incomplete — you cannot pass by choosing poorly.
      const allWise = wiseTotal === finalPath.length;
      if (allWise && !awarded) {
        setAwarded(true);
        const data: Record<string, unknown> = {};
        finalPath.forEach((p, i) => {
          data[`langkah ${i + 1}`] = `${p.text}${p.wise ? " (bijak)" : ""}`;
        });
        fb.solved({
          xp: Number(xp) || 20,
          label: `+${xp} XP`,
          game: "branching",
          score: 100,
          data,
        });
      } else if (!allWise) {
        fb.wrong();
      }
    } else {
      setCurrentId(choice.next);
    }
  }

  function restart() {
    setCurrentId("start");
    setPath([]);
    setWiseCount(0);
    setFinished(false);
    setAwarded(false);
  }

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#eaf6ff] to-white p-5">
      <div
        className="mb-3 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🛡️ {title}
      </div>

      {path.length > 0 && (
        <ol className="mx-auto mb-4 max-w-[760px] space-y-1">
          {path.map((p, i) => (
            <li
              key={i}
              className={`rounded-lg px-3 py-1.5 text-sm ${p.wise
                ? "bg-[var(--color-duo-green-light)] text-[var(--color-duo-green-dark)]"
                : "bg-[#fff3f3] text-[#c0392b]"
                }`}
            >
              {p.wise ? "✅" : "⚠️"} {p.text}
            </li>
          ))}
        </ol>
      )}

      {!finished && current && (
        <div className="mx-auto max-w-[760px]">
          <p className="mb-3 rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-4 py-3 text-center font-semibold text-[var(--color-almost-black)]">
            {current.text}
          </p>
          <div className="flex flex-col gap-2">
            {current.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => choose(c)}
                className="rounded-xl border-2 border-[var(--color-cloud)] bg-white px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:border-[var(--color-sky-blue)]"
              >
                {c.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="mx-auto max-w-[760px] text-center">
          <div className="rounded-xl bg-[var(--color-duo-green-light)] px-3 py-3 text-sm font-bold text-[var(--color-duo-green-dark)]">
            {wiseCount === path.length
              ? "🌟 Luar biasa! Semua keputusanmu bijak sebagai warga digital!"
              : `Kamu membuat ${wiseCount} keputusan bijak dari ${path.length}. Yuk pikir ulang dampaknya!`}
          </div>
          <button
            onClick={restart}
            className="mt-3 rounded-xl border-2 border-[var(--color-cloud)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)] hover:border-[var(--color-sky-blue)]"
          >
            ↺ Coba lagi
          </button>
        </div>
      )}
    </div>
  );
}
