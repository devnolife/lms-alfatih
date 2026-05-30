import { getCurrentUser } from "@/lib/auth";
import { getStudentClasses, getTeacherClasses } from "@/lib/classes";
import { getClassLeaderboard } from "@/lib/leaderboard";
import BackButton from "@/components/ui/BackButton";
import JoinClassPanel from "@/components/classes/JoinClassPanel";
import LeaderboardBoard from "@/components/curriculum/LeaderboardBoard";
import PendingLink from "@/components/ui/PendingLink";

export const metadata = {
  title: "Kelas Saya — FunPython",
};

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN";
  const classes = isTeacher
    ? await getTeacherClasses(user.id)
    : await getStudentClasses(user.id);

  const leaderboards = Object.fromEntries(
    await Promise.all(
      classes.map(async (c) => [
        c.id,
        await getClassLeaderboard(c.id, user.id),
      ] as const)
    )
  );

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10">
      <div className="mb-5">
        <BackButton href="/app" label="Home" />
      </div>

      <h1
        className="mb-2 text-3xl sm:text-4xl"
        style={{ fontFamily: "var(--font-feather)" }}
      >
        Kelas Saya
      </h1>
      <p className="mb-8 text-[var(--color-graphite)]">
        {isTeacher
          ? "Kelola kelas yang kamu ajar dari Dashboard Guru."
          : "Kelas tempat kamu belajar bersama teman sekelompok."}
      </p>

      {!isTeacher && (
        <div className="mb-8">
          <JoinClassPanel />
        </div>
      )}

      {classes.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[var(--color-cloud)] p-10 text-center text-[var(--color-silver)]">
          {isTeacher
            ? "Belum ada kelas. Buat kelas dari Dashboard Guru."
            : "Belum bergabung di kelas mana pun. Masukkan kode di atas untuk mulai."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-5"
            >
              <div
                className="text-xl"
                style={{ fontFamily: "var(--font-feather)" }}
              >
                {c.name}
              </div>
              {"teacherName" in c ? (
                <p className="mt-1 text-sm text-[var(--color-graphite)]">
                  Guru: {c.teacherName}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[var(--color-graphite)]">
                  Kode: <span className="font-mono font-bold">{c.joinCode}</span> ·{" "}
                  {c.studentCount} siswa
                </p>
              )}
              {c.activeSessionId && (
                <PendingLink
                  href={`/app/sessions/${c.activeSessionId}`}
                  className="btn-3d mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-duo-green)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
                >
                  🔴 Masuk Sesi Live →
                </PendingLink>
              )}
              {leaderboards[c.id]?.length > 0 && (
                <div className="mt-4">
                  <LeaderboardBoard
                    rows={leaderboards[c.id].slice(0, 5)}
                    title="Peringkat Kelas"
                    emoji="🏅"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <div className="mt-8">
          <PendingLink
            href="/dashboard"
            className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-sky-blue)] px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-sky-blue-dark)]"
          >
            Buka Dashboard Guru →
          </PendingLink>
        </div>
      )}
    </div>
  );
}
