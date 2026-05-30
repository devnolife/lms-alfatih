"use client";

import { useEffect } from "react";
import { useReward } from "@/components/festivity/RewardProvider";

/** Auto-dismissing floating "+N XP" popup. */
function Popup({ id, text }: { id: number; text: string }) {
  const { dismissPopup } = useReward();
  useEffect(() => {
    const t = setTimeout(() => dismissPopup(id), 1600);
    return () => clearTimeout(t);
  }, [id, dismissPopup]);
  return (
    <div className="fx-float-up rounded-full bg-[var(--color-sunshine)] px-4 py-1.5 text-sm font-bold text-[var(--color-almost-black)] shadow-[0_3px_0_var(--color-sunshine-dark)]">
      ⭐ {text}
    </div>
  );
}

/** Auto-dismissing badge unlock toast. */
function Toast({
  id,
  emoji,
  label,
}: {
  id: number;
  emoji: string;
  label: string;
}) {
  const { dismissToast } = useReward();
  useEffect(() => {
    const t = setTimeout(() => dismissToast(id), 3200);
    return () => clearTimeout(t);
  }, [id, dismissToast]);
  return (
    <div className="fx-toast-in flex items-center gap-3 rounded-2xl border-2 border-[var(--color-grape-dark)] bg-white px-4 py-3 shadow-[0_4px_0_var(--color-grape-dark)]">
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-grape-dark)]">
          Lencana baru!
        </div>
        <div
          className="text-sm leading-tight"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * Fixed overlay that renders reward feedback (XP popups bottom-center, badge
 * toasts top-right). Mounted once by LearningExperienceProvider.
 */
export default function RewardLayer() {
  const { popups, toasts } = useReward();
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2">
        {popups.map((p) => (
          <Popup key={p.id} id={p.id} text={p.text} />
        ))}
      </div>
      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            emoji={t.badge.emoji}
            label={t.badge.label}
          />
        ))}
      </div>
    </>
  );
}
