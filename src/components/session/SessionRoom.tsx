"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStream } from "@/hooks/useSessionStream";
import TaskBoard from "@/components/session/TaskBoard";
import DeliverablePanel from "@/components/session/DeliverablePanel";

interface Props {
  sessionId: string;
  currentUserId: string;
}

export default function SessionRoom({ sessionId, currentUserId }: Props) {
  const router = useRouter();
  const { connected, session, online, board, tasks, deliverables, ended } =
    useSessionStream(sessionId);
  const [ending, setEnding] = useState(false);

  const onlineCount = online.length;

  async function handleEnd() {
    if (ending) return;
    if (!confirm("Akhiri sesi live ini untuk semua siswa?")) return;
    setEnding(true);
    try {
      await fetch(`/api/sessions/${sessionId}/end`, { method: "POST" });
      router.push(session?.isTeacher ? "/dashboard" : "/app/classes");
    } catch {
      setEnding(false);
    }
  }

  if (!session) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-[var(--color-cloud)] p-10 text-center text-[var(--color-silver)]">
        Memuat sesi…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                ended
                  ? "bg-[var(--color-silver)]"
                  : connected
                    ? "animate-pulse bg-[var(--color-error)]"
                    : "bg-[var(--color-bee,#ffc800)]"
              }`}
              aria-hidden
            />
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
              {ended ? "Sesi Berakhir" : connected ? "Live" : "Menyambung…"}
            </span>
          </div>
          <h1
            className="mt-1 text-3xl sm:text-4xl"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            {session.title ?? `Sesi Live · ${session.className}`}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-graphite)]">
            {session.className} · {onlineCount} online
          </p>
        </div>

        {session.isTeacher && !ended && (
          <button
            type="button"
            onClick={handleEnd}
            disabled={ending}
            className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-error)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_#c43d3d] disabled:opacity-50"
          >
            {ending ? "Mengakhiri…" : "Akhiri Sesi"}
          </button>
        )}
      </div>

      {ended && (
        <div className="mb-6 rounded-2xl border-2 border-[var(--color-cloud)] bg-[var(--color-cloud)]/40 p-4 text-sm font-bold text-[var(--color-graphite)]">
          Sesi ini sudah berakhir. Papan di bawah menampilkan hasil akhir.
        </div>
      )}

      <div className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5">
        <h2
          className="mb-4 text-lg"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          Papan Kelas
        </h2>

        {board.length === 0 ? (
          <p className="py-6 text-center text-[var(--color-silver)]">
            Belum ada siswa di kelas ini.
          </p>
        ) : (
          <ul className="space-y-2">
            {board.map((row, i) => (
              <li
                key={row.userId}
                className="flex items-center gap-3 rounded-2xl border-2 border-[var(--color-cloud)] px-4 py-3"
              >
                <span className="w-6 text-center text-base font-bold text-[var(--color-graphite)]">
                  {i + 1}
                </span>
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    row.online
                      ? "bg-[var(--color-duo-green)]"
                      : "bg-[var(--color-cloud)]"
                  }`}
                  aria-label={row.online ? "online" : "offline"}
                />
                <span className="flex-1 font-bold">{row.displayName}</span>
                <span className="text-sm text-[var(--color-graphite)]">
                  {row.solvedCount} soal
                </span>
                <span className="rounded-xl bg-[var(--color-duo-green-light,#d7ffb8)] px-3 py-1 text-sm font-bold text-[var(--color-duo-green-dark)]">
                  {row.xp} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <TaskBoard
          sessionId={sessionId}
          tasks={tasks}
          isTeacher={session.isTeacher}
          currentUserId={currentUserId}
          locked={ended}
        />
        <DeliverablePanel
          sessionId={sessionId}
          deliverables={deliverables}
          isTeacher={session.isTeacher}
          currentUserId={currentUserId}
          locked={ended}
        />
      </div>
    </div>
  );
}
