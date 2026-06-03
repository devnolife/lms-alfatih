import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TestPlayer from "@/components/test/TestPlayer";

export const metadata = { title: "Pre-Test · FunPython" };

export default async function PreTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/test/pre");

  // Teachers/admins skip tests
  if (user.role === "TEACHER" || user.role === "ADMIN") {
    redirect("/app");
  }

  // Already completed?
  const existing = await prisma.testAttempt.findUnique({
    where: { userId_type: { userId: user.id, type: "PRE" } },
    select: { id: true },
  });
  if (existing) redirect("/app");

  return (
    <div className="min-h-screen bg-[var(--color-ice)]">
      <TestPlayer type="PRE" />
    </div>
  );
}
