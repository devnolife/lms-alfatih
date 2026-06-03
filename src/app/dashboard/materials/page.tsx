import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeachingGuide } from "@/lib/teaching";
import LevelGuideCard from "@/components/teaching/LevelGuideCard";

export default async function MaterialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/materials");
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  const guide = await getTeachingGuide();

  return (
    <main className="max-w-[1180px] mx-auto px-5 py-10">
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
          <LevelGuideCard key={g.meta.level} guide={g} defaultOpen={i === 0} />
        ))}
      </div>
    </main>
  );
}
