"use client";

import { useMemo, useState } from "react";
import { useGameFeedback } from "@/hooks/useGameFeedback";
import { classify, type Sample } from "@/lib/ml/teachable";

interface Props {
  title?: string;
  hint?: string;
  /** XP awarded once after the AI is trained and predicts. */
  xp?: string;
}

type Label = "fish" | "trash";

interface Item {
  id: number;
  emoji: string;
  name: string;
  truth: Label;
  /** Hidden feature vector the AI learns over: [organik, sirip, mata, bulat]. */
  features: number[];
}

/**
 * Training pool. Each creature/object carries a small hidden feature vector so
 * the in-browser KNN can genuinely learn from the labels the STUDENT assigns —
 * the heart of the code.org "AI for Oceans" activity (Modul 1).
 */
const TRAIN_ITEMS: Item[] = [
  { id: 1, emoji: "🐟", name: "Ikan", truth: "fish", features: [0.95, 0.9, 0.9, 0.6] },
  { id: 2, emoji: "🐠", name: "Ikan tropis", truth: "fish", features: [0.95, 0.95, 0.9, 0.55] },
  { id: 3, emoji: "🐡", name: "Ikan buntal", truth: "fish", features: [0.9, 0.8, 0.85, 0.9] },
  { id: 4, emoji: "🦈", name: "Hiu", truth: "fish", features: [0.9, 0.95, 0.8, 0.4] },
  { id: 5, emoji: "🥫", name: "Kaleng", truth: "trash", features: [0.1, 0.05, 0.05, 0.5] },
  { id: 6, emoji: "🍶", name: "Botol", truth: "trash", features: [0.1, 0.05, 0.1, 0.3] },
  { id: 7, emoji: "🛍️", name: "Kantong plastik", truth: "trash", features: [0.15, 0.1, 0.05, 0.2] },
  { id: 8, emoji: "👞", name: "Sepatu bekas", truth: "trash", features: [0.2, 0.1, 0.1, 0.25] },
];

/** New items the trained AI must classify on its own. */
const TEST_ITEMS: Item[] = [
  { id: 101, emoji: "🐙", name: "Gurita", truth: "fish", features: [0.85, 0.6, 0.8, 0.5] },
  { id: 102, emoji: "🦀", name: "Kepiting", truth: "fish", features: [0.8, 0.5, 0.7, 0.45] },
  { id: 103, emoji: "🦑", name: "Cumi", truth: "fish", features: [0.85, 0.7, 0.75, 0.4] },
  { id: 104, emoji: "🔋", name: "Baterai", truth: "trash", features: [0.1, 0.05, 0.05, 0.35] },
  { id: 105, emoji: "📦", name: "Kardus", truth: "trash", features: [0.15, 0.05, 0.05, 0.2] },
  { id: 106, emoji: "🧴", name: "Botol sabun", truth: "trash", features: [0.1, 0.05, 0.1, 0.3] },
];

const LABELS: Record<Label, { text: string; emoji: string; color: string }> = {
  fish: { text: "Ikan", emoji: "🐟", color: "var(--color-sky-blue)" },
  trash: { text: "Sampah", emoji: "🗑️", color: "var(--color-bubblegum)" },
};

/**
 * "AI for Oceans"-style game (code.org, Modul 1): the student TRAINS the AI by
 * labelling each item as Ikan or Sampah, then the AI classifies brand-new items
 * on its own. A weighted KNN over the student's labels powers the predictions,
 * so consistent labelling → accurate AI, demonstrating that an AI is only as
 * good as its training data.
 *
 * Authored as `::game{type="oceans" activityId="ai-oceans"}`.
 */
