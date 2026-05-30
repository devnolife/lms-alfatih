import { prisma } from "@/lib/db";

// Human-friendly join codes: uppercase, no ambiguous chars (0/O, 1/I).
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateJoinCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export interface TeacherClass {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
  activeSessionId: string | null;
  createdAt: Date;
}

export async function getTeacherClasses(
  teacherId: string
): Promise<TeacherClass[]> {
  const classes = await prisma.class.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      joinCode: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
      sessions: {
        where: { status: "ACTIVE" },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });
  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    joinCode: c.joinCode,
    createdAt: c.createdAt,
    studentCount: c._count.enrollments,
    activeSessionId: c.sessions[0]?.id ?? null,
  }));
}

export interface StudentClass {
  id: string;
  name: string;
  teacherName: string;
  activeSessionId: string | null;
}

export async function getStudentClasses(
  userId: string
): Promise<StudentClass[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    select: {
      class: {
        select: {
          id: true,
          name: true,
          teacher: { select: { displayName: true } },
          sessions: {
            where: { status: "ACTIVE" },
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });
  return enrollments.map((e) => ({
    id: e.class.id,
    name: e.class.name,
    teacherName: e.class.teacher.displayName,
    activeSessionId: e.class.sessions[0]?.id ?? null,
  }));
}

/** Creates a class with a unique join code, retrying on the rare collision. */
export async function createClass(teacherId: string, name: string) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const joinCode = generateJoinCode();
    const existing = await prisma.class.findUnique({ where: { joinCode } });
    if (existing) continue;
    return prisma.class.create({
      data: { name, teacherId, joinCode },
      select: { id: true, name: true, joinCode: true, createdAt: true },
    });
  }
  throw new Error("Gagal membuat kode kelas unik. Coba lagi.");
}

export type JoinResult =
  | { ok: true; classId: string; className: string }
  | { ok: false; reason: "not_found" | "already" };

export async function joinClassByCode(
  userId: string,
  joinCode: string
): Promise<JoinResult> {
  const klass = await prisma.class.findUnique({
    where: { joinCode: joinCode.toUpperCase() },
    select: { id: true, name: true },
  });
  if (!klass) return { ok: false, reason: "not_found" };

  const existing = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId, classId: klass.id } },
  });
  if (existing) return { ok: false, reason: "already" };

  await prisma.enrollment.create({ data: { userId, classId: klass.id } });
  return { ok: true, classId: klass.id, className: klass.name };
}
