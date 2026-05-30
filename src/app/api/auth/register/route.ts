import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashPassword,
  isValidPassword,
  isValidUsername,
} from "@/lib/auth";
import { rateLimit } from "@/lib/redis";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
  const limited = await rateLimit(`register:${ip}`, 10, 60 * 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu banyak percobaan." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const { username, password, displayName, role } = (body || {}) as Record<
    string,
    unknown
  >;

  if (typeof username !== "string" || !isValidUsername(username)) {
    return NextResponse.json({ error: "Username tidak valid." }, { status: 400 });
  }
  if (typeof password !== "string" || !isValidPassword(password)) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter." },
      { status: 400 }
    );
  }
  if (typeof displayName !== "string" || displayName.trim().length < 1) {
    return NextResponse.json({ error: "Nama tampil wajib diisi." }, { status: 400 });
  }
  const safeRole = role === "TEACHER" ? "TEACHER" : "STUDENT";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah dipakai." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      username,
      displayName: displayName.trim().slice(0, 64),
      passwordHash: await hashPassword(password),
      role: safeRole,
    },
    select: { id: true, username: true, role: true },
  });

  await createSession({ userId: user.id, username: user.username, role: user.role });
  return NextResponse.json({ ok: true, user });
}