export default function OceansGame({
  title = "Latih AI Pemilah Sampah Laut",
  hint = "Beri label tiap benda: Ikan atau Sampah. Lalu lihat AI memilah benda baru sendiri!",
  xp = "25",
}: Props) {
  const fb = useGameFeedback();
  const [phase, setPhase] = useState<"train" | "result">("train");
  const [labels, setLabels] = useState<Record<number, Label>>({});
  const [awarded, setAwarded] = useState(false);

  const labelledCount = Object.keys(labels).length;
  const allLabelled = labelledCount === TRAIN_ITEMS.length;

  function setLabel(id: number, label: Label) {
    setLabels((prev) => ({ ...prev, [id]: label }));
    fb.click();
  }

  // Build KNN samples from the STUDENT's labels (not the ground truth).
  const predictions = useMemo(() => {
    const samples: Sample[] = TRAIN_ITEMS.filter((it) => labels[it.id]).map(
      (it) => ({ label: labels[it.id], features: it.features })
    );
    return TEST_ITEMS.map((it) => ({
      item: it,
      guess: classify(samples, it.features, 3),
    }));
  }, [labels]);

  const correctCount = predictions.filter(
    (p) => p.guess.label === p.item.truth
  ).length;

  function train() {
    if (!allLabelled) return;
    setPhase("result");
    const accuracy = Math.round((correctCount / TEST_ITEMS.length) * 100);
    // Completion is only granted when the trained AI sorts EVERY new item
    // correctly. Mislabelling the data yields a wrong-feedback prompt to retry
    // (no XP, lesson stays incomplete) — you cannot pass without good labels.
    const passed = correctCount === TEST_ITEMS.length;
    if (!passed) {
      fb.wrong();
      return;
    }
    if (!awarded) {
      setAwarded(true);
      // Capture the student's labels (by item name) as the training data.
      const namedLabels: Record<string, string> = {};
      for (const it of TRAIN_ITEMS) {
        const l = labels[it.id];
        if (l) namedLabels[it.name] = LABELS[l].text;
      }
      fb.solved({
        xp: Number(xp) || 25,
        label: `+${xp} XP`,
        badge: { id: "pelatih-ai", label: "Pelatih AI", emoji: "🤖" },
        game: "oceans",
        score: accuracy,
        data: namedLabels,
      });
    } else {
      fb.correct();
    }
  }

  function retry() {
    setPhase("train");
    setLabels({});
    setAwarded(false);
    fb.click();
  }

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#e6f6ff] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sky-blue-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🌊 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      {/* Phase indicator */}
      <div className="mb-4 flex justify-center gap-2 text-xs font-bold">
        <span
          className={`rounded-full px-3 py-1 ${phase === "train"
            ? "bg-[var(--color-sky-blue)] text-white"
            : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
            }`}
        >
          1 · Latih AI
        </span>
        <span className="text-[var(--color-silver)]">→</span>
        <span
          className={`rounded-full px-3 py-1 ${phase === "result"
            ? "bg-[var(--color-duo-green)] text-white"
            : "bg-[var(--color-cloud)] text-[var(--color-graphite)]"
            }`}
        >
          2 · AI Memilah
        </span>
      </div>

      {phase === "train" ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRAIN_ITEMS.map((it) => {
              const chosen = labels[it.id];
              return (
                <div
                  key={it.id}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-sm"
                >
                  <div className="text-4xl">{it.emoji}</div>
                  <div className="text-[11px] font-bold text-[var(--color-graphite)]">
                    {it.name}
                  </div>
                  <div className="flex w-full gap-1">
                    {(["fish", "trash"] as Label[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLabel(it.id, l)}
                        className={`flex-1 rounded-full px-2 py-1 text-[11px] font-bold transition ${chosen === l
                          ? "text-white"
                          : "bg-[var(--color-cloud)] text-[var(--color-graphite)] hover:brightness-95"
                          }`}
                        style={
                          chosen === l ? { background: LABELS[l].color } : undefined
                        }
                      >
                        {LABELS[l].emoji} {LABELS[l].text}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-xs font-bold text-[var(--color-graphite)]">
              {labelledCount}/{TRAIN_ITEMS.length} benda sudah diberi label
            </div>
            <button
              type="button"
              onClick={train}
              disabled={!allLabelled}
              className="rounded-full bg-[var(--color-duo-green)] px-6 py-2 text-sm font-bold text-white shadow transition hover:brightness-105 disabled:opacity-50"
            >
              🤖 Latih AI & Uji!
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 rounded-2xl bg-white p-3 text-center shadow-sm">
            <div className="text-sm font-bold text-[var(--color-graphite)]">
              AI memilah {TEST_ITEMS.length} benda baru — benar{" "}
              <span className="text-[var(--color-duo-green)]">
                {correctCount}/{TEST_ITEMS.length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {predictions.map(({ item, guess }) => {
              const ok = guess.label === item.truth;
              const gl = guess.label ? LABELS[guess.label as Label] : null;
              return (
                <div
                  key={item.id}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 shadow-sm ${ok ? "bg-[var(--color-duo-green)]/10" : "bg-[var(--color-bubblegum)]/10"
                    }`}
                >
                  <div className="text-4xl">{item.emoji}</div>
                  <div className="text-[11px] font-bold text-[var(--color-graphite)]">
                    {item.name}
                  </div>
                  <div className="text-xs font-bold" style={{ color: gl?.color }}>
                    AI: {gl ? `${gl.emoji} ${gl.text}` : "?"}
                  </div>
                  <div className="text-base">{ok ? "✅" : "❌"}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl bg-[var(--color-sunshine)]/15 p-3 text-center text-xs font-medium text-[var(--color-charcoal)]">
            {correctCount === TEST_ITEMS.length
              ? "🎉 Sempurna! Label yang konsisten membuat AI menebak dengan tepat."
              : "🤔 Ada yang salah! AI hanya sebaik data latihnya. Coba beri label lebih konsisten."}
          </div>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={retry}
              className="rounded-full border-2 border-[var(--color-cloud)] bg-white px-5 py-2 text-sm font-bold text-[var(--color-graphite)] transition hover:bg-[var(--color-cloud)]"
            >
              🔄 Latih Ulang
            </button>
          </div>
        </>
      )}
    </div>
  );
}
