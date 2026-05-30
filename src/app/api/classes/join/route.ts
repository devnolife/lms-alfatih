import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { joinClassByCode } from "@/lib/classes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const limited = await rateLimit(`class-join:${session.userId}`, 20, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const { joinCode } = (body || {}) as Record<string, unknown>;
  if (typeof joinCode !== "string" || joinCode.trim().length === 0) {
    return NextResponse.json({ error: "Kode kelas wajib." }, { status: 400 });
  }

  const result = await joinClassByCode(session.userId, joinCode.trim());
  if (!result.ok) {
    if (result.reason === "not_found") {
      return NextResponse.json(
        { error: "Kode kelas tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Kamu sudah bergabung di kelas ini." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    classId: result.classId,
    className: result.className,
  });
}
