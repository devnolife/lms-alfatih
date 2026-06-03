import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAllLessons } from "@/lib/content";
import { getAllStudentsRoster } from "@/lib/students";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Siswa — FunPython",
};

function formatLastActive(d: Date | null): string {
  if (!d) return "Belum mulai";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/students");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  const [students, lessons] = await Promise.all([
    getAllStudentsRoster(),
    getAllLessons(),
  ]);
  const totalLessons = lessons.length;

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10">
      <h1 className="mb-2 text-4xl" style={{ fontFamily: "var(--font-feather)" }}>
        Daftar Siswa
      </h1>
      <p className="mb-8 text-[var(--color-graphite)]">
        Seluruh {students.length} akun siswa di sekolah, diurutkan berdasarkan
        XP. Daftar ini menampilkan semua siswa — termasuk yang belum bergabung ke
        kelas mana pun.
      </p>

      {students.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[var(--color-cloud)] p-10 text-center text-[var(--color-silver)]">
          Belum ada akun siswa.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border-2 border-[var(--color-cloud)] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--color-cloud)] text-left text-xs font-bold uppercase tracking-wide text-[var(--color-graphite)]">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3 text-right">Materi Selesai</th>
                <th className="px-4 py-3 text-right">Tantangan</th>
                <th className="px-4 py-3 text-right">Aktivitas</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Terakhir Aktif</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--color-cloud)] last:border-0 hover:bg-[var(--color-snow)]"
                >
                  <td className="px-4 py-3 text-[var(--color-silver)]">
                    {i + 1}
                  </td>
                  <td
                    className="px-4 py-3 font-bold"
                    style={{ fontFamily: "var(--font-feather)" }}
                  >
                    {s.displayName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-graphite)]">
                    {s.username}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--color-duo-green)]">
                    ⭐ {s.xp}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.lessonsCompleted}
                    <span className="text-[var(--color-silver)]">
                      /{totalLessons}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{s.challengesDone}</td>
                  <td className="px-4 py-3 text-right">{s.activitiesDone}</td>
                  <td className="px-4 py-3">
                    {s.className ?? (
                      <span className="text-[var(--color-silver)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-graphite)]">
                    {formatLastActive(s.lastActiveAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-[var(--color-graphite)]">
        Ingin melihat jawaban &amp; data latih yang dikirim siswa?{" "}
        <Link
          href="/dashboard/submissions"
          className="font-bold text-[var(--color-duo-green)] underline"
        >
          Buka Hasil Siswa →
        </Link>
      </p>
    </main>
  );
}
