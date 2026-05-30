import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSessionAccess } from "@/lib/sessions";
import { deleteDeliverable, updateDeliverable } from "@/lib/groupwork";

export const runtime = "nodejs";

async function resolveAccess(
  ctx: RouteContext<"/api/sessions/[id]/deliverables/[delId]">
) {
  const session = await readSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Tidak masuk." }, { status: 401 }) } as const;
  }

  const { id, delId } = await ctx.params;
  const access = await getSessionAccess(id, session.userId, session.role);
  if (!access) {
    return { error: NextResponse.json({ error: "Tidak punya akses." }, { status: 404 }) } as const;
  }
  return { error: null, session, access, delId } as const;
}

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/sessions/[id]/deliverables/[delId]">
) {
  const r = await resolveAccess(ctx);
  if (r.error) return r.error;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const result = await updateDeliverable(r.access, r.session.userId, r.delId, {
    content: body.content,
    teacherStatus: body.teacherStatus,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/sessions/[id]/deliverables/[delId]">
) {
  const r = await resolveAccess(ctx);
  if (r.error) return r.error;

  const result = await deleteDeliverable(r.access, r.session.userId, r.delId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
