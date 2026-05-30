import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import {
  createClass,
  getStudentClasses,
  getTeacherClasses,
} from "@/lib/classes";

export const runtime = "nodejs";

const MAX_NAME = 80;

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }
  if (session.role === "TEACHER" || session.role === "ADMIN") {
    const classes = await getTeacherClasses(session.userId);
    return NextResponse.json({ role: "teacher", classes });
  }
  const classes = await getStudentClasses(session.userId);
  return NextResponse.json({ role: "student", classes });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }
  if (session.role !== "TEACHER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Hanya guru yang bisa membuat kelas." },
      { status: 403 }
    );
  }

  const limited = await rateLimit(`class-create:${session.userId}`, 20, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }
  const { name } = (body || {}) as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Nama kelas wajib." }, { status: 400 });
  }
  if (name.length > MAX_NAME) {
    return NextResponse.json({ error: "Nama kelas terlalu panjang." }, { status: 400 });
  }

  const klass = await createClass(session.userId, name.trim());
  return NextResponse.json({ ok: true, class: klass }, { status: 201 });
}
