import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllLessons } from "@/lib/content";
import { getTeacherGameSubmissions } from "@/lib/submissions-review";
import LogoutButton from "@/components/ui/LogoutButton";

export const dynamic = "force-dynamic";

const GAME_LABELS: Record<string, string> = {
  oceans: "🌊 AI Pemilah Laut",
  quiz: "📝 Kuis",
  branching: "🌳 Skenario",
  spreadsheet: "🔎 Spreadsheet",
  flowchart: "🔀 Diagram Alir",
  filesort: "🗂️ Sortir Berkas",
  hardware: "🛠️ Cocok Perangkat",
  maze: "🧩 Labirin Blok",
  quickdraw: "🎨 Tebak Gambar",
  teachable: "🤖 Teachable Machine",
  errorguard: "🕵️ Detektif Error",
};

function gameLabel(game: string): string {
  return GAME_LABELS[game] ?? game;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--color-duo-green)";
  if (score >= 50) return "var(--color-sunshine-dark)";
  return "var(--color-bubblegum)";
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ lessonSlug?: string; game?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/submissions");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  const { lessonSlug, game } = await searchParams;

  const [lessons, allRows] = await Promise.all([
    getAllLessons(),
    getTeacherGameSubmissions(user.id, { lessonSlug: lessonSlug || undefined }),
  ]);

  // Game filter is applied in-memory so the dropdown can list only games that
  // actually appear in the (lesson-filtered) results.
  const rows = game ? allRows.filter((r) => r.game === game) : allRows;
  const gamesPresent = Array.from(new Set(allRows.map((r) => r.game))).sort();

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-[var(--color-cloud)] bg-white">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="text-xl"
            style={{
              fontFamily: "var(--font-feather)",
              color: "var(--color-duo-green)",
            }}
          >
            🐍 FunPython · Guru
          </Link>
          <LogoutButton className="text-sm font-bold uppercase tracking-wide text-[var(--color-error)] hover:underline" />
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-6 py-12">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-[var(--color-graphite)] hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="mb-2 text-4xl" style={{ fontFamily: "var(--font-feather)" }}>
          Hasil Kerja Siswa
        </h1>
        <p className="mb-8 text-[var(--color-graphite)]">
          Tinjau jawaban, pilihan, dan data latih yang dikirim siswa dari setiap
          permainan interaktif. Menampilkan {rows.length} kiriman terbaru.
        </p>

        {/* Filters */}
        <form
          method="get"
          className="mb-8 flex flex-wrap items-end gap-4 rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5"
        >
          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
            Pelajaran
            <select
              name="lessonSlug"
              defaultValue={lessonSlug ?? ""}
              className="min-w-[220px] rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-charcoal)]"
            >
              <option value="">Semua pelajaran</option>
              {lessons.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
            Permainan
            <select
              name="game"
              defaultValue={game ?? ""}
              className="min-w-[200px] rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-charcoal)]"
            >
              <option value="">Semua permainan</option>
              {gamesPresent.map((g) => (
                <option key={g} value={g}>
                  {gameLabel(g)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-[var(--color-duo-green)] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-105"
          >
            Tampilkan
          </button>
          {(lessonSlug || game) && (
            <Link
              href="/dashboard/submissions"
              className="rounded-2xl px-3 py-2.5 text-sm font-bold text-[var(--color-graphite)] hover:underline"
            >
              Reset
            </Link>
          )}
        </form>

        {rows.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[var(--color-cloud)] bg-white p-10 text-center text-[var(--color-graphite)]">
            Belum ada kiriman hasil kerja yang cocok dengan filter ini.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rows.map((r) => {
              const entries = Object.entries(r.data);
              return (
                <div
                  key={r.id}
                  className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div
                        className="text-lg"
                        style={{ fontFamily: "var(--font-feather)" }}
                      >
                        {r.studentName}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
                        {gameLabel(r.game)}
                        {r.className ? ` · ${r.className}` : ""}
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ background: scoreColor(r.score) }}
                    >
                      {r.score}%
                    </span>
                  </div>

                  <div className="mb-3 text-xs text-[var(--color-silver)]">
                    {r.lessonTitle} · {formatDate(r.createdAt)}
                  </div>

                  {entries.length > 0 ? (
                    <dl className="flex flex-col gap-1 rounded-2xl bg-[var(--color-cloud)] p-3">
                      {entries.map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <dt className="font-bold text-[var(--color-graphite)]">
                            {k}
                          </dt>
                          <dd className="text-right text-[var(--color-charcoal)]">
                            {typeof v === "object"
                              ? JSON.stringify(v)
                              : String(v)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-[var(--color-silver)]">
                      (tidak ada rincian)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
