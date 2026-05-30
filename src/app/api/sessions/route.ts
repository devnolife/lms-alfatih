import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { startSession } from "@/lib/sessions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }
  if (session.role !== "TEACHER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Hanya guru yang bisa memulai sesi." },
      { status: 403 }
    );
  }

  const limited = await rateLimit(`session-start:${session.userId}`, 30, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const { classId, title } = (body || {}) as Record<string, unknown>;
  if (typeof classId !== "string" || classId.trim().length === 0) {
    return NextResponse.json({ error: "classId wajib." }, { status: 400 });
  }

  const result = await startSession(
    classId,
    session.userId,
    session.role,
    typeof title === "string" ? title.trim().slice(0, 120) : undefined
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, sessionId: result.sessionId });
}
