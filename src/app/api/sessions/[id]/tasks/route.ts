import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { getSessionAccess } from "@/lib/sessions";
import { createTask } from "@/lib/groupwork";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/sessions/[id]/tasks">
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Tidak masuk." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const access = await getSessionAccess(id, session.userId, session.role);
  if (!access) {
    return NextResponse.json({ error: "Tidak punya akses." }, { status: 404 });
  }

  const limited = await rateLimit(`task-create:${session.userId}`, 60, 60);
  if (!limited.ok) {
    return NextResponse.json({ error: "Terlalu cepat." }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const result = await createTask(access, session.userId, body.title);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, taskId: result.taskId });
}
