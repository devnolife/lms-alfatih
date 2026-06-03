import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeachingGuide } from "@/lib/teaching";
import LogoutButton from "@/components/ui/LogoutButton";
import LevelGuideCard from "@/components/teaching/LevelGuideCard";

export default async function MaterialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/materials");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  const guide = await getTeachingGuide();

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
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-[var(--color-graphite)] hover:underline"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          📚 Materi Pegangan Guru
        </h1>
        <p className="text-[var(--color-graphite)] mb-8 max-w-2xl">
          Panduan mengajar per level: tujuan belajar, pacing waktu, catatan
          fasilitator, dan kunci jawaban. Gunakan ini sebagai pegangan saat
          mendampingi siswa. Klik tiap level untuk membuka detailnya, atau tekan
          tombol <span className="font-bold">▶ Presentasi</span> untuk membuka
          mode layar penuh yang siap diproyeksikan ke kelas.
        </p>

        <div className="space-y-4">
          {guide.map((g, i) => (
            <LevelGuideCard
              key={g.meta.level}
              guide={g}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
