import { prisma } from "@/lib/db";

/**
 * Returns true if the user has completed the pre-test.
 * Teachers/admins are exempt (always returns true).
 */
export async function hasCompletedPreTest(
  userId: string,
  role: string
): Promise<boolean> {
  if (role === "TEACHER" || role === "ADMIN") return true;
  const attempt = await prisma.testAttempt.findUnique({
    where: { userId_type: { userId, type: "PRE" } },
    select: { id: true },
  });
  return Boolean(attempt);
}
