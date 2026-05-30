import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
  const limited = await rateLimit(`login:${ip}`, 20, 60 * 5);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu banyak percobaan." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const { username, password } = (body || {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username & password wajib." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Username atau password salah." },
      { status: 401 }
    );
  }

  await createSession({ userId: user.id, username: user.username, role: user.role });
  return NextResponse.json({
    ok: true,
    user: { id: user.id, username: user.username, role: user.role },
  });
}
