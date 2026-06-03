import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/classes";
import LogoutButton from "@/components/ui/LogoutButton";
import TeacherClassManager from "@/components/classes/TeacherClassManager";

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  const classes = await getTeacherClasses(user.id);

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-[var(--color-cloud)] bg-white">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between px-6 h-16">
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

      <main className="max-w-[1140px] mx-auto px-6 py-12">
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          Dashboard Guru
        </h1>
        <p className="text-[var(--color-graphite)] mb-8">
          Halo, {user.displayName}. Buat kelas dan bagikan kodenya ke siswa agar
          mereka bisa bergabung.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/submissions"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-5 py-3 text-sm font-bold text-[var(--color-charcoal)] shadow-sm transition hover:border-[var(--color-duo-green)]"
          >
            📊 Lihat Hasil Kerja Siswa
            <span className="text-[var(--color-graphite)]">→</span>
          </Link>
          <Link
            href="/dashboard/materials"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--color-cloud)] bg-white px-5 py-3 text-sm font-bold text-[var(--color-charcoal)] shadow-sm transition hover:border-[var(--color-duo-green)]"
          >
            📚 Materi Pegangan Guru
            <span className="text-[var(--color-graphite)]">→</span>
          </Link>
        </div>

        <TeacherClassManager initialClasses={classes} />
      </main>
    </div>
  );
}
