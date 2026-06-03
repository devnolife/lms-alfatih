import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurriculum } from "@/lib/curriculum";
import TestPlayer from "@/components/test/TestPlayer";

export const metadata = { title: "Post-Test · FunPython" };

export default async function PostTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/test/post");

  // Teachers/admins skip tests
  if (user.role === "TEACHER" || user.role === "ADMIN") {
    redirect("/app");
  }

  // Already completed?
  const existing = await prisma.testAttempt.findUnique({
    where: { userId_type: { userId: user.id, type: "POST" } },
    select: { id: true },
  });
  if (existing) redirect("/app");

  // Must have completed ALL levels first
  const groups = await getCurriculum(user.id);
  const allDone = groups.every((g) => g.state === "done" || g.state === "empty");
  if (!allDone) {
    redirect("/app?postlocked=1");
  }

  return (
    <div className="min-h-screen bg-[var(--color-ice)]">
      <TestPlayer type="POST" />
    </div>
  );
}
