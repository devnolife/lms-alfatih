import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeachingGuide, buildLevelSlides } from "@/lib/teaching";
import PresentDeck from "@/components/teaching/PresentDeck";

export default async function PresentLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelParam } = await params;
  const level = Number(levelParam);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/dashboard/present/${levelParam}`);
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/app");

  if (!Number.isInteger(level)) notFound();

  const guide = await getTeachingGuide();
  const levelGuide = guide.find((g) => g.meta.level === level);
  if (!levelGuide) notFound();

  const slides = buildLevelSlides(levelGuide);

  return (
    <PresentDeck
      slides={slides}
      levelTitle={`Level ${levelGuide.meta.level} · ${levelGuide.meta.title}`}
      color={levelGuide.meta.color}
      backHref="/dashboard/materials"
      variant="presenter"
      channelKey={`funpython-present-${levelGuide.meta.level}`}
      audienceHref={`/dashboard/present/${levelGuide.meta.level}/layar`}
    />
  );
}
