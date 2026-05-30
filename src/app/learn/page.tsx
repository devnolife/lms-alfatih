import { getCurrentUser } from "@/lib/auth";
import { getCurriculum } from "@/lib/curriculum";
import LevelMap from "@/components/curriculum/LevelMap";
import BackButton from "@/components/ui/BackButton";

export default async function LearnIndex({
  searchParams,
}: {
  searchParams: Promise<{ locked?: string }>;
}) {
  const { locked } = await searchParams;
  const user = await getCurrentUser();
  const groups = await getCurriculum(user?.id);

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-12">
      <div className="mb-5">
        <BackButton href="/app" label="Home" />
      </div>
      <h1
        className="text-4xl mb-2"
        style={{ fontFamily: "var(--font-feather)", color: "var(--color-duo-green)" }}
      >
        Peta Petualangan
      </h1>
      <p className="mb-8 text-[var(--color-graphite)]">
        Taklukkan 6 Level Informatika. Selesaikan semua misi di satu Level untuk
        membuka Level berikutnya!
      </p>
      {locked ? (
        <div className="mb-6 rounded-2xl border-[3px] border-[var(--color-almost-black)] bg-[var(--color-sunshine)] px-5 py-4 text-sm font-bold text-[var(--color-almost-black)] shadow-[0_4px_0_var(--color-almost-black)]">
          🔒 Level itu masih terkunci. Selesaikan Level sebelumnya dulu, ya!
        </div>
      ) : null}
      <LevelMap groups={groups} />
    </div>
  );
}
