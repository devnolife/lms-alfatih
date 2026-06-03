import { prisma } from "@/lib/db";

export const metadata = { title: "Hasil Test · Dashboard Guru" };

export default async function TestResultsPage() {
  // Fetch all students with their test attempts
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      displayName: true,
      username: true,
      testAttempts: {
        select: {
          type: true,
          score: true,
          totalQuestions: true,
          submittedAt: true,
        },
      },
    },
    orderBy: { displayName: "asc" },
  });

  const rows = students.map((s) => {
    const pre = s.testAttempts.find((a) => a.type === "PRE");
    const post = s.testAttempts.find((a) => a.type === "POST");
    const prePercent = pre
      ? Math.round((pre.score / pre.totalQuestions) * 100)
      : null;
    const postPercent = post
      ? Math.round((post.score / post.totalQuestions) * 100)
      : null;
    const gain =
      prePercent !== null && postPercent !== null
        ? postPercent - prePercent
        : null;
    return {
      id: s.id,
      name: s.displayName,
      username: s.username,
      pre: pre ? { score: pre.score, total: pre.totalQuestions, percent: prePercent! } : null,
      post: post ? { score: post.score, total: post.totalQuestions, percent: postPercent! } : null,
      gain,
    };
  });

  const totalStudents = rows.length;
  const preCount = rows.filter((r) => r.pre).length;
  const postCount = rows.filter((r) => r.post).length;
  const avgPrePercent =
    preCount > 0
      ? Math.round(rows.reduce((s, r) => s + (r.pre?.percent ?? 0), 0) / preCount)
      : 0;
  const avgPostPercent =
    postCount > 0
      ? Math.round(rows.reduce((s, r) => s + (r.post?.percent ?? 0), 0) / postCount)
      : 0;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10">
      <h1
        className="text-4xl mb-2"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        📝 Hasil Pre-Test & Post-Test
      </h1>
      <p className="mb-8 text-[var(--color-graphite)]">
        Perbandingan skor sebelum dan sesudah mengikuti bootcamp
      </p>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Siswa" value={totalStudents} emoji="👥" />
        <StatCard label="Sudah Pre-Test" value={`${preCount}/${totalStudents}`} emoji="📝" />
        <StatCard label="Rata-rata Pre" value={`${avgPrePercent}%`} emoji="📊" />
        <StatCard
          label="Rata-rata Post"
          value={postCount > 0 ? `${avgPostPercent}%` : "—"}
          emoji="📈"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border-[3px] border-[var(--color-almost-black)] bg-white shadow-[0_4px_0_var(--color-almost-black)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--color-cloud)] text-left text-xs uppercase tracking-wider text-[var(--color-graphite)]">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3 text-center">Pre-Test</th>
              <th className="px-4 py-3 text-center">Post-Test</th>
              <th className="px-4 py-3 text-center">Peningkatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cloud)]">
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-[var(--color-ice)]">
                <td className="px-4 py-3 text-[var(--color-graphite)]">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-[var(--color-almost-black)]">{r.name}</td>
                <td className="px-4 py-3 text-[var(--color-graphite)]">{r.username}</td>
                <td className="px-4 py-3 text-center">
                  {r.pre ? (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {r.pre.score}/{r.pre.total} ({r.pre.percent}%)
                    </span>
                  ) : (
                    <span className="text-[var(--color-graphite)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.post ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                      {r.post.score}/{r.post.total} ({r.post.percent}%)
                    </span>
                  ) : (
                    <span className="text-[var(--color-graphite)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.gain !== null ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.gain > 0
                        ? "bg-green-100 text-green-700"
                        : r.gain < 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-[var(--color-graphite)]"
                        }`}
                    >
                      {r.gain > 0 ? "+" : ""}
                      {r.gain}%
                    </span>
                  ) : (
                    <span className="text-[var(--color-graphite)]">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-graphite)]">
                  Belum ada data siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string | number;
  emoji: string;
}) {
  return (
    <div className="rounded-2xl border-[3px] border-[var(--color-almost-black)] bg-white px-4 py-3 text-center shadow-[0_4px_0_var(--color-almost-black)]">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-lg font-bold text-[var(--color-almost-black)]">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-graphite)]">
        {label}
      </div>
    </div>
  );
}
