"use client";

interface Props {
  /**
   * Pipe-separated `emoji:name:analogy:function` parts, e.g.
   * "🧠:CPU:Otak:Memproses semua perintah|🪑:RAM:Meja kerja:Menaruh data".
   */
  data?: string;
  /** Heading shown above the diagram. */
  title?: string;
}

interface Part {
  emoji: string;
  name: string;
  analogy: string;
  fn: string;
}

function parseData(data: string): Part[] {
  return data
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const seg = p.split(":").map((s) => s.trim());
      return {
        emoji: seg[0] ?? "",
        name: seg[1] ?? "",
        analogy: seg[2] ?? "",
        fn: seg.slice(3).join(":").trim(),
      };
    });
}

/**
 * Shows the core inner parts of a computer as labelled cards, each pairing the
 * real part with a familiar real-world analogy (CPU = otak, RAM = meja, storage
 * = lemari) plus its job. Pure render from props — gives a concrete picture for
 * the hardware lesson.
 */
export default function DeviceParts({
  data = "🧠:CPU:Otak:Memproses semua perintah|🪑:RAM:Meja kerja:Menaruh data yang sedang dipakai|🗄️:Penyimpanan:Lemari:Menyimpan file selamanya",
  title = "Bagian dalam komputer",
}: Props) {
  const parts = parseData(data);

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        {title}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {parts.map((p, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-2xl border-2 border-[var(--color-cloud)] bg-[#fafafa] p-4 text-center"
          >
            <span className="text-4xl leading-none" aria-hidden>
              {p.emoji}
            </span>
            <span className="mt-2 text-base font-extrabold text-[var(--color-charcoal)]">
              {p.name}
            </span>
            {p.analogy && (
              <span className="mt-1 rounded-full bg-[var(--color-sky-blue-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-sky-blue-dark)]">
                seperti {p.analogy}
              </span>
            )}
            {p.fn && (
              <span className="mt-2 text-xs font-semibold leading-snug text-[var(--color-graphite)]">
                {p.fn}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
