"use client";

import { useState } from "react";

interface Props {
  /** Scratch project id (the number in scratch.mit.edu/projects/<id>). */
  projectId?: string;
  title?: string;
  hint?: string;
}

/**
 * Embeds a Scratch project player via iframe. Authored as
 * `::scratch{projectId="123456789" title="Game Tangkap Apel"}`.
 * Requires internet; shows a friendly fallback link if the frame is blocked.
 */
export default function ScratchEmbed({
  projectId = "",
  title = "Proyek Scratch",
  hint = "Tekan bendera hijau 🟢 untuk memainkan proyek Scratch ini!",
}: Props) {
  const [failed, setFailed] = useState(false);
  const valid = /^\d+$/.test(projectId.trim());
  const url = `https://scratch.mit.edu/projects/${projectId.trim()}/embed`;
  const projectUrl = `https://scratch.mit.edu/projects/${projectId.trim()}/`;

  return (
    <div className="not-prose my-6 rounded-3xl border-2 border-[var(--color-cloud)] bg-gradient-to-b from-[#fff6e8] to-white p-5">
      <div
        className="mb-1 text-center text-lg text-[var(--color-sunshine-dark)]"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        🐱 {title}
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[var(--color-charcoal)]">
        {hint}
      </p>

      {valid && !failed ? (
        <div className="mx-auto max-w-[485px]">
          <iframe
            src={url}
            title={title}
            width="485"
            height="402"
            allowTransparency
            allow="autoplay; fullscreen"
            frameBorder={0}
            scrolling="no"
            onError={() => setFailed(true)}
            className="mx-auto w-full rounded-2xl border-2 border-[var(--color-cloud)]"
          />
          <p className="mt-2 text-center text-xs text-[var(--color-graphite)]">
            Tidak muncul?{" "}
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[var(--color-sky-blue-dark)] underline"
            >
              Buka di Scratch ↗
            </a>
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-[485px] rounded-2xl border-2 border-dashed border-[var(--color-cloud)] bg-white p-6 text-center">
          <p className="mb-3 text-sm text-[var(--color-charcoal)]">
            {valid
              ? "Proyek Scratch belum bisa ditampilkan di sini. Buka langsung di situs Scratch, ya!"
              : "Proyek Scratch belum diatur. Minta gurumu menambahkan ID proyek."}
          </p>
          {valid && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-sunshine-dark)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Buka di Scratch ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
