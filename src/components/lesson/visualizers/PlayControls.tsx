"use client";

interface Props {
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
  /** Optional label shown next to the controls (e.g. progress text). */
  status?: string;
}

/**
 * Reusable play/pause + replay control bar for auto-playing visualizers.
 */
export default function PlayControls({ playing, onToggle, onReset, status }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-duo-green)] px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_3px_0_var(--color-duo-green-dark)]"
      >
        {playing ? "⏸ Jeda" : "▶ Putar"}
      </button>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--color-cloud)] px-3 py-1.5 text-sm font-bold text-[var(--color-graphite)]"
      >
        ↻ Ulang
      </button>
      {status && (
        <span className="text-xs font-bold text-[var(--color-graphite)]">
          {status}
        </span>
      )}
    </div>
  );
}
