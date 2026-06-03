import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeacherClasses } from "@/lib/classes";
import TeacherClassManager from "@/components/classes/TeacherClassManager";

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  const classes = await getTeacherClasses(user.id);

  return (
    <main className="max-w-[1180px] mx-auto px-5 py-10">
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

      <TeacherClassManager initialClasses={classes} />
    </main>
  );
}
