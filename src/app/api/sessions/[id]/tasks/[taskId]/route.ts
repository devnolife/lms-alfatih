import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSessionAccess } from "@/lib/sessions";
import { deleteTask, updateTask } from "@/lib/groupwork";

export const runtime = "nodejs";

async function resolveAccess(
  ctx: RouteContext<"/api/sessions/[id]/tasks/[taskId]">
) {
  const session = await readSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Tidak masuk." }, { status: 401 }) } as const;
  }

  const { id, taskId } = await ctx.params;
  const access = await getSessionAccess(id, session.userId, session.role);
  if (!access) {
    return { error: NextResponse.json({ error: "Tidak punya akses." }, { status: 404 }) } as const;
  }
  return { error: null, session, access, taskId } as const;
}

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/sessions/[id]/tasks/[taskId]">
) {
  const r = await resolveAccess(ctx);
  if (r.error) return r.error;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const result = await updateTask(r.access, r.session.userId, r.taskId, {
    status: body.status,
    claim: body.claim,
    title: body.title,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/sessions/[id]/tasks/[taskId]">
) {
  const r = await resolveAccess(ctx);
  if (r.error) return r.error;

  const result = await deleteTask(r.access, r.session.userId, r.taskId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
