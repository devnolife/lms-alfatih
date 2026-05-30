import { prisma } from "@/lib/db";

export interface LeaderboardRow {
  userId: string;
  displayName: string;
  xp: number;
  rank: number;
  isCurrentUser: boolean;
}

/**
 * Global school leaderboard: top students by total XP. Only STUDENT accounts
 * are ranked (teachers/admins excluded).
 */
export async function getGlobalLeaderboard(
  currentUserId?: string,
  limit = 10
): Promise<LeaderboardRow[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    take: limit,
    select: { id: true, displayName: true, xp: true },
  });
  return users.map((u, i) => ({
    userId: u.id,
    displayName: u.displayName,
    xp: u.xp,
    rank: i + 1,
    isCurrentUser: u.id === currentUserId,
  }));
}

/**
 * Per-class leaderboard: enrolled students ranked by total XP. Used on the
 * teacher dashboard and the student class view.
 */
export async function getClassLeaderboard(
  classId: string,
  currentUserId?: string
): Promise<LeaderboardRow[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    select: { user: { select: { id: true, displayName: true, xp: true } } },
  });
  return enrollments
    .map((e) => e.user)
    .sort((a, b) => b.xp - a.xp || a.displayName.localeCompare(b.displayName))
    .map((u, i) => ({
      userId: u.id,
      displayName: u.displayName,
      xp: u.xp,
      rank: i + 1,
      isCurrentUser: u.id === currentUserId,
    }));
}
