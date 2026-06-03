"use client";

import { useSound } from "@/components/festivity/SoundProvider";

/**
 * Fixed, always-visible button to mute/unmute festivity sounds. Sound is ON by
 * default; the preference is persisted in localStorage by SoundProvider.
 */
export default function MuteToggle() {
  const { muted, toggleMute, play } = useSound();

  return (
    <button
      onClick={() => {
        toggleMute();
        // After unmuting, give a small audible confirmation.
        if (muted) play("click");
      }}
      aria-pressed={muted}
      aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
      title={muted ? "Suara mati — klik untuk nyalakan" : "Suara aktif — klik untuk matikan"}
      className="fixed bottom-5 right-[5.5rem] z-[70] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-cloud)] bg-white text-xl shadow-[0_4px_0_var(--color-cloud)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
