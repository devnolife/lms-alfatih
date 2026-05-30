import { prisma } from "@/lib/db";
import { getOnlineUsers, publish } from "@/lib/realtime";
import type { Role } from "@prisma/client";

export interface SessionAccess {
  sessionId: string;
  classId: string;
  className: string;
  title: string | null;
  status: "ACTIVE" | "ENDED";
  isTeacher: boolean;
}

/**
 * Returns session access info if the user may participate (class teacher/admin
 * or enrolled student), otherwise null. Central authorization gate reused by
 * every session endpoint.
 */
export async function getSessionAccess(
  sessionId: string,
  userId: string,
  role: Role
): Promise<SessionAccess | null> {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      title: true,
      class: { select: { id: true, name: true, teacherId: true } },
    },
  });
  if (!session) return null;

  const isTeacher =
    role === "ADMIN" || session.class.teacherId === userId;

  if (!isTeacher) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_classId: { userId, classId: session.class.id } },
    });
    if (!enrollment) return null;
  }

  return {
    sessionId: session.id,
    classId: session.class.id,
    className: session.class.name,
    title: session.title,
    status: session.status,
    isTeacher,
  };
}

export async function getActiveSessionForClass(
  classId: string
): Promise<string | null> {
  const s = await prisma.classSession.findFirst({
    where: { classId, status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  return s?.id ?? null;
}

/**
 * Starts (or reuses) an active session for a class. Only the class teacher or an
 * admin may start one. At most one ACTIVE session per class.
 */
export async function startSession(
  classId: string,
  userId: string,
  role: Role,
  title?: string
): Promise<{ ok: true; sessionId: string } | { ok: false; status: number; error: string }> {
  const klass = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });
  if (!klass) return { ok: false, status: 404, error: "Kelas tidak ditemukan." };
  if (role !== "ADMIN" && klass.teacherId !== userId) {
    return { ok: false, status: 403, error: "Hanya guru kelas yang bisa memulai sesi." };
  }

  const existing = await getActiveSessionForClass(classId);
  if (existing) return { ok: true, sessionId: existing };

  const created = await prisma.classSession.create({
    data: { classId, startedByUserId: userId, title: title ?? null },
    select: { id: true },
  });
  return { ok: true, sessionId: created.id };
}

export async function endSession(
  sessionId: string,
  userId: string,
  role: Role
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { status: true, class: { select: { teacherId: true } } },
  });
  if (!session) return { ok: false, status: 404, error: "Sesi tidak ditemukan." };
  if (role !== "ADMIN" && session.class.teacherId !== userId) {
    return { ok: false, status: 403, error: "Hanya guru kelas yang bisa mengakhiri sesi." };
  }
  if (session.status === "ENDED") return { ok: true };

  await prisma.classSession.update({
    where: { id: sessionId },
    data: { status: "ENDED", endedAt: new Date() },
  });
  return { ok: true };
}

export interface BoardRow {
  userId: string;
  displayName: string;
  xp: number;
  solvedCount: number;
  online: boolean;
}

/** Builds the live board: enrolled students with persisted XP + online flag. */
export async function getSessionBoard(
  sessionId: string,
  classId: string
): Promise<BoardRow[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    select: {
      user: {
        select: {
          id: true,
          displayName: true,
          xp: true,
          _count: { select: { completions: true } },
        },
      },
    },
  });

  const onlineIds = new Set(getOnlineUsers(sessionId).map((u) => u.userId));

  return enrollments
    .map((e) => ({
      userId: e.user.id,
      displayName: e.user.displayName,
      xp: e.user.xp,
      solvedCount: e.user._count.completions,
      online: onlineIds.has(e.user.id),
    }))
    .sort((a, b) => b.xp - a.xp);
}

/**
 * After a student's progress changes, push an updated board to every active
 * session of the classes they belong to. Best-effort and non-blocking.
 */
export async function broadcastUserActivity(userId: string): Promise<void> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { classId: true },
  });
  for (const { classId } of enrollments) {
    const sessionId = await getActiveSessionForClass(classId);
    if (!sessionId) continue;
    const board = await getSessionBoard(sessionId, classId);
    publish(sessionId, "board:update", { board });
  }
}
