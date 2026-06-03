"use client";

interface Props {
  /** First process box, e.g. "Baca nilai". */
  read?: string;
  /** Decision question shown in the diamond, e.g. "Nilai >= 75?". */
  decision?: string;
  /** Label on the "yes" branch box. */
  yes?: string;
  /** Label on the "no" branch box. */
  no?: string;
}

const Connector = () => (
  <div className="my-0.5 h-5 w-0.5 bg-[var(--color-silver)]" aria-hidden />
);

const Oval = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-full border-2 border-[var(--color-grape)] bg-[var(--color-grape)]/10 px-5 py-2 text-sm font-bold text-[var(--color-grape-dark)]">
    {children}
  </div>
);

const Process = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border-2 border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light)] px-4 py-2 text-sm font-bold text-[var(--color-sky-blue-dark)]">
    {children}
  </div>
);

const Diamond = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex h-24 w-44 items-center justify-center">
    <div className="absolute inset-0 m-auto h-[88px] w-[88px] rotate-45 rounded-md border-2 border-[var(--color-sunshine-dark)] bg-[var(--color-sunshine)]/20" />
    <span className="relative z-10 px-2 text-center text-xs font-bold text-[var(--color-sunshine-dark)]">
      {children}
    </span>
  </div>
);

/**
 * A static, no-code flowchart illustration for computational-thinking lessons.
 * Shows the three core flowchart shapes (terminator oval, process rectangle,
 * decision diamond) as a legend, then a worked example with Ya/Tidak branches —
 * giving students a concrete picture of what the text describes.
 */
export default function FlowchartDiagram({
  read = "Baca nilai",
  decision = "Nilai >= 75?",
  yes = "Tampilkan 'Lulus'",
  no = "Tampilkan 'Belum'",
}: Props) {
  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 border-b-2 border-dashed border-[var(--color-cloud)] pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
          Bentuk
        </span>
        <div className="flex items-center gap-2">
          <span className="h-5 w-9 rounded-full border-2 border-[var(--color-grape)] bg-[var(--color-grape)]/10" />
          <span className="text-xs font-bold text-[var(--color-charcoal)]">Mulai / Selesai</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-5 w-9 rounded border-2 border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light)]" />
          <span className="text-xs font-bold text-[var(--color-charcoal)]">Proses</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rotate-45 rounded-[3px] border-2 border-[var(--color-sunshine-dark)] bg-[var(--color-sunshine)]/20" />
          <span className="text-xs font-bold text-[var(--color-charcoal)]">Keputusan (ya/tidak)</span>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col items-center">
        <Oval>Mulai</Oval>
        <Connector />
        <Process>{read}</Process>
        <Connector />
        <Diamond>{decision}</Diamond>

        {/* Split connector from the diamond into two branches */}
        <div className="relative h-6 w-full max-w-md">
          {/* short stem down from the diamond */}
          <div className="absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 bg-[var(--color-silver)]" />
          {/* horizontal bar */}
          <div className="absolute left-1/4 right-1/4 top-3 h-0.5 bg-[var(--color-silver)]" />
          {/* drops to each branch */}
          <div className="absolute left-1/4 top-3 h-3 w-0.5 -translate-x-1/2 bg-[var(--color-silver)]" />
          <div className="absolute right-1/4 top-3 h-3 w-0.5 translate-x-1/2 bg-[var(--color-silver)]" />
        </div>

        {/* Branch labels + boxes */}
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          <div className="flex flex-col items-center">
            <span className="rounded-full bg-[var(--color-duo-green-light)] px-2 py-0.5 text-xs font-extrabold text-[var(--color-duo-green-dark)]">
              Ya ✓
            </span>
            <Connector />
            <Process>{yes}</Process>
            <Connector />
          </div>
          <div className="flex flex-col items-center">
            <span className="rounded-full bg-[var(--color-bubblegum)]/15 px-2 py-0.5 text-xs font-extrabold text-[var(--color-bubblegum)]">
              Tidak ✗
            </span>
            <Connector />
            <Process>{no}</Process>
            <Connector />
          </div>
        </div>

        {/* Merge connector back into one before Selesai */}
        <div className="relative h-3 w-full max-w-md">
          <div className="absolute left-1/4 right-1/4 bottom-0 h-0.5 bg-[var(--color-silver)]" />
          <div className="absolute left-1/2 bottom-0 h-3 w-0.5 -translate-x-1/2 bg-[var(--color-silver)]" />
        </div>

        <Oval>Selesai</Oval>
      </div>
    </div>
  );
}
